from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token


class Registration(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password']


    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            # first_name=validated_data.get('first_name', ''),
            # last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
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



