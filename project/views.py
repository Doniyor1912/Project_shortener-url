from django.db.models.functions import TruncDate
from django.shortcuts import redirect
from django.utils.timezone import now
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, serializers, mixins, viewsets
from rest_framework.filters import SearchFilter
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


class URLDetails(viewsets.ModelViewSet):
    serializer_class = ShortUrlDetailSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        queryset = Shortened_db.objects.filter(user=self.request.user).order_by('-created_at')

        status = self.request.query_params.get('status')
        created_at = self.request.query_params.get('created_at')
        search_short = self.request.query_params.get('search_short')
        search_origin = self.request.query_params.get('search_origin')

        if status:
            queryset = queryset.filter(status=status)

        if created_at:
            queryset = queryset.annotate(created_date=TruncDate('created_at')).filter(created_date=created_at)

        if search_short:
            queryset = queryset.filter(shorten_url=search_short)

        if search_origin:
            queryset = queryset.filter(origin_url=search_origin)

        return queryset


    def put(self, request, *args, **kwargs):
        print("Received Data:", request.data)
        return self.update(request, *args, partial=True)

