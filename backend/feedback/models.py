from django.db import models
from django.conf import settings


class Feedback(models.Model):
    CATEGORY_CHOICES = [
        ("general", "General Inquiry"),
        ("bug", "Bug Report"),
        ("feature", "Feature Request"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True
    )
    name = models.CharField(max_length=100, blank=True, null=True)
    surname = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    category = models.CharField(
        max_length=20, choices=CATEGORY_CHOICES, default="general"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    document = models.FileField(upload_to="feedback_documents/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subject} by {self.name} {self.surname}"
