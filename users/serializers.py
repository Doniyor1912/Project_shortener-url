from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    username = serializers.CharField(write_only=True)
    email = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password']

    def validate(self, data):
        # Validate username
        username = data.get('username', '').strip()
        if not username:
            raise ValidationError({'username': 'Username cannot be empty!'})

        if User.objects.filter(username=username).exists():
            raise ValidationError({'username': 'Username already exists!'})

        # Validate email
        email = data.get('email', '').strip()
        if not email:
            raise ValidationError({'email': 'Email cannot be empty!'})

        if '@' not in email:
            raise ValidationError({'email': 'Invalid email address! Must contain "@" symbol.'})

        if User.objects.filter(email=email).exists():
            raise ValidationError({'email': 'Email already exists!'})

        # Validate password
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')

        if not password:
            raise ValidationError({'password': 'Password cannot be empty!'})

        if len(password) <= 8:
            raise ValidationError({'password': 'Password must be longer than 8 characters!'})

        if password != confirm_password:
            raise ValidationError({'confirm_password': "Passwords do not match!"})

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={"input_type": "password"})

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if username and password:
            user = authenticate(username=username, password=password)
            if user is None:
                raise serializers.ValidationError("Invalid username or password.")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
        else:
            raise serializers.ValidationError("Both username and password are required.")

        # Generate or get existing token
        token, created = Token.objects.get_or_create(user=user)

        return {"user": user, "token": token.key}


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']
        extra_kwargs = {
            'username': {'read_only': True},
            'email': {'read_only': True},
        }
