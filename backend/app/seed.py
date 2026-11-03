# ========================================
# STRATIFY AI — Demo Data Seeder
# ========================================

from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.models.models import Project, ScopeLog, ActivityLog, generate_id


def seed_database(db: Session):
    """Seed the database with two demo projects."""

    now = datetime.now(timezone.utc)

    # ---- Project 1: NovaTech Solutions ----
    p1 = Project(
        id="demo_1",
        status="active",
        client_name="Marcus Chen",
        company="NovaTech Solutions",
        email="marcus@novatech.io",
        created_at=now - timedelta(days=5),
        updated_at=now - timedelta(days=1),
    )
    p1.requirements = {
        "objective": "Build an employee management portal with real-time analytics dashboard, role-based access, and automated reporting",
        "features": [
            "Employee onboarding workflow",
            "Real-time analytics dashboard",
            "Role-based access control (RBAC)",
            "Automated monthly reports",
            "Leave management system",
            "Performance review module",
        ],
        "userTypes": ["Admin", "HR Manager", "Employee", "Department Head"],
        "constraints": [
            "Must integrate with existing SAP system",
            "GDPR compliance required",
            "Support 500+ concurrent users",
        ],
        "risks": [
            "SAP integration complexity",
            "Data migration from legacy system",
            "Tight timeline for compliance requirements",
        ],
        "budgetRange": "$50,000 - $80,000",
        "timeline": "4-6 months",
        "rawInput": "We need an employee management portal...",
    }
    p1.proposal = {
        "problemStatement": "NovaTech Solutions currently relies on disparate spreadsheets and manual processes for employee management, leading to inefficiencies, data inconsistencies, and compliance risks.",
        "solution": "We propose building a modern, cloud-based Employee Management Portal that centralizes all HR operations into a single, intuitive platform with real-time analytics capabilities.",
        "features": [
            {"name": "Employee Onboarding Workflow", "description": "Automated onboarding process with document collection, task assignments, and progress tracking", "priority": "High", "complexity": "Medium", "estimate": "3 weeks"},
            {"name": "Real-time Analytics Dashboard", "description": "Interactive dashboard with KPIs, workforce metrics, and customizable reports", "priority": "High", "complexity": "High", "estimate": "4 weeks"},
            {"name": "Role-Based Access Control", "description": "Granular permissions system supporting Admin, HR, Employee, and Department Head roles", "priority": "Critical", "complexity": "Medium", "estimate": "2 weeks"},
            {"name": "Automated Reporting", "description": "Scheduled report generation with PDF/Excel export and email distribution", "priority": "Medium", "complexity": "Medium", "estimate": "2 weeks"},
            {"name": "Leave Management", "description": "Leave request, approval workflow, balance tracking, and calendar integration", "priority": "High", "complexity": "Low", "estimate": "2 weeks"},
            {"name": "Performance Reviews", "description": "Configurable review cycles, 360° feedback, and performance analytics", "priority": "Medium", "complexity": "High", "estimate": "3 weeks"},
        ],
        "timeline": [
            {"phase": "Discovery & Design", "duration": "2 weeks", "color": "#00d4ff"},
            {"phase": "Core Development", "duration": "8 weeks", "color": "#7c3aed"},
            {"phase": "Integration & Testing", "duration": "4 weeks", "color": "#10b981"},
            {"phase": "UAT & Launch", "duration": "2 weeks", "color": "#f59e0b"},
        ],
        "costEstimate": {"min": 55000, "max": 75000, "currency": "USD"},
        "assumptions": [
            "SAP provides API access for integration",
            "Client provides test data for development",
            "Hosting infrastructure managed by client",
            "Content and branding assets provided by client",
        ],
        "valueProposition": "This solution will reduce HR administrative overhead by 60%, enable real-time workforce insights, and ensure full GDPR compliance.",
        "status": "sent",
    }
    p1.plan = {
        "modules": [
            {
                "id": "mod_1", "name": "Authentication & RBAC",
                "tasks": [
                    {"id": "t1", "name": "Design auth flow", "status": "done", "priority": "critical", "effort": "Medium"},
                    {"id": "t2", "name": "Implement JWT auth", "status": "done", "priority": "critical", "effort": "Medium"},
                    {"id": "t3", "name": "Build RBAC middleware", "status": "in-progress", "priority": "critical", "effort": "High"},
                    {"id": "t4", "name": "Role management UI", "status": "todo", "priority": "high", "effort": "Medium"},
                ],
            },
            {
                "id": "mod_2", "name": "Analytics Dashboard",
                "tasks": [
                    {"id": "t5", "name": "Design dashboard layout", "status": "done", "priority": "high", "effort": "Low"},
                    {"id": "t6", "name": "Build chart components", "status": "in-progress", "priority": "high", "effort": "High"},
                    {"id": "t7", "name": "Implement data aggregation API", "status": "todo", "priority": "high", "effort": "High"},
                    {"id": "t8", "name": "Real-time WebSocket updates", "status": "todo", "priority": "medium", "effort": "High"},
                ],
            },
            {
                "id": "mod_3", "name": "Employee Onboarding",
                "tasks": [
                    {"id": "t9", "name": "Design onboarding workflow", "status": "todo", "priority": "high", "effort": "Low"},
                    {"id": "t10", "name": "Build form components", "status": "todo", "priority": "high", "effort": "Medium"},
                    {"id": "t11", "name": "Document upload system", "status": "todo", "priority": "medium", "effort": "Medium"},
                    {"id": "t12", "name": "Email notifications", "status": "todo", "priority": "low", "effort": "Low"},
                ],
            },
        ],
        "milestones": [
            {"name": "Core Auth Complete", "date": "2026-04-15", "status": "completed"},
            {"name": "Dashboard MVP", "date": "2026-05-01", "status": "in-progress"},
            {"name": "Onboarding Ready", "date": "2026-05-20", "status": "upcoming"},
            {"name": "SAP Integration", "date": "2026-06-10", "status": "upcoming"},
            {"name": "UAT Launch", "date": "2026-06-25", "status": "upcoming"},
        ],
    }

    db.add(p1)

    # Scope logs for project 1
    db.add(ScopeLog(
        id="scope_1", project_id="demo_1",
        request="Can we add a chatbot for employee queries?",
        classification="out-scope",
        justification="A chatbot with NLP capabilities was not part of the original scope.",
        impact_json='{"time": "+4-6 weeks", "cost": "+$15,000-$20,000"}',
        created_at=now - timedelta(days=2),
    ))
    db.add(ScopeLog(
        id="scope_2", project_id="demo_1",
        request="Add leave balance to the analytics dashboard",
        classification="in-scope",
        justification="Leave management and analytics dashboard are both in the original scope.",
        impact_json='{"time": "No additional time", "cost": "Included"}',
        created_at=now - timedelta(days=3),
    ))

    # Activity logs for project 1
    for a in [
        ("a1", "scope", 'Scope evaluation: "Add chatbot" classified as Out of Scope', "auditor", 2),
        ("a2", "task", 'Task "Build chart components" moved to In Progress', "planner", 3),
        ("a3", "proposal", "Proposal sent to client", "consultant", 4),
        ("a4", "analysis", "Requirements analysis completed with 6 features extracted", "analyst", 5),
        ("a5", "created", "Project created", "orchestrator", 5),
    ]:
        db.add(ActivityLog(
            id=a[0], project_id="demo_1", type=a[1], message=a[2], agent=a[3],
            created_at=now - timedelta(days=a[4]),
        ))

    # ---- Project 2: GreenLeaf Organics ----
    p2 = Project(
        id="demo_2",
        status="proposal",
        client_name="Sarah Williams",
        company="GreenLeaf Organics",
        email="sarah@greenleaf.com",
        created_at=now - timedelta(days=2),
        updated_at=now - timedelta(days=1),
    )
    p2.requirements = {
        "objective": "E-commerce platform for organic food delivery with subscription model",
        "features": [
            "Product catalog with categories",
            "Subscription box management",
            "Payment gateway integration",
            "Delivery tracking",
            "Customer reviews & ratings",
        ],
        "userTypes": ["Customer", "Admin", "Delivery Partner"],
        "constraints": ["Launch within 3 months", "PCI-DSS compliance for payments", "Mobile-first design"],
        "risks": ["Payment gateway integration timeline", "Delivery partner API availability"],
        "budgetRange": "$30,000 - $50,000",
        "timeline": "3 months",
        "rawInput": "We want to build an e-commerce platform for organic food delivery...",
    }
    db.add(p2)

    for a in [
        ("a6", "analysis", "Requirements analysis completed", "analyst", 2),
        ("a7", "created", "Project created", "orchestrator", 2),
    ]:
        db.add(ActivityLog(
            id=a[0], project_id="demo_2", type=a[1], message=a[2], agent=a[3],
            created_at=now - timedelta(days=a[4]),
        ))

    db.commit()

