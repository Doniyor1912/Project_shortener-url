from django.urls import path
from .views import ShortenURLView, RedirectURLView

urlpatterns = [
    path('2/shorten-url/', ShortenURLView.as_view(), name='shorten-url'),
    path('2/<str:short_url>/', RedirectURLView.as_view(), name='redirect-url'),
]
