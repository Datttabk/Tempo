import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db
from app.core.config import settings

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    storage_dir = os.path.join(settings.BASE_DIR, "storage")
    storage_status = "healthy" if os.path.exists(storage_dir) else "unhealthy: directory missing"
    
    # Check master template assets existence
    aagman_master = os.path.join(settings.BASE_DIR, "assets/templates/ganesh-aagman-01/master.mp4")
    visarjan_master = os.path.join(settings.BASE_DIR, "assets/templates/ganesh-visarjan-01/master.mp4")
    renderer_status = "healthy" if os.path.exists(aagman_master) and os.path.exists(visarjan_master) else "unhealthy: master videos missing"

    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "database": db_status,
        "storage": storage_status,
        "renderer": renderer_status,
        "payment_gateway": settings.PAYMENT_GATEWAY,
        "default_price_inr": settings.DEFAULT_PRICE_INR
    }
