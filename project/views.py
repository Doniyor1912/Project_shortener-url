from django.utils.timezone import now
from rest_framework import generics, status, mixins, viewsets
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from .models import Shortened_db
from .serializers import ShortenedURLSerializer
from drf_spectacular.utils import extend_schema
from django.shortcuts import get_object_or_404, redirect
from django.http import HttpResponseRedirect


@extend_schema(summary='Create Url', tags=['Project'])
class URLShortener(generics.CreateAPIView):
    queryset = Shortened_db.objects.all()
    serializer_class = ShortenedURLSerializer

    def create(self, request, *args, **kwargs):
        origin_url = request.data.get('origin_url')
        if not origin_url:
            return Response({"error": "origin_url is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the URL already exists in the database
        shortened = Shortened_db.objects.filter(origin_url=origin_url).first()
        if shortened:
            return Response(
                {"message": "URL already shortened", "short_url": shortened.shorten_url},
                status=status.HTTP_200_OK
            )

        # Create a new short URL
        new_short_url = Shortened_db(origin_url=origin_url)
        new_short_url.save()

        return Response(
            {"origin_url": origin_url, "short_url":new_short_url.shorten_url},
            status=status.HTTP_201_CREATED
        )




@extend_schema(summary='Retrieve Url', tags=['Project'])
class RedirectURLViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Shortened_db.objects.all()
    serializer_class = ShortenedURLSerializer
    lookup_field = "shorten_url"  # Lookupni 'shorten_url' bo‘yicha qilamiz

    def retrieve(self, request, shorten_url=None):
        short_url_obj = get_object_or_404(Shortened_db, shorten_url=shorten_url)

        # Check if URL is inactive
        short_url_obj.check_status()
        if not short_url_obj.status:
            return Response({"error": "This short URL is inactive."}, status=410)

        # Update click count and last accessed time
        short_url_obj.clicks += 1
        short_url_obj.last_accessed = now()
        short_url_obj.save()

        # Redirect to the original URL
        return redirect(short_url_obj.origin_url)  # `HttpResponseRedirect` o‘rniga
