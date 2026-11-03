# ========================================
# STRATIFY AI — Settings API Router
# ========================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Settings
from app.schemas.schemas import SettingsOut, SettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["Settings"])


def _get_or_create(db: Session) -> Settings:
    settings = db.query(Settings).filter(Settings.id == "default").first()
    if not settings:
        settings = Settings(id="default")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def _to_dict(s: Settings) -> dict:
    return {
        "companyName": s.company_name,
        "currency": s.currency,
        "defaultRate": s.default_rate,
        "autoSave": s.auto_save,
        "notifications": s.notifications,
    }


@router.get("", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db)):
    return _to_dict(_get_or_create(db))


@router.put("", response_model=SettingsOut)
def update_settings(body: SettingsUpdate, db: Session = Depends(get_db)):
    s = _get_or_create(db)
    if body.companyName is not None:
        s.company_name = body.companyName
    if body.currency is not None:
        s.currency = body.currency
    if body.defaultRate is not None:
        s.default_rate = str(body.defaultRate)
    if body.autoSave is not None:
        s.auto_save = str(body.autoSave)
    if body.notifications is not None:
        s.notifications = str(body.notifications)
    db.commit()
    db.refresh(s)
    return _to_dict(s)

