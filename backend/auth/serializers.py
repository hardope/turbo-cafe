from datetime import datetime
from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from auth.models import UserProfile

class UserProfileRegistrationSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = UserProfile
        fields = ('username', 'password', 'email', 'first_name', 
                 'last_name', 'role', 'phone_number', 'address', 'matric_number', 'vendor_name')

    def validate(self, attrs):
        if UserProfile.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({
                "message": "Account with this email already exists."
            })
        if UserProfile.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({
                "message": "Account with this username already exists."
            })
        if attrs.get('matric_number', False) and UserProfile.objects.filter(matric_number=attrs['matric_number']).exists():
            raise serializers.ValidationError({
                "message": "Account with this matric number already exists."
            })
        if attrs.get('vendor_name', False) and UserProfile.objects.filter(vendor_name=attrs['vendor_name']).exists():
            raise serializers.ValidationError({
                "message": "Account with this vendor name already exists."
            })
        return attrs

    def create(self, validated_data):
        user = UserProfile.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        print(email, password)

        if email and password:
            user_profile = UserProfile.objects.filter(email=email).first()
            print(user_profile)
            
            if not user_profile:
                raise serializers.ValidationError(
                    {"message": "Invalid Credentials"},
                )

            user = authenticate(username=user_profile.username, password=password)
            print(user)
            if not user:
                raise serializers.ValidationError({
                    "message": "Invalid Credentials"
                })

            UserProfile.objects.update(last_login=timezone.now())
            custom_user = UserProfile.objects.get(id=user.id)

            attrs['user'] = custom_user
            return attrs
        raise serializers.ValidationError({
            "detail": "Must include both username and password."
        })

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'vendor_name',
                 'role', 'phone_number', 'address', 'date_joined', 'last_login', 'matric_number')
        read_only_fields = ('id', 'date_joined', 'last_login')

