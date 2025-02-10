from rest_framework import serializers
from .models import Shortened_db

class ShortenedURLSerializer(serializers.ModelSerializer):

    class Meta:
        model = Shortened_db
        fields = ('origin_url', 'shorten_url', 'clicks', 'status', 'created_at')
        read_only_fields = ('shorten_url', 'clicks', 'status', 'created_at')
