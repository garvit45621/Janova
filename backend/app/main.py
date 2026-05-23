import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .seed import seed_data
from .routers import auth, vault, services, complaints, calendar, admin, ai

# Initialize DB tables
Base.metadata.create_all(bind=engine)

# Auto seed default data on startup
db = SessionLocal()
try:
    seed_data(db)
finally:
    db.close()

app = FastAPI(
    title="Janova GovTech API",
    description="Backend API services supporting Janova's core citizen OS functionalities.",
    version="1.0.0"
)

# Configure CORS for local Next.js client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(vault.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(complaints.router, prefix="/api")
app.include_router(calendar.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Janova GovTech Portal API. Swagger is live at /docs."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
