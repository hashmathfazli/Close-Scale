# pyrefly: ignore [missing-import]
from django.http import FileResponse, JsonResponse
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import Assessment, Document, FollowUp, Interaction, Lead, LeadHistory, LeadNote, ProjectQueueItem
from .serializers import (AssessmentSerializer, DocumentSerializer, DocumentUploadSerializer, FollowUpSerializer, InteractionSerializer, LeadHistorySerializer, LeadNoteSerializer, LeadSerializer, ProjectQueueItemSerializer)
from users.permissions import IsAdminUser


def home(request) -> JsonResponse:
    """Root API endpoint."""
    return JsonResponse({"message": "Close-Scale API is running."})


def health_check(request) -> JsonResponse:
    """
    Health check endpoint polled by Render to verify the service is alive.
    Returns HTTP 200 when Django and the database are reachable.
    """
    # pyrefly: ignore [missing-import]
    from django.db import connection

    try:
        connection.ensure_connection()
        db_status = "ok"
    except Exception:
        db_status = "unavailable"

    return JsonResponse(
        {
            "status": "ok" if db_status == "ok" else "degraded",
            "database": db_status,
        },
        status=200 if db_status == "ok" else 503,
    )


# ── Document Views ─────────────────────────────────────────────────────────────

class DocumentUploadView(APIView):
    """
    POST /api/documents/
    Upload a file and link it to a CRM entity.
    Accepts multipart/form-data.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request: Request) -> Response:
        serializer = DocumentUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = serializer.validated_data["file"]
        doc = serializer.save(
            uploaded_by=request.user,
            file_name=uploaded_file.name,
            file_type=getattr(uploaded_file, "content_type", ""),
            file_size=uploaded_file.size,
        )
        return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)


class DocumentListView(APIView):
    """
    GET /api/documents/
    List documents, optionally filtered by entity.

    Query params: ?lead=<id>  ?deal=<id>  ?contact=<id>  ?project=<id>
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        qs = Document.objects.select_related("uploaded_by")

        # Apply entity filters
        if lead_id := request.query_params.get("lead"):
            qs = qs.filter(related_lead_id=lead_id)
        elif deal_id := request.query_params.get("deal"):
            qs = qs.filter(related_deal_id=deal_id)
        elif contact_id := request.query_params.get("contact"):
            qs = qs.filter(related_contact_id=contact_id)
        elif project_id := request.query_params.get("project"):
            qs = qs.filter(related_project_id=project_id)

        serializer = DocumentSerializer(qs, many=True)
        return Response(serializer.data)


class DocumentDownloadView(APIView):
    """
    GET /api/documents/{id}/download/
    Stream the document file to the client.
    Only the uploader, Admins, and (future) entity participants may download.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request, pk: int) -> Response:
        try:
            doc = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response({"detail": "Document not found."}, status=status.HTTP_404_NOT_FOUND)

        # Basic access check: uploader or Admin
        if doc.uploaded_by != request.user and request.user.role != "ADMIN":
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        try:
            return FileResponse(
                doc.file.open("rb"),
                as_attachment=True,
                filename=doc.file_name,
            )
        except Exception:
            return Response(
                {"detail": "File could not be retrieved."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DocumentDeleteView(APIView):
    """
    DELETE /api/documents/{id}/
    Delete the document record and its file. Uploader or Admin only.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request: Request, pk: int) -> Response:
        try:
            doc = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response({"detail": "Document not found."}, status=status.HTTP_404_NOT_FOUND)

        # Only uploader or Admin may delete
        if doc.uploaded_by != request.user and request.user.role != "ADMIN":
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        # Delete file from Cloudinary storage then remove the DB record
        doc.file.delete(save=False)
        doc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def can_manage_leads(user) -> bool:
    return user.role in ("ADMIN", "SALES_MANAGER")


def visible_leads(user):
    if can_manage_leads(user):
        return Lead.objects.all()
    if user.role == "SALES_REP":
        return Lead.objects.filter(assigned_to=user)
    assessment_type = "TECHNICAL" if user.role == "TECH_LEAD" else "FINANCIAL"
    return Lead.objects.filter(assessments__assessment_type=assessment_type).distinct()


class DashboardView(APIView):
    """Return dashboard figures calculated from records visible to the user."""
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        user = request.user
        leads = visible_leads(user)
        now = timezone.now()
        week_ago = now - timezone.timedelta(days=7)
        open_leads = leads.exclude(status__in=[Lead.Status.REJECTED, Lead.Status.PROJECT_QUEUE])
        pipeline_value = open_leads.aggregate(total=Sum("budget"))["total"] or 0
        follow_ups = FollowUp.objects.filter(lead__in=leads, assigned_to=user, completed_at__isnull=True, cancelled_at__isnull=True)
        pending_assessments = Assessment.objects.filter(lead__in=leads, status=Assessment.Status.REQUESTED)

        def money(value):
            return f"${value:,.0f}"

        if user.role == "SALES_REP":
            stats = [
                {"label": "Open opportunities", "value": str(open_leads.count()), "trend": f"{leads.filter(created_at__gte=week_ago).count()} added this week", "positive": True},
                {"label": "Pipeline value", "value": money(pipeline_value), "trend": "Based on recorded budgets", "positive": True},
                {"label": "Follow-ups due", "value": str(follow_ups.count()), "trend": f"{follow_ups.filter(due_at__lte=now).count()} overdue", "positive": False},
                {"label": "Qualified leads", "value": str(leads.filter(status=Lead.Status.QUALIFIED).count()), "trend": "Ready for assessment", "positive": True},
            ]
            focus = {"title": "Your next priority", "value": "Keep follow-ups current to move opportunities forward."}
        elif user.role in ("TECH_LEAD", "FINANCE_OFFICER"):
            assessment_type = "TECHNICAL" if user.role == "TECH_LEAD" else "FINANCIAL"
            role_assessments = Assessment.objects.filter(lead__in=leads, assessment_type=assessment_type)
            stats = [
                {"label": "Assessments requested", "value": str(role_assessments.filter(status=Assessment.Status.REQUESTED).count()), "trend": "Awaiting your review", "positive": False},
                {"label": "Completed reviews", "value": str(role_assessments.filter(status=Assessment.Status.SUBMITTED).count()), "trend": "Recorded in the workspace", "positive": True},
                {"label": "Leads under review", "value": str(leads.filter(status=Lead.Status.ASSESSMENT).count()), "trend": "Cross-functional assessment", "positive": False},
                {"label": "Approved handoffs", "value": str(leads.filter(status__in=[Lead.Status.APPROVED, Lead.Status.PROJECT_QUEUE]).count()), "trend": "Ready or sent to delivery", "positive": True},
            ]
            focus = {"title": "Review queue", "value": f"{role_assessments.filter(status=Assessment.Status.REQUESTED).count()} assessment(s) need a decision."}
        else:
            stats = [
                {"label": "Active opportunities", "value": str(open_leads.count()), "trend": f"{leads.filter(created_at__gte=week_ago).count()} added this week", "positive": True},
                {"label": "Pipeline value", "value": money(pipeline_value), "trend": "From active lead budgets", "positive": True},
                {"label": "Awaiting assessments", "value": str(pending_assessments.count()), "trend": "Technical or financial review", "positive": False},
                {"label": "Project handoffs", "value": str(leads.filter(status=Lead.Status.PROJECT_QUEUE).count()), "trend": "Sent to delivery queue", "positive": True},
            ]
            focus = {"title": "Pipeline focus", "value": f"{leads.filter(status=Lead.Status.ASSESSMENT).count()} opportunity(s) are currently being assessed."}

        rows = [{"account": lead.company, "contact": lead.name, "status": lead.get_status_display(), "value": money(lead.budget) if lead.budget is not None else "Budget not recorded", "owner": lead.assigned_to.full_name if lead.assigned_to else "Unassigned"} for lead in leads.select_related("assigned_to").order_by("-updated_at")[:5]]
        monthly = []
        for offset in range(5, -1, -1):
            month = (now.replace(day=1) - timezone.timedelta(days=offset * 28)).replace(day=1)
            next_month = (month + timezone.timedelta(days=32)).replace(day=1)
            monthly.append({"label": month.strftime("%b"), "value": leads.filter(created_at__gte=month, created_at__lt=next_month).count()})
        return Response({"stats": stats, "focus": focus, "recent_leads": rows, "monthly_activity": monthly})


class LeadViewSet(ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return visible_leads(self.request.user).select_related("assigned_to", "created_by")

    def perform_create(self, serializer):
        if not can_manage_leads(self.request.user):
            raise PermissionDenied("Only Sales Managers can create leads.")
        lead = serializer.save(created_by=self.request.user)
        LeadHistory.objects.create(lead=lead, actor=self.request.user, action="CREATED", detail="Lead created")

    def perform_update(self, serializer):
        lead = self.get_object()
        if not can_manage_leads(self.request.user) and lead.assigned_to != self.request.user:
            raise PermissionDenied("You can only update your assigned leads.")
        prior_status = lead.status
        lead = serializer.save()
        if lead.status != prior_status:
            LeadHistory.objects.create(lead=lead, actor=self.request.user, action="STATUS_UPDATED", detail=f"{prior_status} → {lead.status}")

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        if not can_manage_leads(request.user): raise PermissionDenied("Only Sales Managers can assign leads.")
        lead = self.get_object(); assignee_id = request.data.get("assigned_to")
        if not assignee_id: raise ValidationError({"assigned_to": "This field is required."})
        from users.models import User
        assignee = get_object_or_404(User, pk=assignee_id, role="SALES_REP")
        lead.assigned_to = assignee; lead.save(update_fields=["assigned_to", "updated_at"])
        LeadHistory.objects.create(lead=lead, actor=request.user, action="ASSIGNED", detail=f"Assigned to {assignee.full_name}")
        return Response(self.get_serializer(lead).data)

    @action(detail=True, methods=["post"])
    def request_assessment(self, request, pk=None):
        if not can_manage_leads(request.user): raise PermissionDenied("Only Sales Managers can request assessments.")
        lead = self.get_object(); assessment_type = request.data.get("assessment_type")
        if assessment_type not in Assessment.Type.values: raise ValidationError({"assessment_type": "TECHNICAL or FINANCIAL is required."})
        assessment, created = Assessment.objects.get_or_create(lead=lead, assessment_type=assessment_type, defaults={"requested_by": request.user})
        if not created: raise ValidationError("This assessment has already been requested.")
        lead.status = Lead.Status.ASSESSMENT; lead.save(update_fields=["status", "updated_at"])
        LeadHistory.objects.create(lead=lead, actor=request.user, action="ASSESSMENT_REQUESTED", detail=assessment_type)
        return Response(AssessmentSerializer(assessment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def decide(self, request, pk=None):
        if not can_manage_leads(request.user): raise PermissionDenied("Only Sales Managers can approve or reject deals.")
        lead = self.get_object(); decision = request.data.get("decision")
        if decision not in (Lead.Status.APPROVED, Lead.Status.REJECTED): raise ValidationError({"decision": "APPROVED or REJECTED is required."})
        if decision == Lead.Status.APPROVED and lead.assessments.filter(status=Assessment.Status.SUBMITTED).count() < 2: raise ValidationError("Both assessments must be submitted before approval.")
        lead.status = decision; lead.save(update_fields=["status", "updated_at"])
        LeadHistory.objects.create(lead=lead, actor=request.user, action="DEAL_DECISION", detail=decision)
        return Response(self.get_serializer(lead).data)

    @action(detail=True, methods=["post"])
    def send_to_project_queue(self, request, pk=None):
        if not can_manage_leads(request.user): raise PermissionDenied("Only Sales Managers can send deals to the project queue.")
        lead = self.get_object()
        if lead.status != Lead.Status.APPROVED: raise ValidationError("Only approved deals can enter the project queue.")
        item, created = ProjectQueueItem.objects.get_or_create(lead=lead, defaults={"sent_by": request.user})
        if not created: raise ValidationError("This deal is already in the project queue.")
        lead.status = Lead.Status.PROJECT_QUEUE; lead.save(update_fields=["status", "updated_at"])
        LeadHistory.objects.create(lead=lead, actor=request.user, action="PROJECT_QUEUE", detail="Sent to project queue")
        return Response(ProjectQueueItemSerializer(item).data, status=status.HTTP_201_CREATED)


class LeadHistoryViewSet(ModelViewSet):
    serializer_class = LeadHistorySerializer; permission_classes = [IsAuthenticated]; http_method_names = ["get"]
    def get_queryset(self): return LeadHistory.objects.filter(lead__in=visible_leads(self.request.user)).select_related("actor")


class LeadScopedViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    def permitted_lead(self, lead_id): return get_object_or_404(visible_leads(self.request.user), pk=lead_id)


class InteractionViewSet(LeadScopedViewSet):
    serializer_class = InteractionSerializer
    def get_queryset(self): return Interaction.objects.filter(lead__in=visible_leads(self.request.user)).select_related("recorded_by")
    def perform_create(self, serializer):
        lead = self.permitted_lead(self.request.data.get("lead")); serializer.save(recorded_by=self.request.user); LeadHistory.objects.create(lead=lead, actor=self.request.user, action="INTERACTION_RECORDED", detail="Communication recorded")


class FollowUpViewSet(LeadScopedViewSet):
    serializer_class = FollowUpSerializer
    def get_queryset(self): return FollowUp.objects.filter(lead__in=visible_leads(self.request.user)).select_related("assigned_to")
    def perform_create(self, serializer):
        lead = self.permitted_lead(self.request.data.get("lead")); serializer.save(created_by=self.request.user); LeadHistory.objects.create(lead=lead, actor=self.request.user, action="FOLLOW_UP_SCHEDULED", detail="Follow-up scheduled")
    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        follow_up = self.get_object(); follow_up.completed_at = timezone.now(); follow_up.save(update_fields=["completed_at"]); return Response(self.get_serializer(follow_up).data)
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        follow_up = self.get_object(); follow_up.cancelled_at = timezone.now(); follow_up.save(update_fields=["cancelled_at"]); return Response(self.get_serializer(follow_up).data)


class LeadNoteViewSet(LeadScopedViewSet):
    serializer_class = LeadNoteSerializer
    def get_queryset(self): return LeadNote.objects.filter(lead__in=visible_leads(self.request.user)).select_related("author")
    def perform_create(self, serializer): self.permitted_lead(self.request.data.get("lead")); serializer.save(author=self.request.user)


class AssessmentViewSet(LeadScopedViewSet):
    serializer_class = AssessmentSerializer
    http_method_names = ["get", "post"]
    def get_queryset(self): return Assessment.objects.filter(lead__in=visible_leads(self.request.user)).select_related("assessor")
    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        assessment = self.get_object(); expected_role = "TECH_LEAD" if assessment.assessment_type == Assessment.Type.TECHNICAL else "FINANCE_OFFICER"
        if request.user.role != expected_role: raise PermissionDenied("You are not assigned to submit this assessment.")
        assessment.findings = request.data.get("findings", assessment.findings); assessment.risks = request.data.get("risks", assessment.risks); assessment.recommendation = request.data.get("recommendation", assessment.recommendation); assessment.assessor = request.user; assessment.status = Assessment.Status.SUBMITTED; assessment.submitted_at = timezone.now(); assessment.save()
        LeadHistory.objects.create(lead=assessment.lead, actor=request.user, action="ASSESSMENT_SUBMITTED", detail=assessment.assessment_type)
        return Response(self.get_serializer(assessment).data)
