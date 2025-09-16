# views.py
# This file contains the views for handling user authentication and profile management in the TurboCafe backend.

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from auth.models import UserProfile
from auth.serializers import UserLoginSerializer, UserProfileRegistrationSerializer, UserProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse
from turbocafe.token import CustomTokenObtainPairSerializer

# View for user registration
@extend_schema(
    request=UserProfileRegistrationSerializer,
    description="Endpoint for user registration",
    summary="Register a new user",
    responses={
        201: OpenApiResponse(
            response=UserProfileSerializer,
            description="User created successfully"
        ),
        400: OpenApiResponse(description="Validation error")
    }
)
class UserRegistrationView(generics.CreateAPIView):
    """
    Handles user registration. Allows new users to create an account.
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """
        Overrides the default create method to return a custom response.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'User created successfully',
            'user': UserProfileSerializer(user).data,
        }, status=status.HTTP_201_CREATED)

# View for user login
@extend_schema(
    request=UserLoginSerializer,
    description="Endpoint for user login",
    summary="Login a user",
    responses={
        200: OpenApiResponse(
            response=UserProfileSerializer,
            description="Login successful"
        ),
        400: OpenApiResponse(description="Invalid credentials")
    }
)
class UserLoginView(APIView):
    """
    Handles user login. Validates user credentials and returns JWT tokens.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """
        Authenticates the user and generates JWT tokens.
        """
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = CustomTokenObtainPairSerializer.get_token(user)
        
        return Response({
            'message': 'Login successful',
            'user': UserProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

# View for refreshing JWT tokens
@extend_schema(
    request=TokenRefreshSerializer,
    summary="Refresh JWT token",
    description="Endpoint for refreshing JWT tokens",
    responses={
        200: OpenApiResponse(description="Token refreshed successfully"),
        400: OpenApiResponse(description="Invalid token")
    }
)
class RefreshTokenView(APIView):
    """
    Handles refreshing of JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        Validates the refresh token and returns a new access token.
        """
        serializer = TokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        return Response({
            'message': 'Token refreshed successfully',
            'access': serializer.validated_data['access'],
            'refresh': serializer.validated_data.get('refresh', request.data.get('refresh'))  # sometimes rotated
        }, status=status.HTTP_200_OK)

# View for user logout
@extend_schema(
    description="Endpoint for user logout",
    summary="Logout a user",
    responses={
        200: OpenApiResponse(description="Logout successful"), 
        400: OpenApiResponse(description="Invalid token")
    }
)
class UserLogoutView(APIView):
    """
    Handles user logout by blacklisting the refresh token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Blacklists the provided refresh token to log the user out.
        """
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

# View for retrieving and updating user profile
@extend_schema(
    description="Endpoint to retrieve and update user profile",
    summary="User profile management",
    request=UserProfileSerializer,
    responses={
        200: OpenApiResponse(response=UserProfileSerializer, description="User profile retrieved successfully"),
        404: OpenApiResponse(description="User not found")
    }
)
class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Handles retrieval and update of the authenticated user's profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """
        Returns the currently authenticated user.
        """
        return self.request.user
