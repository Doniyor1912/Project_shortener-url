from rest_framework import serializers
from .models import Shortened_db
import environ

env = environ.Env()

class ShortenedURLSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shortened_db
        fields = ('origin_url',)




class ShortUrlDetailSerializer(serializers.ModelSerializer):
    shorten_url = serializers.SerializerMethodField()
    status = serializers.IntegerField(required=True)
    created_at = serializers.SerializerMethodField()  # ✅ Custom field for date formatting


    Domain = env.str('DOMAIN',"")

    class Meta:
        model = Shortened_db
        fields = '__all__'
        extra_kwargs = {
            'id': {'read_only': True},
            'shorten_url': {'read_only': True},
            'origin_url': {'read_only': True},
            'clicks': {'read_only': True},
            'created_at': {'read_only': True},
            'last_accessed': {'read_only': True},
            'user': {'read_only': True},
        }

    def get_created_at(self, obj):
        print(obj.created_at.date())
        return obj.created_at.date()  # Returns only the date part


    def get_shorten_url(self, obj):
        return self.Domain + obj.shorten_url

    def validate_status(self, value):
        if value not in [0, 1]:
            raise serializers.ValidationError("Invalid status. Must be 0 (Inactive) or 1 (Active).")
        return value

