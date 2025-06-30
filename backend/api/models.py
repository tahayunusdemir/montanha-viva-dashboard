from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Message(models.Model):
    content = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')

    def __str__(self):
        return f'Message from {self.author.username} at {self.created_at}'
