import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import OrderModel, TemplateModel
from app.schemas.schemas import OrderCreateSchema, OrderResponseSchema
from app.renderer.engine import VideoRenderEngine
from app.core.config import settings

router = APIRouter()
renderer = VideoRenderEngine(base_dir=settings.BASE_DIR)

@router.post("/orders", response_model=OrderResponseSchema, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreateSchema, db: Session = Depends(get_db)):
    # 1. Verify confirmation checkbox was checked
    if not payload.confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must explicitly confirm that all entered information is correct before proceeding."
        )

    # 2. Verify template exists and is ACTIVE
    template = db.query(TemplateModel).filter(
        (TemplateModel.template_id == payload.template_id) | (TemplateModel.slug == payload.template_id)
    ).first()

    if not template:
        try:
            cfg = renderer.load_template_config(payload.template_id)
            template_status = cfg.get("status", "ACTIVE")
            template_id = cfg["template_id"]
            price_inr = cfg.get("price_inr", settings.DEFAULT_PRICE_INR)
            currency = cfg.get("currency", settings.DEFAULT_CURRENCY)
        except Exception:
            raise HTTPException(status_code=404, detail=f"Template '{payload.template_id}' not found.")
    else:
        template_status = template.status
        template_id = template.template_id
        price_inr = template.price_inr
        currency = template.currency

    if template_status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coming Soon templates are currently not purchasable. Please select an active template."
        )

    # 3. Validate customer inputs against template rules
    cfg = renderer.load_template_config(template_id)
    valid, errors = renderer.validate_inputs(cfg, payload.customer_data)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Input validation failed", "errors": errors}
        )

    # 4. Create Order record
    new_order = OrderModel(
        template_id=template_id,
        customer_data=payload.customer_data,
        amount=price_inr,
        currency=currency,
        confirmation_status=True,
        confirmation_timestamp=datetime.utcnow(),
        payment_status="PAYMENT_PENDING",
        render_status="ORDER_CREATED"
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order

@router.get("/orders/{order_id}", response_model=OrderResponseSchema)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(OrderModel).filter(OrderModel.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("/orders/{order_id}/video")
def download_order_video(order_id: str, db: Session = Depends(get_db)):
    order = db.query(OrderModel).filter(OrderModel.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Payment-first & video-ready enforcement
    if order.payment_status != "PAYMENT_SUCCESS":
        raise HTTPException(status_code=403, detail="Payment is not verified for this order.")

    if order.render_status != "VIDEO_READY":
        raise HTTPException(status_code=400, detail=f"Video is not ready yet. Current status: {order.render_status}")

    output_filename = f"{order.template_id}_{order.order_id[:8]}.mp4"
    file_path = os.path.join(settings.STORAGE_DIR, "output", output_filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Rendered video file not found in storage.")

    mandal_clean = "".join([c for c in str(order.customer_data.get("mandal_name", "INVITATION")) if c.isalnum() or c in (" ", "_")]).strip().replace(" ", "_")
    clean_download_name = f"{order.template_id}_{mandal_clean}_2026.mp4"

    return FileResponse(
        path=file_path,
        media_type="video/mp4",
        filename=clean_download_name
    )
