from django.urls import path
from .views import (
    FeedbackListCreateView,
    AdminFeedbackListView,
    AdminFeedbackDetailView,
)

urlpatterns = [
    path("", FeedbackListCreateView.as_view(), name="feedback-list-create"),
    path("admin/", AdminFeedbackListView.as_view(), name="admin-feedback-list"),
    path(
        "admin/<int:pk>/",
        AdminFeedbackDetailView.as_view(),
        name="admin-feedback-detail",
    ),
]
