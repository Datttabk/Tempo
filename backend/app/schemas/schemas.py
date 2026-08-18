from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class TemplateFieldSchema(BaseModel):
    id: str
    label: str
    required: bool = True
    max_chars: Optional[int] = None
    max_words: Optional[int] = None
    placeholder: Optional[str] = None
    slot: int
    start_time: float
    end_time: float
    x: int
    y: int
    max_width: int
    font_size: int
    font_family: str
    color: str
    align: str = "center"
    animation: str = "fade_in"

class TemplateResponseSchema(BaseModel):
    template_id: str
    slug: str
    name: str
    occasion: str
    description: Optional[str] = None
    status: str
    price_inr: int
    currency: str = "INR"
    duration: float
    width: int
    height: int
    fps: int
    preview_video: Optional[str] = None
    fields: List[TemplateFieldSchema]

    class Config:
        from_attributes = True

class OrderCreateSchema(BaseModel):
    template_id: str
    customer_data: Dict[str, Any]
    confirmed: bool = Field(..., description="Explicit customer confirmation that entered information is correct")

class OrderResponseSchema(BaseModel):
    order_id: str
    template_id: str
    customer_data: Dict[str, Any]
    amount: int
    currency: str
    confirmation_status: bool
    payment_status: str
    render_status: str
    output_video_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaymentCreateSchema(BaseModel):
    order_id: str

class PaymentVerifySchema(BaseModel):
    order_id: str
    payment_id: str
    signature: Optional[str] = "mock_signature_valid"

class PaymentResponseSchema(BaseModel):
    order_id: str
    payment_status: str
    render_status: str
    payment_id: str
    message: str

class RenderJobStatusSchema(BaseModel):
    job_id: str
    order_id: str
    template_id: str
    status: str
    output_path: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
