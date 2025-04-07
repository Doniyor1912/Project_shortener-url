from rest_framework import serializers
from .models import ShortenedURL
import environ

env = environ.Env()


class ShortenedURLSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShortenedURL
        fields = ('original_link',)
        extra_kwargs = {
            'original_link': {'required': True}
        }




class ShortUrlDetailSerializer(serializers.ModelSerializer):
    short_link = serializers.SerializerMethodField()
    user = serializers.StringRelatedField()
    Domain = env.str("DOMAIN","")
    class Meta:
        model = ShortenedURL
        fields = '__all__'
        read_only_fields = ['short_link', 'clicks', 'created_at', 'user']

    def get_short_link(self, obj):
        return self.Domain + obj.short_link


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShortenedURL
        fields = ['status']
        read_only_fields = ['user']