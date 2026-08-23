"""URL patterns for the core api app."""

# pyrefly: ignore [missing-import]
from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("leads", views.LeadViewSet, basename="lead")
router.register("lead-history", views.LeadHistoryViewSet, basename="lead-history")
router.register("interactions", views.InteractionViewSet, basename="interaction")
router.register("follow-ups", views.FollowUpViewSet, basename="follow-up")
router.register("lead-notes", views.LeadNoteViewSet, basename="lead-note")
router.register("assessments", views.AssessmentViewSet, basename="assessment")

urlpatterns = [
    # ── Utility ───────────────────────────────────────────────────────
    path("", views.home, name="home"),
    path("health/", views.health_check, name="health-check"),
    path("dashboard/", views.DashboardView.as_view(), name="dashboard"),

    # ── Documents (F9.1) ──────────────────────────────────────────────
    path("documents/", views.DocumentListView.as_view(), name="document-list"),
    path("documents/upload/", views.DocumentUploadView.as_view(), name="document-upload"),
    path("documents/<int:pk>/download/", views.DocumentDownloadView.as_view(), name="document-download"),
    path("documents/<int:pk>/", views.DocumentDeleteView.as_view(), name="document-delete"),
]

urlpatterns += router.urls
