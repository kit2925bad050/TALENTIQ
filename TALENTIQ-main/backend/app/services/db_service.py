import json
import logging
import os
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.models.schemas import (
    Employee, EmployeeCreate, InternalRole, InternalRoleCreate,
    SkillItem, HiddenSkill, Certification, ProjectItem, LearningActivity,
    LearningPath, SkillProgressItem, DocumentItem, ExtractedProfileData,
    GeneratedDocumentItem, CertificateItem
)

logger = logging.getLogger(__name__)

# Sample Seed Data for Instant Hackathon Demonstration
DEFAULT_EMPLOYEES: List[Dict[str, Any]] = [
    {
        "id": "emp-alex-chen",
        "name": "Alex Chen",
        "email": "alex.chen@talentiq.ai",
        "department": "Engineering",
        "designation": "Senior Data Analyst",
        "experienceYears": 4.5,
        "summary": "Data specialist experienced in exploratory data analysis, predictive statistical models, and cross-functional ETL pipelines in Python and SQL. Led analytics sprint teams to deliver real-time enterprise monitoring dashboards.",
        "location": "San Francisco, CA (Hybrid)",
        "education": "B.S. in Computer Science & Statistics, UC Berkeley",
        "profilePhotoUrl": None,
        "profilePhotoKey": None,
        "resumeUrl": None,
        "skills": [
            {"name": "Python", "category": "Core", "proficiency": 92, "verified": True, "evidence": "Primary language for 4+ years"},
            {"name": "SQL", "category": "Core", "proficiency": 95, "verified": True, "evidence": "Complex query optimization and schema design"},
            {"name": "Machine Learning", "category": "Core", "proficiency": 80, "verified": True, "evidence": "Scikit-Learn, XGBoost regression models"},
            {"name": "Data Analysis", "category": "Core", "proficiency": 90, "verified": True, "evidence": "Pandas, NumPy, Statistical Hypothesis Testing"},
            {"name": "Tableau", "category": "Advanced", "proficiency": 85, "verified": True, "evidence": "Executive dashboards for 500+ daily users"},
            {"name": "FastAPI", "category": "Advanced", "proficiency": 75, "verified": True, "evidence": "Built internal prediction microservices"},
            {"name": "Git & GitHub", "category": "Core", "proficiency": 88, "verified": True, "evidence": "Daily collaborative workflow"},
            {"name": "Docker", "category": "Emerging", "proficiency": 25, "verified": False, "evidence": "Basic container usage in local environment"},
            {"name": "MLOps", "category": "Emerging", "proficiency": 10, "verified": False, "evidence": "Theoretical knowledge"}
        ],
        "hiddenSkills": [
            {
                "name": "Technical Leadership",
                "detectedFrom": "Led a team of 5 developers and delivered an analytics dashboard",
                "confidence": 94,
                "category": "Transferable",
                "explanation": "Detected from team coordination, code reviews, and project ownership."
            },
            {
                "name": "Cross-functional Stakeholder Management",
                "detectedFrom": "Presented weekly predictive insights to VP of Product and Operations",
                "confidence": 89,
                "category": "Transferable",
                "explanation": "Identified from translating data findings to non-technical executive teams."
            },
            {
                "name": "Data Storytelling & UX",
                "detectedFrom": "Redesigned KPI visual reports reducing customer churn discovery time by 40%",
                "confidence": 91,
                "category": "Transferable",
                "explanation": "Extracted from visual design choices and workflow friction reduction."
            },
            {
                "name": "Incident Resolution & Debugging",
                "detectedFrom": "Maintained 99.9% uptime on internal anomaly detection service",
                "confidence": 86,
                "category": "Transferable",
                "explanation": "Demonstrated through rapid root cause analysis and post-mortem execution."
            }
        ],
        "certifications": [
            {"name": "AWS Certified Data Analytics - Specialty", "issuer": "Amazon Web Services", "issueDate": "2024-05"},
            {"name": "Deep Learning Specialization", "issuer": "DeepLearning.AI", "issueDate": "2023-11"}
        ],
        "projects": [
            {
                "title": "Real-time Customer Retention Predictor",
                "role": "Lead Data Scientist / Engineer",
                "description": "Architected end-to-end churn prediction pipeline processing 2M daily events using Python, XGBoost, and FastAPI with automated Slack alerting.",
                "technologies": ["Python", "Machine Learning", "FastAPI", "SQL", "Docker"],
                "impact": "Reduced customer churn by 14% within 6 months."
            },
            {
                "title": "Enterprise KPI Executive Portal",
                "role": "Lead Developer & Scrum Master",
                "description": "Led team of 5 developers to create unified analytics portal consolidating 12 siloed departmental databases into interactive Tableau & SQL reporting views.",
                "technologies": ["SQL", "Tableau", "Data Analysis", "Leadership"],
                "impact": "Adopted by 500+ employees as single source of organizational truth."
            }
        ],
        "learningActivities": [
            {"title": "Docker & Containerization for Data Systems", "type": "Course", "skillTarget": "Docker", "status": "In Progress", "progress": 65, "estimatedHours": 8},
            {"title": "Kubernetes Microservice Orchestration", "type": "Lab", "skillTarget": "Kubernetes", "status": "In Progress", "progress": 30, "estimatedHours": 12},
            {"title": "MLOps End-to-End Pipelines with MLflow", "type": "Project", "skillTarget": "MLOps", "status": "Recommended", "progress": 0, "estimatedHours": 15}
        ],
        "targetRoleId": "role-ml-engineer",
        "createdAt": "2025-01-10T10:00:00Z",
        "updatedAt": "2026-02-15T14:30:00Z"
    },
    {
        "id": "emp-priya-sharma",
        "name": "Priya Sharma",
        "email": "priya.sharma@talentiq.ai",
        "department": "Engineering",
        "designation": "Backend Software Engineer",
        "experienceYears": 3.8,
        "summary": "High-throughput backend systems engineer specializing in Go, Python microservices, and distributed caching. Passionate about cloud scalability and zero-downtime deployments.",
        "location": "Austin, TX (Remote)",
        "education": "B.Tech in Information Technology",
        "profilePhotoUrl": None,
        "profilePhotoKey": None,
        "resumeUrl": None,
        "skills": [
            {"name": "Python", "category": "Core", "proficiency": 88, "verified": True},
            {"name": "Go", "category": "Core", "proficiency": 90, "verified": True},
            {"name": "Docker", "category": "Core", "proficiency": 85, "verified": True},
            {"name": "Kubernetes", "category": "Advanced", "proficiency": 78, "verified": True},
            {"name": "PostgreSQL", "category": "Core", "proficiency": 86, "verified": True},
            {"name": "AWS", "category": "Advanced", "proficiency": 82, "verified": True}
        ],
        "hiddenSkills": [
            {
                "name": "Distributed Systems Troubleshooting",
                "detectedFrom": "Diagnosed gRPC connection pool bottleneck under 50k RPS load",
                "confidence": 92,
                "category": "Transferable",
                "explanation": "Extracted from latency profiling and distributed tracing implementations."
            }
        ],
        "certifications": [
            {"name": "AWS Certified Solutions Architect", "issuer": "AWS", "issueDate": "2024-08"}
        ],
        "projects": [
            {
                "title": "Global Auth & Identity Gateway",
                "role": "Core Backend Contributor",
                "description": "Engineered OAuth2/JWT token validation service handling 40,000 req/sec with Redis cluster caching.",
                "technologies": ["Go", "Docker", "Kubernetes", "AWS", "PostgreSQL"],
                "impact": "Cut peak auth latency by 62%."
            }
        ],
        "learningActivities": [],
        "targetRoleId": "role-cloud-architect",
        "createdAt": "2025-02-01T09:00:00Z",
        "updatedAt": "2026-01-20T11:00:00Z"
    },
    {
        "id": "emp-marcus-vance",
        "name": "Marcus Vance",
        "email": "marcus.vance@talentiq.ai",
        "department": "Product",
        "designation": "Technical Product Manager",
        "experienceYears": 6.0,
        "summary": "Product leader bridging developer tooling with high-impact customer UX. Expert in agile roadmap delivery, product instrumentation, and AI usability workflows.",
        "location": "New York, NY (Hybrid)",
        "education": "M.S. in Human-Computer Interaction",
        "profilePhotoUrl": None,
        "profilePhotoKey": None,
        "resumeUrl": None,
        "skills": [
            {"name": "Product Strategy", "category": "Core", "proficiency": 95, "verified": True},
            {"name": "Agile & Scrum", "category": "Core", "proficiency": 94, "verified": True},
            {"name": "Data Analysis", "category": "Core", "proficiency": 82, "verified": True},
            {"name": "User Research", "category": "Advanced", "proficiency": 88, "verified": True},
            {"name": "SQL", "category": "Advanced", "proficiency": 78, "verified": True}
        ],
        "hiddenSkills": [
            {
                "name": "AI Product Requirement Synthesis",
                "detectedFrom": "Authored PRDs for conversational enterprise AI assistants",
                "confidence": 95,
                "category": "Transferable",
                "explanation": "Derived from structuring prompt guardrails and conversational UX workflows."
            }
        ],
        "certifications": [],
        "projects": [
            {
                "title": "Enterprise AI Workflow Builder",
                "role": "Principal PM",
                "description": "Spearheaded zero-to-one launch of automated workflow orchestration tool used across 80+ customer organizations.",
                "technologies": ["Product Strategy", "User Research", "Agile & Scrum"],
                "impact": "Generated $1.8M ARR in first 90 days."
            }
        ],
        "learningActivities": [],
        "targetRoleId": None,
        "createdAt": "2024-11-15T08:00:00Z",
        "updatedAt": "2026-03-01T15:20:00Z"
    }
]

DEFAULT_ROLES: List[Dict[str, Any]] = [
    {
        "id": "role-ml-engineer",
        "title": "Machine Learning Engineer",
        "department": "AI & Advanced Analytics",
        "description": "Join our Core AI platform team to design, fine-tune, containerize, and deploy production machine learning models and LLM agent pipelines at scale.",
        "requiredSkills": ["Python", "Machine Learning", "SQL", "Data Analysis", "Docker", "MLOps"],
        "preferredSkills": ["FastAPI", "Kubernetes", "PyTorch", "AWS"],
        "experienceRequired": 3.0,
        "openPositions": 3,
        "urgency": "High",
        "location": "Hybrid / HQ",
        "postedAt": "2026-01-15T00:00:00Z",
        "updatedAt": "2026-02-10T00:00:00Z"
    },
    {
        "id": "role-cloud-architect",
        "title": "Cloud Infrastructure Architect",
        "department": "Platform Engineering",
        "description": "Architect resilient multi-region cloud infrastructures on AWS and Kubernetes. Define infrastructure-as-code patterns and cost optimization governance.",
        "requiredSkills": ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Python"],
        "preferredSkills": ["Go", "Security Compliance", "Distributed Systems"],
        "experienceRequired": 5.0,
        "openPositions": 2,
        "urgency": "High",
        "location": "Remote",
        "postedAt": "2026-02-01T00:00:00Z",
        "updatedAt": "2026-02-20T00:00:00Z"
    },
    {
        "id": "role-senior-data-analyst",
        "title": "Lead Business Intelligence Analyst",
        "department": "Strategic Growth",
        "description": "Drive strategic executive decisions through advanced SQL modeling, Tableau visualization suites, and customer cohort lifetime value forecasting.",
        "requiredSkills": ["SQL", "Tableau", "Data Analysis", "Python", "Data Storytelling & Executive Communication"],
        "preferredSkills": ["Snowflake", "dbt", "Statistical Modeling"],
        "experienceRequired": 4.0,
        "openPositions": 1,
        "urgency": "Medium",
        "location": "New York, NY",
        "postedAt": "2026-02-10T00:00:00Z",
        "updatedAt": "2026-02-10T00:00:00Z"
    },
    {
        "id": "role-fullstack-ai-dev",
        "title": "Full Stack AI Applications Engineer",
        "department": "Product Engineering",
        "description": "Build high-performance interactive generative UI experiences combining React/TypeScript frontends with fast Python/FastAPI microservices and vector databases.",
        "requiredSkills": ["React", "TypeScript", "Python", "FastAPI", "Tailwind CSS"],
        "preferredSkills": ["Docker", "GraphQL", "Vector Databases"],
        "experienceRequired": 2.5,
        "openPositions": 4,
        "urgency": "High",
        "location": "Hybrid",
        "postedAt": "2026-03-01T00:00:00Z",
        "updatedAt": "2026-03-01T00:00:00Z"
    }
]

class DatabaseService:
    def __init__(self):
        self.employees: Dict[str, Employee] = {}
        self.roles: Dict[str, InternalRole] = {}
        self.documents: Dict[str, List[DocumentItem]] = {}  # ownerUid -> List[DocumentItem]
        self.generated_documents: Dict[str, List[GeneratedDocumentItem]] = {}  # ownerUid -> List[GeneratedDocumentItem]
        self.certificates: Dict[str, CertificateItem] = {}  # certificateId -> CertificateItem
        self.notifications: List[Dict[str, Any]] = []
        self.learning_paths: Dict[str, LearningPath] = {}  # employeeId_skillName -> LearningPath
        self.skill_progress: Dict[str, SkillProgressItem] = {}  # employeeId_skillName -> SkillProgressItem
        self.quizzes: Dict[str, Any] = {}
        self._load_initial_data()

    def _load_initial_data(self):
        for e in DEFAULT_EMPLOYEES:
            emp_data = dict(e)
            emp_data["profileStatus"] = "VERIFIED"
            emp = Employee(**emp_data)
            self.employees[emp.id] = emp
        for r in DEFAULT_ROLES:
            role = InternalRole(**r)
            self.roles[role.id] = role
        self.notifications = [
            {
                "id": "notif-1",
                "title": "Internal Opportunity Match",
                "message": "You have an 87% profile alignment with Machine Learning Engineer!",
                "timestamp": "10m ago",
                "read": False,
                "type": "match"
            },
            {
                "id": "notif-2",
                "title": "AI Hidden Skills Discovered",
                "message": "TalentIQ discovered 4 transferable leadership & storytelling skills from your projects.",
                "timestamp": "2h ago",
                "read": False,
                "type": "ai"
            }
        ]
        # Seed initial skill progress for Alex Chen
        self.skill_progress["emp-alex-chen_Docker"] = SkillProgressItem(
            employeeId="emp-alex-chen",
            skillName="Docker",
            currentLevel=25,
            targetLevel=85,
            lessonsCompleted=2,
            totalLessons=6,
            assessmentScore=60,
            attempts=1,
            masteryStatus="LEARNING",
            lastActivityAt=datetime.utcnow().isoformat() + "Z"
        )
        # Seed initial official certificate for Alex Chen matching the design
        self.certificates["TIQ-SM-2026-000124"] = CertificateItem(
            id="TIQ-SM-2026-000124",
            employeeId="emp-alex-chen",
            recipientName="Alex Chen",
            skillName="Python Programming",
            courseTitle="Advanced Python & Data Engineering Mastery",
            achievementScore=92,
            skillLevel="Advanced",
            issuedOn="19 September 2026",
            certificateType="Skill Mastery",
            verifyUrl="https://tiq.ai/verify/TIQ-SM-2026-000124",
            signatory1Name="Sridharan V.R",
            signatory1Title="Founder, TALENTIQ AI",
            signatory2Name="Authorized Signatory",
            signatory2Title="TALENTIQ AI",
            description="The recipient has successfully completed the assigned learning missions, practical exercises, assessments and AI-guided evaluation conducted through the TALENTIQ AI Skill Mentor platform.",
            createdAt="2026-09-19T10:00:00Z"
        )

    def reset_demo_data(self):
        self.employees.clear()
        self.roles.clear()
        self.documents.clear()
        self.certificates.clear()
        self.learning_paths.clear()
        self.skill_progress.clear()
        self._load_initial_data()
        return {"status": "success", "message": "Demo data loaded successfully."}

    def clear_all(self):
        self.employees.clear()
        self.roles.clear()
        self.documents.clear()
        self.certificates.clear()
        self.notifications.clear()
        self.learning_paths.clear()
        self.skill_progress.clear()
        return {"status": "success", "message": "All workforce data cleared."}

    # ================= Certificate Store =================
    def save_certificate(self, cert: CertificateItem) -> CertificateItem:
        self.certificates[cert.id] = cert
        return cert

    def get_employee_certificates(self, employee_id: str) -> List[CertificateItem]:
        emp = self.get_employee(employee_id)
        emp_id_to_match = emp.id if emp else employee_id
        return [c for c in self.certificates.values() if c.employeeId == emp_id_to_match or (emp and c.employeeId == emp.email)]

    def get_certificate_by_id(self, certificate_id: str) -> Optional[CertificateItem]:
        return self.certificates.get(certificate_id)

    # ================= Document Store =================
    def save_document(self, doc: DocumentItem) -> DocumentItem:
        if doc.ownerUid not in self.documents:
            self.documents[doc.ownerUid] = []
        self.documents[doc.ownerUid] = [d for d in self.documents[doc.ownerUid] if d.documentId != doc.documentId]
        self.documents[doc.ownerUid].append(doc)
        return doc

    def get_employee_documents(self, owner_uid: str) -> List[DocumentItem]:
        return self.documents.get(owner_uid, [])

    def save_generated_document(self, doc: GeneratedDocumentItem) -> GeneratedDocumentItem:
        if doc.ownerUid not in self.generated_documents:
            self.generated_documents[doc.ownerUid] = []
        self.generated_documents[doc.ownerUid] = [d for d in self.generated_documents[doc.ownerUid] if d.documentId != doc.documentId]
        self.generated_documents[doc.ownerUid].append(doc)
        return doc

    def get_employee_generated_documents(self, owner_uid: str) -> List[GeneratedDocumentItem]:
        return self.generated_documents.get(owner_uid, [])

    def verify_and_update_employee_profile(
        self,
        uid: str,
        verified_data: ExtractedProfileData,
        email: Optional[str] = None
    ) -> Employee:
        existing = self.employees.get(uid)
        now_str = datetime.utcnow().isoformat() + "Z"
        
        name = verified_data.name or (existing.name if existing else "Verified Professional")
        user_email = email or (existing.email if existing else f"{uid}@talentiq.local")
        dept = verified_data.department or (existing.department if existing else "Engineering")
        desig = verified_data.designation or (existing.designation if existing else "Specialist")
        exp_years = verified_data.experienceYears if verified_data.experienceYears is not None else (existing.experienceYears if existing else 1.0)
        summary = verified_data.summary or (existing.summary if existing else "Verified TalentIQ AI Professional Profile.")
        education = verified_data.education or verified_data.qualification or (existing.education if existing else "")
        
        # Merge skills (deduplicating by lowercase name)
        existing_skills = {s.name.lower(): s for s in (existing.skills if existing else [])}
        for s in verified_data.skills:
            existing_skills[s.name.lower()] = s
        merged_skills = list(existing_skills.values())

        # Merge certifications
        existing_certs = {c.name.lower(): c for c in (existing.certifications if existing else [])}
        for c in verified_data.certifications:
            existing_certs[c.name.lower()] = c
        merged_certs = list(existing_certs.values())

        # Merge projects
        existing_projs = {p.title.lower(): p for p in (existing.projects if existing else [])}
        for p in verified_data.projects:
            existing_projs[p.title.lower()] = p
        merged_projs = list(existing_projs.values())

        updated_emp = Employee(
            id=uid,
            name=name,
            email=user_email,
            department=dept,
            designation=desig,
            experienceYears=exp_years,
            summary=summary,
            location=existing.location if existing else "Remote",
            education=education,
            profilePhotoUrl=existing.profilePhotoUrl if existing else None,
            resumeUrl=existing.resumeUrl if existing else None,
            profileStatus="VERIFIED",
            skills=merged_skills,
            hiddenSkills=[],  # reset/re-detect on demand based on verified data
            certifications=merged_certs,
            projects=merged_projs,
            learningActivities=existing.learningActivities if existing else [],
            targetRoleId=existing.targetRoleId if existing else "role-ml-engineer",
            createdAt=existing.createdAt if existing else now_str,
            updatedAt=now_str
        )
        self.employees[uid] = updated_emp
        logger.info(f"Verified and persisted employee profile for UID='{uid}' with {len(merged_skills)} skills and {len(merged_certs)} certifications.")
        return updated_emp

    # ================= Employee CRUD =================
    def get_employees(
        self,
        skip: int = 0,
        limit: int = 50,
        search_skill: Optional[str] = None,
        department: Optional[str] = None
    ) -> List[Employee]:
        emps = list(self.employees.values())
        if search_skill:
            term = search_skill.lower().strip()
            emps = [
                e for e in emps
                if any(term in s.name.lower() for s in e.skills) or
                   any(term in hs.name.lower() for hs in e.hiddenSkills) or
                   term in e.name.lower() or
                   term in e.designation.lower()
            ]
        if department:
            emps = [e for e in emps if e.department.lower() == department.lower()]
            
        return emps[skip: skip + limit]

    def get_employee(self, emp_id: Optional[str]) -> Optional[Employee]:
        if not emp_id:
            return None
            
        # 1. Exact match
        if emp_id in self.employees:
            return self.employees[emp_id]
            
        # 2. Email exact match
        emp_id_lower = emp_id.lower().strip()
        for e in self.employees.values():
            if e.email.lower() == emp_id_lower:
                return e

        # Return None for any non-existent / new user UID - DO NOT AUTO-CREATE FAKE DATA
        return None

    def create_employee(self, data: EmployeeCreate) -> Employee:
        emp_id = f"emp-{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow().isoformat() + "Z"
        emp = Employee(
            id=emp_id,
            name=data.name,
            email=data.email,
            department=data.department,
            designation=data.designation,
            experienceYears=data.experienceYears,
            summary=data.summary,
            location=data.location or "Remote",
            education=data.education or "B.S. in Computer Science",
            skills=data.skills,
            hiddenSkills=[],
            certifications=[],
            projects=[],
            learningActivities=[],
            createdAt=now,
            updatedAt=now
        )
        self.employees[emp_id] = emp
        return emp

    def update_employee(self, emp_id: str, updates: Dict[str, Any]) -> Optional[Employee]:
        emp = self.employees.get(emp_id)
        if not emp:
            return None
        emp_dict = emp.model_dump()
        emp_dict.update(updates)
        emp_dict["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        updated_emp = Employee(**emp_dict)
        self.employees[emp_id] = updated_emp
        return updated_emp

    def update_employee_avatar(self, emp_id: str, photo_url: str, photo_key: Optional[str] = None) -> Employee:
        emp = self.employees.get(emp_id)
        if not emp:
            # Check by email
            for e in self.employees.values():
                if e.email.lower() == emp_id.lower():
                    emp = e
                    break
        if not emp:
            now = datetime.utcnow().isoformat() + "Z"
            emp = Employee(
                id=emp_id,
                name="Employee",
                email=f"{emp_id}@talentiq.local",
                department="Engineering",
                designation="Professional",
                experienceYears=0.0,
                summary="",
                location="",
                education="",
                profilePhotoUrl=photo_url,
                profilePhotoKey=photo_key,
                skills=[],
                hiddenSkills=[],
                certifications=[],
                projects=[],
                learningActivities=[],
                targetRoleId=None,
                profileStatus="PENDING",
                createdAt=now,
                updatedAt=now
            )
            self.employees[emp_id] = emp
            return emp

        emp.profilePhotoUrl = photo_url
        emp.profilePhotoKey = photo_key
        emp.updatedAt = datetime.utcnow().isoformat() + "Z"
        self.employees[emp.id] = emp
        return emp

    def remove_employee_avatar(self, emp_id: str) -> Optional[Employee]:
        emp = self.employees.get(emp_id)
        if not emp:
            for e in self.employees.values():
                if e.email.lower() == emp_id.lower():
                    emp = e
                    break
        if not emp:
            return None
        emp.profilePhotoUrl = None
        emp.profilePhotoKey = None
        emp.updatedAt = datetime.utcnow().isoformat() + "Z"
        self.employees[emp.id] = emp
        return emp


    def update_employee_skill_mastery(self, emp_id: str, skill_name: str, new_proficiency: int, is_mastered: bool = False):
        emp = self.employees.get(emp_id)
        if not emp:
            return None
        
        found = False
        for s in emp.skills:
            if s.name.lower() == skill_name.lower():
                s.proficiency = max(s.proficiency, new_proficiency)
                if is_mastered:
                    s.verified = True
                    s.category = "Advanced" if new_proficiency >= 85 else "Core"
                    s.evidence = f"Mastered through AI Skill Mentor curriculum ({datetime.utcnow().strftime('%b %Y')})"
                found = True
                break
                
        if not found:
            emp.skills.append(SkillItem(
                name=skill_name,
                category="Advanced" if new_proficiency >= 85 else "Core",
                proficiency=new_proficiency,
                verified=is_mastered,
                evidence="Mastered through AI Skill Mentor" if is_mastered else "In Progress"
            ))
            
        emp.updatedAt = datetime.utcnow().isoformat() + "Z"
        return emp

    # ================= AI Mentor Learning Paths & Progress =================
    def get_learning_path(self, employee_id: str, skill_name: str) -> Optional[LearningPath]:
        key = f"{employee_id}_{skill_name.lower()}"
        return self.learning_paths.get(key)

    def save_learning_path(self, learning_path: LearningPath) -> LearningPath:
        key = f"{learning_path.employeeId}_{learning_path.skillName.lower()}"
        self.learning_paths[key] = learning_path
        return learning_path

    def get_skill_progress(self, employee_id: str, skill_name: str) -> Optional[SkillProgressItem]:
        key = f"{employee_id}_{skill_name.lower()}"
        return self.skill_progress.get(key)

    def get_all_employee_progress(self, employee_id: str) -> List[SkillProgressItem]:
        prefix = f"{employee_id}_"
        return [v for k, v in self.skill_progress.items() if k.startswith(prefix)]

    def save_skill_progress(self, progress: SkillProgressItem) -> SkillProgressItem:
        key = f"{progress.employeeId}_{progress.skillName.lower()}"
        progress.lastActivityAt = datetime.utcnow().isoformat() + "Z"
        self.skill_progress[key] = progress
        return progress

    # ================= Internal Roles CRUD =================
    def get_roles(
        self,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        department: Optional[str] = None
    ) -> List[InternalRole]:
        roles = list(self.roles.values())
        if search:
            term = search.lower().strip()
            roles = [
                r for r in roles
                if term in r.title.lower() or
                   term in r.description.lower() or
                   any(term in s.lower() for s in r.requiredSkills)
            ]
        if department:
            roles = [r for r in roles if r.department.lower() == department.lower()]
            
        return roles[skip: skip + limit]

    def get_role(self, role_id: Optional[str]) -> Optional[InternalRole]:
        if not role_id:
            return self.roles.get("role-ml-engineer") or next(iter(self.roles.values()), None)
            
        if role_id in self.roles:
            return self.roles[role_id]
            
        # Match case-insensitively or title
        role_id_lower = role_id.lower().strip()
        for r in self.roles.values():
            if r.id.lower() == role_id_lower or r.title.lower() == role_id_lower:
                return r
            if role_id_lower in r.id.lower() or role_id_lower in r.title.lower():
                return r
                
        # Known aliases
        if "ml" in role_id_lower or "machine" in role_id_lower or "learning" in role_id_lower:
            return self.roles.get("role-ml-engineer")
        if "cloud" in role_id_lower or "architect" in role_id_lower or "infra" in role_id_lower:
            return self.roles.get("role-cloud-architect")
        if "data" in role_id_lower or "analyst" in role_id_lower or "bi" in role_id_lower:
            return self.roles.get("role-senior-data-analyst")
        if "full" in role_id_lower or "stack" in role_id_lower or "dev" in role_id_lower:
            return self.roles.get("role-fullstack-ai-dev")
            
        return self.roles.get("role-ml-engineer") or next(iter(self.roles.values()), None)

    def create_role(self, data: InternalRoleCreate) -> InternalRole:
        role_id = f"role-{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow().isoformat() + "Z"
        role = InternalRole(
            id=role_id,
            title=data.title,
            department=data.department,
            description=data.description,
            requiredSkills=data.requiredSkills,
            preferredSkills=data.preferredSkills,
            experienceRequired=data.experienceRequired,
            openPositions=data.openPositions,
            urgency=data.urgency,
            location=data.location,
            postedAt=now,
            updatedAt=now
        )
        self.roles[role_id] = role
        self.notifications.insert(0, {
            "id": f"notif-{uuid.uuid4().hex[:6]}",
            "title": "New Internal Opportunity",
            "message": f"New role posted: {role.title} in {role.department} ({role.openPositions} openings)",
            "timestamp": "Just now",
            "read": False,
            "type": "role"
        })
        return role

    def update_role(self, role_id: str, updates: Dict[str, Any]) -> Optional[InternalRole]:
        role = self.roles.get(role_id)
        if not role:
            return None
        role_dict = role.model_dump()
        role_dict.update(updates)
        role_dict["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        updated_role = InternalRole(**role_dict)
        self.roles[role_id] = updated_role
        return updated_role

    def delete_role(self, role_id: str) -> bool:
        if role_id in self.roles:
            del self.roles[role_id]
            return True
        return False

    # ================= Notifications =================
    def get_notifications(self) -> List[Dict[str, Any]]:
        return self.notifications

    def mark_notifications_read(self) -> None:
        for n in self.notifications:
            n["read"] = True

    # ================= Analytics & HR Intelligence =================
    def get_workforce_analytics(self) -> Dict[str, Any]:
        employees_list = list(self.employees.values())
        roles_list = list(self.roles.values())
        
        total_employees = len(employees_list)
        total_roles = len(roles_list)
        
        # Aggregate skills
        skill_counts: Dict[str, int] = {}
        for emp in employees_list:
            for s in emp.skills:
                skill_counts[s.name] = skill_counts.get(s.name, 0) + 1
            for hs in emp.hiddenSkills:
                skill_counts[hs.name] = skill_counts.get(hs.name, 0) + 1
                
        # Required skills demand
        role_skill_demand: Dict[str, int] = {}
        for r in roles_list:
            for s in r.requiredSkills:
                role_skill_demand[s] = role_skill_demand.get(s, 0) + 1

        # Emerging / Shortage Intelligence
        skill_shortages = []
        for s_name, demand_cnt in role_skill_demand.items():
            supply_cnt = skill_counts.get(s_name, 0)
            if demand_cnt > supply_cnt or supply_cnt == 0:
                skill_shortages.append({
                    "skill": s_name,
                    "demandRoles": demand_cnt,
                    "availableEmployees": supply_cnt,
                    "deficit": max(1, demand_cnt - supply_cnt),
                    "insight": f"{s_name} is required across {demand_cnt} role(s), but only {supply_cnt} employee(s) have verified proficiency."
                })
        skill_shortages.sort(key=lambda x: x["deficit"], reverse=True)

        dept_dist: Dict[str, int] = {}
        for emp in employees_list:
            dept_dist[emp.department] = dept_dist.get(emp.department, 0) + 1

        top_skills = sorted(
            [{"name": k, "count": v} for k, v in skill_counts.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:8]

        dept_chart = [{"name": k, "employees": v} for k, v in dept_dist.items()]

        return {
            "totalEmployees": total_employees,
            "trackedSkills": len(skill_counts),
            "internalOpportunities": total_roles,
            "criticalSkillGaps": len(skill_shortages),
            "topSkills": top_skills,
            "departmentDistribution": dept_chart,
            "skillShortages": skill_shortages[:5],
            "mobilityTrends": [
                {"month": "Oct", "internalMatches": 12, "transfersCompleted": 3},
                {"month": "Nov", "internalMatches": 19, "transfersCompleted": 5},
                {"month": "Dec", "internalMatches": 27, "transfersCompleted": 7},
                {"month": "Jan", "internalMatches": 38, "transfersCompleted": 11},
                {"month": "Feb", "internalMatches": 49, "transfersCompleted": 16},
                {"month": "Mar", "internalMatches": 64, "transfersCompleted": 22}
            ]
        }

    # ================= Talent Development Engine Stores =================
    def get_mentor_memory(self, employee_id: str) -> List[Dict[str, Any]]:
        return getattr(self, "_mentor_memory", {}).get(employee_id, [])

    def save_mentor_memory(
        self,
        employee_id: str,
        skill: str,
        concept: str,
        mistakes: Optional[List[str]] = None,
        successful_concepts: Optional[List[str]] = None,
        mastery_status: str = "LEARNING"
    ):
        if not hasattr(self, "_mentor_memory"):
            self._mentor_memory = {}
        if employee_id not in self._mentor_memory:
            self._mentor_memory[employee_id] = []
        
        now = datetime.utcnow().isoformat() + "Z"
        existing = next((m for m in self._mentor_memory[employee_id] if m["skill"].lower() == skill.lower()), None)
        if existing:
            existing["concept"] = concept
            existing["attempts"] += 1
            if mistakes:
                existing["mistakes"] = list(set(existing["mistakes"] + mistakes))
            if successful_concepts:
                existing["successfulConcepts"] = list(set(existing["successfulConcepts"] + successful_concepts))
            existing["lastActivity"] = now
            existing["masteryStatus"] = mastery_status
        else:
            self._mentor_memory[employee_id].append({
                "employeeId": employee_id,
                "skill": skill,
                "concept": concept,
                "attempts": 1,
                "mistakes": mistakes or [],
                "successfulConcepts": successful_concepts or [],
                "completedLessons": [concept],
                "lastActivity": now,
                "masteryStatus": mastery_status,
                "preferredStyle": "Step-by-step with practical code walkthroughs"
            })

    def get_learning_missions(self, employee_id: str) -> List[Dict[str, Any]]:
        if not hasattr(self, "_learning_missions"):
            self._learning_missions = {}
        return [m for m in self._learning_missions.values() if m["employeeId"] == employee_id]

    def get_or_create_mission(self, employee_id: str, skill_name: str, target_role: str = "Machine Learning Engineer") -> Dict[str, Any]:
        if not hasattr(self, "_learning_missions"):
            self._learning_missions = {}
        
        mission_id = f"mission-{employee_id}_{skill_name.lower().replace(' ', '_')}"
        if mission_id in self._learning_missions:
            return self._learning_missions[mission_id]

        now = datetime.utcnow().isoformat() + "Z"
        stages = [
            {"stageNumber": 1, "stageName": "Learn", "description": f"Master foundational concepts and architecture of {skill_name}.", "status": "ACTIVE", "score": None},
            {"stageNumber": 2, "stageName": "Understand", "description": "Interactive deep dive with AI Teacher explaining core mechanisms.", "status": "LOCKED", "score": None},
            {"stageNumber": 3, "stageName": "Practice", "description": "Hands-on coding exercise and terminal simulation.", "status": "LOCKED", "score": None},
            {"stageNumber": 4, "stageName": "Quiz", "description": "Adaptive knowledge benchmark test.", "status": "LOCKED", "score": None},
            {"stageNumber": 5, "stageName": "Project", "description": f"Real-world enterprise {skill_name} mini-project submission.", "status": "LOCKED", "score": None},
            {"stageNumber": 6, "stageName": "Evaluate", "description": "Automated code review & AI project evaluation.", "status": "LOCKED", "score": None},
            {"stageNumber": 7, "stageName": "Re-teach", "description": "Reinforce any detected weak spots and edge cases.", "status": "LOCKED", "score": None},
            {"stageNumber": 8, "stageName": "Master", "description": "Official TalentIQ Skill Mastery Credential issuance.", "status": "LOCKED", "score": None}
        ]
        
        mission = {
            "missionId": mission_id,
            "employeeId": employee_id,
            "skillName": skill_name,
            "targetRole": target_role,
            "currentStage": 1,
            "totalStages": 8,
            "progressPercent": 12,
            "stages": stages,
            "createdAt": now,
            "updatedAt": now
        }
        self._learning_missions[mission_id] = mission
        return mission

    def advance_learning_mission(self, mission_id: str, stage_number: int, evidence: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if not hasattr(self, "_learning_missions"):
            self._learning_missions = {}
        mission = self._learning_missions.get(mission_id)
        if not mission:
            return None
        
        for s in mission["stages"]:
            if s["stageNumber"] == stage_number:
                s["status"] = "COMPLETED"
                s["score"] = 90
                if evidence:
                    s["evidenceUrl"] = evidence
            elif s["stageNumber"] == stage_number + 1:
                s["status"] = "ACTIVE"
                
        mission["currentStage"] = min(8, stage_number + 1)
        mission["progressPercent"] = int((sum(1 for s in mission["stages"] if s["status"] == "COMPLETED") / 8) * 100)
        mission["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        return mission

    def get_internal_gigs(self) -> List[Dict[str, Any]]:
        if not hasattr(self, "_internal_gigs"):
            self._internal_gigs = [
                {
                    "id": "gig-1",
                    "title": "Containerize Core Analytics Microservice",
                    "department": "Engineering & Platform",
                    "description": "Migrate data ingestion scripts to robust multi-stage Docker containers with health checks.",
                    "requiredSkills": ["Docker", "Python", "Linux"],
                    "duration": "2 weeks (Part-time)",
                    "timeCommitment": "5 hrs/week",
                    "managerName": "Platform Lead",
                    "status": "OPEN"
                },
                {
                    "id": "gig-2",
                    "title": "Build Executive Customer Churn Predictive Pipeline",
                    "department": "Data Science",
                    "description": "Construct feature store and XGBoost classifier with FastAPI serving endpoint.",
                    "requiredSkills": ["Machine Learning", "Python", "FastAPI", "SQL"],
                    "duration": "3 weeks (Part-time)",
                    "timeCommitment": "8 hrs/week",
                    "managerName": "VP of Analytics",
                    "status": "OPEN"
                },
                {
                    "id": "gig-3",
                    "title": "Orchestrate Kubernetes CI/CD Deployment Action",
                    "department": "Cloud Platform",
                    "description": "Write Helm charts and GitHub Actions workflow for zero-downtime microservice updates.",
                    "requiredSkills": ["Kubernetes", "AWS", "Docker", "CI/CD"],
                    "duration": "2 weeks (Part-time)",
                    "timeCommitment": "6 hrs/week",
                    "managerName": "DevOps Architect",
                    "status": "OPEN"
                }
            ]
        return self._internal_gigs

    def create_internal_gig(self, gig: Dict[str, Any]) -> Dict[str, Any]:
        gigs = self.get_internal_gigs()
        gig_id = f"gig-{uuid.uuid4().hex[:6]}"
        gig["id"] = gig_id
        gigs.insert(0, gig)
        return gig

db = DatabaseService()

