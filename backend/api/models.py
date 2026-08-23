"""
Models for the core API app.

Currently contains:
  - Document — generic file attachment linked to any CRM entity.

Note on entity links:
  The FK fields for Lead, Deal, Contact, and Project are stored as plain
  PositiveIntegerFields now.  They will be converted to proper ForeignKeys
  when those apps (Epic 2–7) are created and their migrations run.
"""

from django.conf import settings
from django.db import models


class Document(models.Model):
    """
    A file uploaded and linked to a CRM entity (Lead, Deal, Contact, or Project).

    Storage is handled by Cloudinary via ``cloudinary_storage`` (configured in
    ``settings.STORAGES["default"]``).  The ``file_type`` field is populated
    from the uploaded file's content type in the view.
    """

    # ── File payload ──────────────────────────────────────────────────
    file = models.FileField(upload_to="documents/%Y/%m/")
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100, blank=True)
    file_size = models.PositiveIntegerField(help_text="File size in bytes.")

    # ── Ownership ─────────────────────────────────────────────────────
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="documents",
    )

    # ── Entity links (plain IDs until the target apps are created) ────
    # These will be migrated to ForeignKeys in Epic 2–7 migrations.
    related_lead_id = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    related_deal_id = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    related_contact_id = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    related_project_id = models.PositiveIntegerField(null=True, blank=True, db_index=True)

    # ── Timestamps ────────────────────────────────────────────────────
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = "Document"
        verbose_name_plural = "Documents"

    def __str__(self) -> str:
        return f"{self.file_name} (uploaded by {self.uploaded_by})"


class Lead(models.Model):
    class Status(models.TextChoices):
        NEW = "NEW", "New"
        CONTACTED = "CONTACTED", "Contacted"
        QUALIFIED = "QUALIFIED", "Qualified"
        ASSESSMENT = "ASSESSMENT", "Assessment"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        PROJECT_QUEUE = "PROJECT_QUEUE", "Project queue"

    name = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    requirements = models.TextField(blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    timeline = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_leads")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_leads")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.company} — {self.name}"


class LeadHistory(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="history")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=100)
    detail = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Interaction(models.Model):
    class Kind(models.TextChoices):
        CALL = "CALL", "Call"
        MEETING = "MEETING", "Meeting"
        EMAIL = "EMAIL", "Email"
        OTHER = "OTHER", "Other"

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="interactions")
    kind = models.CharField(max_length=20, choices=Kind.choices)
    summary = models.TextField()
    occurred_at = models.DateTimeField()
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)


class FollowUp(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="follow_ups")
    title = models.CharField(max_length=255)
    due_at = models.DateTimeField()
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="follow_ups")
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_follow_ups")

    class Meta:
        ordering = ["due_at"]


class LeadNote(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="notes")
    body = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)


class Assessment(models.Model):
    class Type(models.TextChoices):
        TECHNICAL = "TECHNICAL", "Technical"
        FINANCIAL = "FINANCIAL", "Financial"
    class Status(models.TextChoices):
        REQUESTED = "REQUESTED", "Requested"
        SUBMITTED = "SUBMITTED", "Submitted"

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="assessments")
    assessment_type = models.CharField(max_length=20, choices=Type.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REQUESTED)
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="requested_assessments")
    assessor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="assessments")
    findings = models.TextField(blank=True)
    risks = models.TextField(blank=True)
    recommendation = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["lead", "assessment_type"], name="unique_lead_assessment_type")]


class ProjectQueueItem(models.Model):
    lead = models.OneToOneField(Lead, on_delete=models.CASCADE, related_name="project_queue_item")
    sent_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    sent_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="QUEUED")
