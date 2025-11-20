import logging

from django.contrib.auth import logout
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        logger.info("User logged out", extra={"user_id": request.user.id})
        return Response(status=status.HTTP_204_NO_CONTENT)
