from django.contrib.auth.models import User
from rest_framework import generics, status, mixins
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import GenericViewSet

from .serializers import RegistrationSerializer, LoginSerializer, UserProfileSerializer
from rest_framework.response import Response
from rest_framework.views import APIView


class RegisterView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)







class LoginView(generics.CreateAPIView):
    serializer_class = LoginSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        login(request, user)

        token, created = Token.objects.get_or_create(user=user)

        return Response(
            {"status":True, "message": "Login successful.", "token": token.key},
            status=status.HTTP_200_OK
        )





class LogoutView(APIView):
    # authentication_classes = [TokenAuthentication]  # Requires authentication
    # permission_classes = [IsAuthenticated]  # Only logged-in users can log out

    def post(self, request):
        request.user.auth_token.delete()
        return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)



# Get user's Profile:
class UserProfileView(mixins.UpdateModelMixin,
                      mixins.RetrieveModelMixin,
                      GenericViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]  # Faqat kirgan foydalanuvchilar uchun

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)  # Faqat login qilgan foydalanuvchini oladi

    def get_object(self):
        return self.request.user  # Foydalanuvchini bevosita qaytarish