import random
import string
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from config.settings import Length

class ShortenedURL(models.Model):
    short_link = models.CharField(max_length=20, unique=True)
    original_link = models.URLField(max_length=500)
    clicks = models.IntegerField(default=0)
    status = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False)


    def generate_short_url(self):
        characters = string.ascii_letters + string.digits
        while True:
            short_link = ''.join(random.choices(characters, k=Length))
            if not ShortenedURL.objects.filter(short_link=short_link).exists():
                return short_link

    def save(self, *args, **kwargs):
        if not self.short_link:
            self.short_link = self.generate_short_url()
        super().save(*args, **kwargs)

    # for ordering by date:
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        user_info = f"by {self.user.username}" if self.user else "by Anonymous"
        return f"{self.short_link} -> {self.original_link} ({user_info})"
