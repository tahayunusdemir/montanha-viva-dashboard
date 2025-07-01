# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated


class PublicDataView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": " Great! Backend is updated."})


class ProtectedDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {"message": f"Hello, {request.user.email}! This is protected data."}
        )
