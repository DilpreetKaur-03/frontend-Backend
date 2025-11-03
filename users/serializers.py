# users/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """
    Read-only user data returned to the client.
    Keep only safe fields.
    """
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")


class RegisterSerializer(serializers.ModelSerializer):
    """
    Registration serializer that requires password + password2
    and sets the password properly using set_password().
    """
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2", "first_name", "last_name")
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
            "username": {"required": True},
        }

    def validate(self, data):
        # Ensure both passwords match
        if data.get("password") != data.get("password2"):
            # Return structured error so frontend can show it nicely
            raise serializers.ValidationError({"password2": ["Passwords do not match."]})
        return data

    def create(self, validated_data):
        # Remove password2 and hash the password
        validated_data.pop("password2", None)
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        # By default Django keeps is_active=True; no change needed
        user.save()
        return user