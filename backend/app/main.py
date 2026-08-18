import os
import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.database import engine, Base, SessionLocal
from app.db.models import TemplateModel
from app.api.endpoints import health, templates, orders, payments, renders

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production Personalized Cinematic Invitation Video Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed Active Templates into Database on Startup
def seed_active_templates():
    db = SessionLocal()
    try:
        templates_dir = os.path.join(settings.BASE_DIR, "assets/templates")
        if os.path.exists(templates_dir):
            for folder in os.listdir(templates_dir):
                cfg_path = os.path.join(templates_dir, folder, "config.json")
                if os.path.exists(cfg_path):
                    with open(cfg_path, "r") as f:
                        cfg = json.load(f)
                    
                    t_id = cfg["template_id"]
                    existing = db.query(TemplateModel).filter(TemplateModel.template_id == t_id).first()
                    if not existing:
                        tmpl = TemplateModel(
                            template_id=t_id,
                            slug=cfg.get("slug", t_id.lower()),
                            name=cfg["name"],
                            occasion=cfg["occasion"],
                            description=cfg.get("description", ""),
                            status=cfg.get("status", "ACTIVE"),
                            price_inr=cfg.get("price_inr", settings.DEFAULT_PRICE_INR),
                            currency=cfg.get("currency", settings.DEFAULT_CURRENCY),
                            master_video=cfg["master_video"],
                            preview_video=cfg.get("preview_video"),
                            duration=cfg["duration"],
                            width=cfg["width"],
                            height=cfg["height"],
                            fps=cfg["fps"],
                            config_data=cfg
                        )
                        db.add(tmpl)
                        db.commit()
    except Exception as e:
        print(f"Error seeding templates: {e}")
    finally:
        db.close()

seed_active_templates()

# Include Routers
app.include_router(health.router, tags=["Health"])
app.include_router(templates.router, prefix=settings.API_V1_STR, tags=["Templates"])
app.include_router(orders.router, prefix=settings.API_V1_STR, tags=["Orders"])
app.include_router(payments.router, prefix=settings.API_V1_STR, tags=["Payments"])
app.include_router(renders.router, prefix=settings.API_V1_STR, tags=["Renders"])

# Mount static files for assets
assets_dir = os.path.join(settings.BASE_DIR, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled Server Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred while processing your request."}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
