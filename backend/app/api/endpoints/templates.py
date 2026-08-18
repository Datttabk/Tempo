from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import TemplateModel
from app.schemas.schemas import TemplateResponseSchema
from app.renderer.engine import VideoRenderEngine
from app.core.config import settings

router = APIRouter()
renderer = VideoRenderEngine(base_dir=settings.BASE_DIR)

@router.get("/templates", response_model=List[TemplateResponseSchema])
def list_templates(db: Session = Depends(get_db)):
    # 1. Fetch DB templates
    db_templates = db.query(TemplateModel).all()
    result = []
    
    for t in db_templates:
        result.append(TemplateResponseSchema(
            template_id=t.template_id,
            slug=t.slug,
            name=t.name,
            occasion=t.occasion,
            description=t.description,
            status=t.status,
            price_inr=t.price_inr,
            currency=t.currency,
            duration=t.duration,
            width=t.width,
            height=t.height,
            fps=t.fps,
            preview_video=t.preview_video,
            fields=t.config_data.get("fields", [])
        ))

    # Add placeholders for templates 03 to 10 marked as "COMING_SOON"
    coming_soon_titles = [
        ("Ganesh Sthapana", "ganesh-sthapana-03"),
        ("Navratri Dandiya Night", "navratri-dandiya-04"),
        ("Diwali Deepotsav", "diwali-deepotsav-05"),
        ("Wedding Royal Arrival", "wedding-royal-06"),
        ("Royal Reception", "royal-reception-07"),
        ("Sangeet Night", "sangeet-night-08"),
        ("Haldi Ceremony", "haldi-ceremony-09"),
        ("Birthday Celebration", "birthday-celebration-10"),
    ]

    for idx, (name, slug) in enumerate(coming_soon_titles, start=3):
        t_id = f"TEMPLATE_{idx:02d}"
        if not any(r.template_id == t_id for r in result):
            result.append(TemplateResponseSchema(
                template_id=t_id,
                slug=slug,
                name=name,
                occasion=name.split()[0],
                description="Cinematic festival invitation video template - Coming Soon.",
                status="COMING_SOON",
                price_inr=settings.DEFAULT_PRICE_INR,
                currency=settings.DEFAULT_CURRENCY,
                duration=30.0,
                width=1080,
                height=1920,
                fps=30,
                preview_video=None,
                fields=[]
            ))

    return result

@router.get("/templates/{template_id_or_slug}", response_model=TemplateResponseSchema)
def get_template_detail(template_id_or_slug: str, db: Session = Depends(get_db)):
    t = db.query(TemplateModel).filter(
        (TemplateModel.template_id == template_id_or_slug) | (TemplateModel.slug == template_id_or_slug)
    ).first()
    
    if not t:
        try:
            cfg = renderer.load_template_config(template_id_or_slug)
            return TemplateResponseSchema(
                template_id=cfg["template_id"],
                slug=cfg.get("slug", cfg["template_id"].lower()),
                name=cfg["name"],
                occasion=cfg["occasion"],
                description=cfg.get("description", ""),
                status=cfg.get("status", "ACTIVE"),
                price_inr=cfg.get("price_inr", settings.DEFAULT_PRICE_INR),
                currency=cfg.get("currency", "INR"),
                duration=cfg["duration"],
                width=cfg["width"],
                height=cfg["height"],
                fps=cfg["fps"],
                preview_video=cfg.get("preview_video"),
                fields=cfg.get("fields", [])
            )
        except Exception:
            raise HTTPException(status_code=404, detail="Template not found")

    return TemplateResponseSchema(
        template_id=t.template_id,
        slug=t.slug,
        name=t.name,
        occasion=t.occasion,
        description=t.description,
        status=t.status,
        price_inr=t.price_inr,
        currency=t.currency,
        duration=t.duration,
        width=t.width,
        height=t.height,
        fps=t.fps,
        preview_video=t.preview_video,
        fields=t.config_data.get("fields", [])
    )
