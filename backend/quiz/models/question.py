from django.db import models

class Question(models.Model):
    song = models.ForeignKey('Song', on_delete=models.CASCADE)
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name='questions')
    created_at = models.DateTimeField(auto_now_add=True)
    answered_correctly = models.BooleanField(default=False)
