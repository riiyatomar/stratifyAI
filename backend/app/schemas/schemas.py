# ========================================
# STRATIFY AI — Pydantic Schemas
# ========================================

from __future__ import annotations
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


# ---- Activity Log ----

class ActivityLogOut(BaseModel):
    id: str
    type: str
    message: str
    agent: str
    timestamp: str  # ISO string for frontend compat
    # Enriched fields (only in recent-activity endpoint)
    projectId: Optional[str] = None
    projectName: Optional[str] = None

    model_config = {"from_attributes": True}


class ActivityLogCreate(BaseModel):
    type: str = ""
    message: str = ""
    agent: str = ""


# ---- Scope Log ----

class ScopeLogOut(BaseModel):
    id: str
    request: str
    classification: str
    justification: str
    impact: dict
    timestamp: str

    model_config = {"from_attributes": True}


class ScopeLogCreate(BaseModel):
    request: str = ""
    classification: str = ""
    justification: str = ""
    impact: dict = {}


# ---- Project ----

class ProjectCreate(BaseModel):
    clientName: str = ""
    company: str = ""
    email: str = ""
    requirements: Optional[dict | list] = None
    proposal: Optional[dict] = None
    plan: Optional[dict] = None


class ProjectUpdate(BaseModel):
    status: Optional[str] = None
    clientName: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    requirements: Optional[dict | list] = None
    proposal: Optional[dict] = None
    plan: Optional[dict] = None


class ProjectOut(BaseModel):
    id: str
    status: str
    clientName: str
    company: str
    email: str
    createdAt: str
    updatedAt: str
    requirements: Optional[Any] = None
    proposal: Optional[Any] = None
    plan: Optional[Any] = None
    scopeLog: list[ScopeLogOut] = []
    activityLog: list[ActivityLogOut] = []

    model_config = {"from_attributes": True}


# ---- Settings ----

class SettingsOut(BaseModel):
    companyName: str = "Your Company"
    currency: str = "USD"
    defaultRate: str | int = "100"
    autoSave: str | bool = "true"
    notifications: str | bool = "true"

    model_config = {"from_attributes": True}


class SettingsUpdate(BaseModel):
    companyName: Optional[str] = None
    currency: Optional[str] = None
    defaultRate: Optional[str | int] = None
    autoSave: Optional[str | bool] = None
    notifications: Optional[str | bool] = None


# ---- Stats ----

class StatsOut(BaseModel):
    total: int = 0
    active: int = 0
    completed: int = 0
    proposals: int = 0
    pendingProposals: int = 0
    scopeChanges: int = 0
    completionRate: int = 0

