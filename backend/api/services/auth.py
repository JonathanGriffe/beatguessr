import base64
import os

def get_auth_header():
    return base64.b64encode(f"{os.environ['SPOTIFY_CLIENT_ID']}:{os.environ['SPOTIFY_CLIENT_SECRET']}".encode()).decode()

def get_callback_url():
    return f"{os.environ['FRONTEND_URL']}/callback/"