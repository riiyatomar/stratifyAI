# ========================================
# STRATIFY AI — Projects API Router
# ========================================

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Project, ScopeLog, ActivityLog, generate_id
from app.schemas.schemas import (
    ProjectCreate, ProjectUpdate, ProjectOut,
    ScopeLogCreate, ScopeLogOut,
    ActivityLogCreate, ActivityLogOut,
    StatsOut,
)

router = APIRouter(prefix="/api/projects", tags=["Projects"])


# ---- Helpers ----

def _project_to_dict(p: Project) -> dict:
    """Convert a Project ORM instance to a frontend-compatible dict."""
    return {
        "id": p.id,
        "status": p.status,
        "clientName": p.client_name,
        "company": p.company,
        "email": p.email,
        "createdAt": p.created_at.isoformat() if p.created_at else "",
        "updatedAt": p.updated_at.isoformat() if p.updated_at else "",
        "requirements": p.requirements,
        "proposal": p.proposal,
        "plan": p.plan,
        "scopeLog": [
            {
                "id": s.id,
                "request": s.request,
                "classification": s.classification,
                "justification": s.justification,
                "impact": s.impact,
                "timestamp": s.created_at.isoformat() if s.created_at else "",
            }
            for s in p.scope_logs
        ],
        "activityLog": [
            {
                "id": a.id,
                "type": a.type,
                "message": a.message,
                "agent": a.agent,
                "timestamp": a.created_at.isoformat() if a.created_at else "",
            }
            for a in p.activity_logs
        ],
    }


# ---- CRUD ----

@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    return [_project_to_dict(p) for p in projects]


@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    active_statuses = {"requirements", "proposal", "planning", "active"}
    total = len(projects)
    active = sum(1 for p in projects if p.status in active_statuses)
    completed = sum(1 for p in projects if p.status == "completed")
    proposals = sum(1 for p in projects if p.proposal is not None)
    pending = sum(1 for p in projects if p.status == "proposal")
    scope_changes = sum(len(p.scope_logs) for p in projects)
    rate = round((completed / total) * 100) if total > 0 else 0

    return StatsOut(
        total=total, active=active, completed=completed,
        proposals=proposals, pendingProposals=pending,
        scopeChanges=scope_changes, completionRate=rate,
    )


@router.get("/recent-activity", response_model=list[ActivityLogOut])
def recent_activity(limit: int = Query(10, ge=1, le=100), db: Session = Depends(get_db)):
    logs = (
        db.query(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )
    result = []
    for a in logs:
        proj = a.project
        result.append({
            "id": a.id,
            "type": a.type,
            "message": a.message,
            "agent": a.agent,
            "timestamp": a.created_at.isoformat() if a.created_at else "",
            "projectId": a.project_id,
            "projectName": proj.client_name or proj.company or "Untitled" if proj else "Untitled",
        })
    return result


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return _project_to_dict(p)


@router.post("", response_model=ProjectOut, status_code=201)
def create_project(body: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(
        id=generate_id(),
        client_name=body.clientName,
        company=body.company,
        email=body.email,
        status="requirements",
    )
    if body.requirements:
        project.requirements = body.requirements
    if body.proposal:
        project.proposal = body.proposal
    if body.plan:
        project.plan = body.plan

    # Default activity
    activity = ActivityLog(
        id=generate_id(),
        project_id=project.id,
        type="created",
        message="Project created",
        agent="orchestrator",
    )

    db.add(project)
    db.add(activity)
    db.commit()
    db.refresh(project)
    return _project_to_dict(project)


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(project_id: str, body: ProjectUpdate, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    if body.status is not None:
        p.status = body.status
    if body.clientName is not None:
        p.client_name = body.clientName
    if body.company is not None:
        p.company = body.company
    if body.email is not None:
        p.email = body.email
    if body.requirements is not None:
        p.requirements = body.requirements
    if body.proposal is not None:
        p.proposal = body.proposal
    if body.plan is not None:
        p.plan = body.plan

    p.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(p)
    return _project_to_dict(p)


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(p)
    db.commit()


# ---- Activity Log ----

@router.post("/{project_id}/activity", response_model=ActivityLogOut, status_code=201)
def add_activity(project_id: str, body: ActivityLogCreate, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    activity = ActivityLog(
        id=generate_id(),
        project_id=project_id,
        type=body.type,
        message=body.message,
        agent=body.agent,
    )
    p.updated_at = datetime.now(timezone.utc)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return {
        "id": activity.id,
        "type": activity.type,
        "message": activity.message,
        "agent": activity.agent,
        "timestamp": activity.created_at.isoformat() if activity.created_at else "",
    }


# ---- Scope Log ----

@router.post("/{project_id}/scope", response_model=ScopeLogOut, status_code=201)
def add_scope_entry(project_id: str, body: ScopeLogCreate, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    entry = ScopeLog(
        id=generate_id(),
        project_id=project_id,
        request=body.request,
        classification=body.classification,
        justification=body.justification,
    )
    entry.impact = body.impact
    p.updated_at = datetime.now(timezone.utc)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {
        "id": entry.id,
        "request": entry.request,
        "classification": entry.classification,
        "justification": entry.justification,
        "impact": entry.impact,
        "timestamp": entry.created_at.isoformat() if entry.created_at else "",
    }


# ---- Seed Demo Data ----

@router.post("/seed", status_code=201)
def seed_demo_data(db: Session = Depends(get_db)):
    """Seed the database with demo projects (skips if data exists)."""
    existing = db.query(Project).count()
    if existing > 0:
        return {"message": "Data already exists, skipping seed.", "count": existing}

    from app.seed import seed_database
    seed_database(db)
    return {"message": "Demo data seeded successfully."}

