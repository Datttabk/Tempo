import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, Text
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class TemplateModel(Base):
    __tablename__ = "templates"

    id = Column(String, primary_key=True, default=generate_uuid)
    template_id = Column(String, unique=True, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    occasion = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="ACTIVE") # ACTIVE, COMING_SOON, INACTIVE
    price_inr = Column(Integer, default=499)
    currency = Column(String, default="INR")
    master_video = Column(String, nullable=False)
    preview_video = Column(String, nullable=True)
    duration = Column(Float, nullable=False)
    width = Column(Integer, default=1080)
    height = Column(Integer, default=1920)
    fps = Column(Integer, default=30)
    config_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class OrderModel(Base):
    __tablename__ = "orders"

    order_id = Column(String, primary_key=True, default=generate_uuid)
    template_id = Column(String, nullable=False, index=True)
    customer_data = Column(JSON, nullable=False)
    amount = Column(Integer, nullable=False)
    currency = Column(String, default="INR")
    confirmation_status = Column(Boolean, default=False)
    confirmation_timestamp = Column(DateTime, nullable=True)
    payment_status = Column(String, default="PAYMENT_PENDING") # PAYMENT_PENDING, PAYMENT_SUCCESS, PAYMENT_FAILED
    payment_id = Column(String, nullable=True)
    payment_signature = Column(String, nullable=True)
    render_status = Column(String, default="ORDER_CREATED") # ORDER_CREATED, RENDER_QUEUED, RENDERING, VIDEO_READY, RENDER_FAILED
    output_video_url = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RenderJobModel(Base):
    __tablename__ = "render_jobs"

    job_id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, nullable=False, index=True)
    template_id = Column(String, nullable=False)
    status = Column(String, default="QUEUED") # QUEUED, PROCESSING, COMPLETED, FAILED
    output_path = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
