from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from .serializers import Registration, LoginSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication


class RegisterView(generics.CreateAPIView):
    serializer_class = Registration

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED, headers=headers)
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
            {"status":True, "message": "Login successful.", "auth_token": token.key},
            status=status.HTTP_200_OK
        )





class LogoutView(APIView):
    # authentication_classes = [TokenAuthentication]  # Requires authentication
    # permission_classes = [IsAuthenticated]  # Only logged-in users can log out

    def post(self, request):
        request.user.auth_token.delete()
        return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)

