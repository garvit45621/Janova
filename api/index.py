import sys
import os

# Add project root and backend to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from backend.app.main import app

# Export FastAPI app for Vercel Serverless Functions
app = app
