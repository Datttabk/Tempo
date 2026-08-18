from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import OrderModel, RenderJobModel
from app.schemas.schemas import PaymentCreateSchema, PaymentVerifySchema, PaymentResponseSchema
from app.payments.abstraction import get_payment_gateway
from app.core.config import settings
from app.renderer.worker import process_single_job
from app.renderer.engine import VideoRenderEngine

router = APIRouter()
gateway = get_payment_gateway(settings.PAYMENT_GATEWAY, settings.PAYMENT_KEY_ID, settings.PAYMENT_KEY_SECRET)
renderer = VideoRenderEngine(base_dir=settings.BASE_DIR)

@router.post("/payments/create")
def create_payment(payload: PaymentCreateSchema, db: Session = Depends(get_db)):
    order = db.query(OrderModel).filter(OrderModel.order_id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if not order.confirmation_status:
        raise HTTPException(status_code=400, detail="Order details must be confirmed before initiating payment.")

    pay_details = gateway.create_payment_order(
        order_id=order.order_id,
        amount_inr=order.amount,
        currency=order.currency
    )

    return {
        "order_id": order.order_id,
        "amount": order.amount,
        "currency": order.currency,
        "gateway": settings.PAYMENT_GATEWAY,
        "payment_details": pay_details
    }

@router.post("/payments/verify", response_model=PaymentResponseSchema)
def verify_payment(payload: PaymentVerifySchema, db: Session = Depends(get_db)):
    order = db.query(OrderModel).filter(OrderModel.order_id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Double check confirmation status
    if not order.confirmation_status:
        raise HTTPException(status_code=400, detail="Order details were not confirmed.")

    # Idempotency check: If payment already verified, return existing status
    if order.payment_status == "PAYMENT_SUCCESS" and order.render_status in ["RENDER_QUEUED", "RENDERING", "VIDEO_READY"]:
        return PaymentResponseSchema(
            order_id=order.order_id,
            payment_status=order.payment_status,
            render_status=order.render_status,
            payment_id=order.payment_id or payload.payment_id,
            message="Payment already verified. Video rendering in progress/completed."
        )

    # Backend verifies payment signature with Gateway
    is_valid, msg = gateway.verify_payment_signature(
        order_id=payload.order_id,
        payment_id=payload.payment_id,
        signature=payload.signature or ""
    )

    if not is_valid:
        order.payment_status = "PAYMENT_FAILED"
        order.error_message = msg
        db.commit()
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {msg}")

    # Mark Payment Success
    order.payment_status = "PAYMENT_SUCCESS"
    order.payment_id = payload.payment_id
    order.payment_signature = payload.signature
    order.render_status = "RENDER_QUEUED"
    db.commit()

    # Create Render Job (Idempotent check)
    existing_job = db.query(RenderJobModel).filter(RenderJobModel.order_id == order.order_id).first()
    if not existing_job:
        new_job = RenderJobModel(
            order_id=order.order_id,
            template_id=order.template_id,
            status="QUEUED"
        )
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        
        # Trigger background processing immediately if in single-process mode
        try:
            process_single_job(db, new_job, renderer)
        except Exception:
            pass # Job is QUEUED, worker will retry

    db.refresh(order)

    return PaymentResponseSchema(
        order_id=order.order_id,
        payment_status=order.payment_status,
        render_status=order.render_status,
        payment_id=order.payment_id,
        message="Payment verified successfully. 4K video rendering job queued."
    )

@router.post("/payments/webhook")
def payment_webhook(payload: dict, db: Session = Depends(get_db)):
    # Async webhook endpoint for gateway callbacks
    order_id = payload.get("order_id")
    payment_id = payload.get("payment_id")
    event = payload.get("event")

    if not order_id:
        return {"status": "ignored", "reason": "No order_id in webhook payload"}

    order = db.query(OrderModel).filter(OrderModel.order_id == order_id).first()
    if not order:
        return {"status": "error", "reason": "Order not found"}

    if event == "payment.captured" and order.payment_status != "PAYMENT_SUCCESS":
        order.payment_status = "PAYMENT_SUCCESS"
        order.payment_id = payment_id
        order.render_status = "RENDER_QUEUED"
        db.commit()

        existing_job = db.query(RenderJobModel).filter(RenderJobModel.order_id == order.order_id).first()
        if not existing_job:
            new_job = RenderJobModel(order_id=order.order_id, template_id=order.template_id, status="QUEUED")
            db.add(new_job)
            db.commit()

    return {"status": "received", "order_id": order_id}
