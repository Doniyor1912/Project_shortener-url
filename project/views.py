from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import redirect
from django.utils.dateparse import parse_date
from rest_framework import generics, status
from rest_framework.pagination import BasePagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ShortenedURL
from .serializers import ShortUrlDetailSerializer, ShortenedURLSerializer


@login_required
def get_url_count(request):
    """Returns the total number of URLs for the logged-in user"""
    user = request.user
    url_count = ShortenedURL.objects.filter(user=user).count()  # Count user's URLs
    return Response({"count": url_count})  # Return JSON response

class ShortenURLCreateView(generics.CreateAPIView):
    queryset = ShortenedURL.objects.all()
    serializer_class = ShortenedURLSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            return Response(
                {
                    "message": "Success! Your shortened URL has been created.",
                    "data": response.data
                },
                status=status.HTTP_201_CREATED
            )
        except IntegrityError:
            return Response(
                {
                    "error": "Failed to create a unique short URL. Please try again."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class RedirectShortURLView(generics.RetrieveAPIView):
    queryset = ShortenedURL.objects.all()
    serializer_class = ShortenedURLSerializer
    lookup_field = "short_link"
    pagination_class = BasePagination

    def retrieve(self, request, short_link):
        try:
            url_instance = ShortenedURL.objects.get(short_link=short_link)
        except ShortenedURL.DoesNotExist:
            return Response({"error": "Shortened URL not found."}, status=status.HTTP_404_NOT_FOUND)


        url_instance.clicks += 1
        url_instance.save()
        return redirect(url_instance.original_link)


class UserShortUrlListView(generics.ListAPIView):
    serializer_class = ShortUrlDetailSerializer
    # pagination_class = BasePagination

    def get_queryset(self):
        queryset = ShortenedURL.objects.filter(user=self.request.user).order_by('-created_at')

        # Filter parameters
        search_short = self.request.query_params.get('search_short')
        status_param = self.request.query_params.get('status')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if search_short:
            short_url = search_short.strip().split('/')[-1]  # Extract last part & remove spaces
            queryset = queryset.filter(short_link__iexact=short_url)  # Case-insensitive search

        if status_param is not None:
            status_value = status_param.lower() in ["true", "1", "active"]
            queryset = queryset.filter(status=status_value)

        if start_date or end_date:
            start_date = parse_date(start_date) if start_date else None
            end_date = parse_date(end_date) if end_date else None

            if start_date and end_date and start_date > end_date:
                return queryset.none()

            if start_date:
                queryset = queryset.filter(created_at__date__gte=start_date)
            if end_date:
                queryset = queryset.filter(created_at__date__lte=end_date)

        return queryset



class UserShortUrlActionDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ShortUrlDetailSerializer
    permission_classes = [IsAuthenticated]
    # pagination_class = (BasePagination,)

    def get_queryset(self):
        return ShortenedURL.objects.filter(user=self.request.user)


    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response(
                {"error": "You don't have permission to update this URL!"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)



    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response(
                {"error": "You don't have permission to delete this URL!"},
                status=status.HTTP_403_FORBIDDEN
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)




