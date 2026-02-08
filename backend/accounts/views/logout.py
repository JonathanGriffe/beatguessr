import logging

from django.contrib.auth import logout
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class LogoutView(APIView):

    def post(self, request):
        if request.user.is_authenticated:
            logout(request)
            logger.info("User logged out", extra={"user_id": request.user.id})
        else:
            request.session.flush()
        return Response(status=status.HTTP_204_NO_CONTENT)
