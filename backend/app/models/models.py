# ========================================
# STRATIFY AI — SQLAlchemy Models
# ========================================

import uuid
import json
from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from app.database import Base


def generate_id() -> str:
    return "id_" + uuid.uuid4().hex[:12]


# ---- Project ----

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_id)
    status = Column(
        String, default="requirements",
        comment="requirements | proposal | planning | active | completed",
    )
    client_name = Column(String, nullable=False, default="")
    company = Column(String, nullable=False, default="")
    email = Column(String, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # JSON blobs — kept as TEXT columns for flexibility
    requirements_json = Column(Text, default=None, comment="JSON blob")
    proposal_json = Column(Text, default=None, comment="JSON blob")
    plan_json = Column(Text, default=None, comment="JSON blob")

    # Relationships
    scope_logs = relationship(
        "ScopeLog", back_populates="project",
        cascade="all, delete-orphan", order_by="ScopeLog.created_at.desc()",
    )
    activity_logs = relationship(
        "ActivityLog", back_populates="project",
        cascade="all, delete-orphan", order_by="ActivityLog.created_at.desc()",
    )

    # --- helpers to get/set JSON fields ---
    @property
    def requirements(self):
        return json.loads(self.requirements_json) if self.requirements_json else None

    @requirements.setter
    def requirements(self, value):
        self.requirements_json = json.dumps(value) if value else None

    @property
    def proposal(self):
        return json.loads(self.proposal_json) if self.proposal_json else None

    @proposal.setter
    def proposal(self, value):
        self.proposal_json = json.dumps(value) if value else None

    @property
    def plan(self):
        return json.loads(self.plan_json) if self.plan_json else None

    @plan.setter
    def plan(self, value):
        self.plan_json = json.dumps(value) if value else None


# ---- Scope Log ----

class ScopeLog(Base):
    __tablename__ = "scope_logs"

    id = Column(String, primary_key=True, default=generate_id)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    request = Column(Text, default="")
    classification = Column(String, default="")
    justification = Column(Text, default="")
    impact_json = Column(Text, default="{}", comment="JSON: {time, cost}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="scope_logs")

    @property
    def impact(self):
        return json.loads(self.impact_json) if self.impact_json else {}

    @impact.setter
    def impact(self, value):
        self.impact_json = json.dumps(value) if value else "{}"


# ---- Activity Log ----

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, default=generate_id)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, default="")
    message = Column(Text, default="")
    agent = Column(String, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="activity_logs")


# ---- Settings (single-row table) ----

class Settings(Base):
    __tablename__ = "settings"

    id = Column(String, primary_key=True, default="default")
    company_name = Column(String, default="Your Company")
    currency = Column(String, default="USD")
    default_rate = Column(String, default="100")
    auto_save = Column(String, default="true")
    notifications = Column(String, default="true")

