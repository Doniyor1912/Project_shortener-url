from django.urls import path, include
from rest_framework import routers
from .views import URLShortener, URLDetails, RedirectShortURLView

router = routers.SimpleRouter()
router.register('',URLDetails, basename="shorten_urls")

urlpatterns = [
    path('shorten/', URLShortener.as_view(), name='shorten_url'),
    path('<str:shorten_url>/', RedirectShortURLView.as_view(), name='redirect-url'),
    path('shorten/urls/', include(router.urls)),
    path('shorten/get-all/', include(router.urls), name='shorten'),


]