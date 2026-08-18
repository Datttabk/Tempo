import os
import time
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db.models import OrderModel, RenderJobModel, Base
from app.renderer.engine import VideoRenderEngine
from app.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("RenderWorker")

def process_single_job(db: Session, job: RenderJobModel, renderer: VideoRenderEngine):
    order = db.query(OrderModel).filter(OrderModel.order_id == job.order_id).first()
    if not order:
        logger.error(f"Job {job.job_id} order {job.order_id} not found.")
        job.status = "FAILED"
        job.error_message = "Order not found"
        db.commit()
        return

    # Check payment verification & confirmation rule
    if order.payment_status != "PAYMENT_SUCCESS" or not order.confirmation_status:
        logger.error(f"Order {order.order_id} unverified or unconfirmed. Aborting render.")
        job.status = "FAILED"
        job.error_message = "Payment unverified or confirmation missing."
        order.render_status = "RENDER_FAILED"
        db.commit()
        return

    logger.info(f"Processing render job {job.job_id} for order {order.order_id} (Template: {order.template_id})")
    job.status = "PROCESSING"
    job.started_at = datetime.utcnow()
    order.render_status = "RENDERING"
    db.commit()

    try:
        output_filename = f"{order.template_id}_{order.order_id[:8]}.mp4"
        storage_dir = os.path.join(settings.STORAGE_DIR, "output")
        os.makedirs(storage_dir, exist_ok=True)
        final_output_path = os.path.join(storage_dir, output_filename)

        # Execute generic video rendering
        renderer.render_order_video(
            template_id=order.template_id,
            customer_data=order.customer_data,
            output_filepath=final_output_path
        )

        # Output validation
        if not os.path.exists(final_output_path):
            raise RuntimeError("Rendered output video file was not created.")
        
        file_size = os.path.getsize(final_output_path)
        if file_size < 100000:
            raise RuntimeError(f"Rendered video size ({file_size} bytes) below threshold.")

        job.status = "COMPLETED"
        job.output_path = final_output_path
        job.completed_at = datetime.utcnow()

        order.render_status = "VIDEO_READY"
        order.output_video_url = f"/api/orders/{order.order_id}/video"
        db.commit()
        logger.info(f"SUCCESS! Render job {job.job_id} completed. Output size: {file_size} bytes")

    except Exception as e:
        logger.error(f"Render job {job.job_id} failed: {str(e)}", exc_info=True)
        job.status = "FAILED"
        job.error_message = str(e)
        order.render_status = "RENDER_FAILED"
        order.error_message = f"Rendering error: {str(e)}"
        db.commit()

def run_worker_loop(poll_interval: float = 2.0, run_once: bool = False):
    Base.metadata.create_all(bind=engine)
    renderer = VideoRenderEngine(base_dir=settings.BASE_DIR)
    logger.info("Render worker process started...")

    while True:
        db = SessionLocal()
        try:
            job = db.query(RenderJobModel).filter(RenderJobModel.status == "QUEUED").order_by(RenderJobModel.created_at.asc()).first()
            if job:
                process_single_job(db, job, renderer)
            elif run_once:
                break
        except Exception as e:
            logger.error(f"Error in render worker loop: {e}")
        finally:
            db.close()

        if run_once:
            break
        time.sleep(poll_interval)

if __name__ == "__main__":
    run_worker_loop()
