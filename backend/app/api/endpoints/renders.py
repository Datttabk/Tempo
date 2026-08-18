from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import RenderJobModel
from app.schemas.schemas import RenderJobStatusSchema

router = APIRouter()

@router.get("/render-jobs/{job_id}", response_model=RenderJobStatusSchema)
def get_render_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(RenderJobModel).filter(
        (RenderJobModel.job_id == job_id) | (RenderJobModel.order_id == job_id)
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Render job not found")
        
    return job
