from django.urls import path
from .views import URLShortener, RedirectURLViewSet

urlpatterns = [
    path('shorten/', URLShortener.as_view(), name='shorten-url'),
    path('<str:shorten_url>/', RedirectURLViewSet.as_view({"get":"retrieve"})),  # Redirect short URLs
]