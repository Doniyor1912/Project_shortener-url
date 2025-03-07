from django.shortcuts import redirect
from django.utils.timezone import now
from rest_framework import generics, status, serializers, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import GenericViewSet

from .models import Shortened_db
from .paginations import BasePagination
from .serializers import ShortenedURLSerializer, ShortUrlDetailSerializer
from rest_framework.response import Response


class URLShortener(generics.CreateAPIView):
    queryset = Shortened_db.objects.all()
    serializer_class = ShortenedURLSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def validate_origin_url(self, value):
        existing_entry = Shortened_db.objects.filter(origin_url=value).first()
        if existing_entry:
            raise serializers.ValidationError(f"This URL is already shortened: {existing_entry.shorten_url}")
        return value


class RedirectShortURLView(generics.RetrieveAPIView):
    queryset = Shortened_db.objects.all()
    serializer_class = ShortUrlDetailSerializer
    lookup_field = "shorten_url"
    pagination_class = BasePagination

    def retrieve(self, request, shorten_url):
        try:
            url_instance = Shortened_db.objects.get(shorten_url=shorten_url)
        except Shortened_db.DoesNotExist:
            return Response({"error": "Shortened URL not found."}, status=status.HTTP_404_NOT_FOUND)

        url_instance.check_status()
        if not url_instance.status:
            return Response({"error": "This short URL is inactive."}, status=410)


        url_instance.clicks += 1
        url_instance.last_accessed = now()
        url_instance.save()
        return redirect(url_instance.origin_url)



class URLDetails(mixins.CreateModelMixin,
                   mixins.RetrieveModelMixin,
                   mixins.UpdateModelMixin,
                   mixins.DestroyModelMixin,
                   mixins.ListModelMixin,
                   GenericViewSet):
    serializer_class = ShortUrlDetailSerializer
    pagination_class = BasePagination
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Shortened_db.objects.filter(user=self.request.user).order_by('-created_at')

    def put(self, request, *args, **kwargs):
        print("Received Data:", request.data)
        return self.update(request, *args, partial=True)













