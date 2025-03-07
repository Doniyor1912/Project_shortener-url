import random
import string

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from config.settings import Length


class Shortened_db(models.Model):
    shorten_url = models.CharField(max_length=20, unique=True)
    origin_url = models.URLField(max_length=500)
    clicks = models.IntegerField(default=0)
    status = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(default=timezone.now)
    last_accessed = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False)

    def __str__(self):
        return f"{self.origin_url} -> {self.shorten_url}"

    def generate_short_url(self):
        characters = string.ascii_letters + string.digits
        while True:
            shorten_url = ''.join(random.choices(characters, k=Length))
            if not Shortened_db.objects.filter(shorten_url=shorten_url).exists():
                return shorten_url

    def save(self, *args, **kwargs):
        if not self.shorten_url:
            self.shorten_url = self.generate_short_url()
        super().save(*args, **kwargs)

    def check_status(self):
        if self.last_accessed and (timezone.now() - self.last_accessed).days > 7:
            self.status = 0
            self.save()
