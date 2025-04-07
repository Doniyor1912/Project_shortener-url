import random
import string
from django.http import HttpResponseRedirect
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from config.settings import Length

url_mapping = {}

def generate_short_url():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=Length))

def format_url(origin_url):
    """Ensure the URL has a proper scheme."""
    if not origin_url.startswith(("http://", "https://")):
        if origin_url.endswith(".com"):
            return "http://" + origin_url
        else:
            return f"https://{origin_url}.com"
    return origin_url

class ShortenURLView(APIView):
    def post(self, request):
        origin_url = request.data.get('origin_url')
        if not origin_url:
            return Response({'error': 'Origin URL is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Fix the URL format before storing
        origin_url = format_url(origin_url)

        short_url = generate_short_url()
        url_mapping[short_url] = origin_url

        short_url_full = f"http://127.0.0.1:8000/api/2/{short_url}"
        return Response({'short_url': short_url_full}, status=status.HTTP_201_CREATED)

class RedirectURLView(APIView):
    def get(self, request, short_url):
        origin_url = url_mapping.get(short_url)
        if not origin_url:
            return Response({'error': 'Short URL not found'}, status=status.HTTP_404_NOT_FOUND)

        return HttpResponseRedirect(origin_url)
