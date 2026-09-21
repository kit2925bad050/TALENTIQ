import logging
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from app.models.schemas import Employee, InternalRole, CareerRoadmap, GeneratedDocumentItem
from app.services.db_service import db
from app.services.s3_service import upload_file_to_s3, get_s3_file_url
from app.services.gemini_service import _call_gemini_text

logger = logging.getLogger(__name__)

def generate_career_development_report(
    employee: Employee,
    target_role: Optional[InternalRole] = None,
    roadmap: Optional[CareerRoadmap] = None,
    report_type: str = "career_development"
) -> GeneratedDocumentItem:
    """
    Generate a professional Career Development / Learning Plan report using Gemini and verified employee profile data,
    store the generated report in AWS S3 under employees/{uid}/generated_reports/{doc_id}.html,
    and save the document record in Firestore/DB.
    """
    doc_id = f"rep-{uuid.uuid4().hex[:8]}"
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    role_title = target_role.title if target_role else (employee.targetRoleId or "Target Technical Role")
    skills_list = ", ".join([s.name for s in employee.skills]) if employee.skills else "Pending verification"
    certs_list = ", ".join([c.name for c in employee.certifications]) if employee.certifications else "None listed"
    projects_list = "\n".join([f"- **{p.title}** ({p.role}): {p.description}" for p in employee.projects]) if employee.projects else "None listed"
    
    # Generate executive career development synthesis with Gemini
    ai_synthesis_prompt = f"""
    You are TalentIQ AI's Principal Career Development Officer.
    Generate a comprehensive, structured Career Development & Skill Mastery Report for:
    - Candidate Name: {employee.name}
    - Current Designation: {employee.designation} ({employee.department})
    - Target Internal Role: {role_title}
    - Verified Skills: {skills_list}
    - Certifications: {certs_list}
    - Verified Projects:
    {projects_list}

    Structure the report with:
    1. Executive Summary & Career Trajectory
    2. Verified Competency Audit & Evidence Matrix
    3. Targeted Skill Gap Analysis & Priority Learning Order
    4. Strategic 4-Phase Transition Roadmap
    5. AI Mentor Recommendations & Milestone Deliverables
    """
    
    ai_body = _call_gemini_text(
        prompt=ai_synthesis_prompt,
        system_instruction="You are TalentIQ AI Career Intelligence Engine. Generate professional, actionable, evidence-grounded reports."
    )
    
    if not ai_body:
        ai_body = f"""
## Executive Summary
Candidate **{employee.name}** is actively progressing along the technical career mobility pathway toward **{role_title}**.

### Verified Competency Audit
- **Verified Skills on Record**: {skills_list}
- **Accredited Certifications**: {certs_list}

### Strategic Development Directives
1. **Accelerated Pedagogical Learning**: Master container orchestration (Docker) and ML inference deployment.
2. **Hands-On Capstone Execution**: Implement production containerized microservices to prove operational readiness.
3. **Internal Mobility Transition**: Complete peer review and mentor checkpoints for seamless departmental mobility.
"""

    report_title = f"TalentIQ AI Career Development Report - {employee.name} ({role_title})"
    
    # HTML formatted document with glassmorphic styling
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{report_title}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #0b0f19;
            color: #f1f5f9;
            margin: 0;
            padding: 40px;
            line-height: 1.6;
        }}
        .report-card {{
            max-width: 900px;
            margin: 0 auto;
            background: #111827;
            border: 1px solid #1e293b;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }}
        .header {{
            border-bottom: 2px solid #06b6d4;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .brand {{
            font-size: 24px;
            font-weight: 800;
            color: #38bdf8;
            letter-spacing: -0.5px;
        }}
        .badge {{
            background: rgba(6, 182, 212, 0.15);
            border: 1px solid #06b6d4;
            color: #22d3ee;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }}
        h1, h2, h3 {{ color: #ffffff; }}
        h2 {{ border-left: 4px solid #38bdf8; padding-left: 12px; margin-top: 30px; }}
        .meta-grid {{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            background: #0f172a;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid #334155;
        }}
        .meta-item label {{ font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; }}
        .meta-item p {{ margin: 4px 0 0 0; font-size: 14px; font-weight: 600; color: #f8fafc; }}
        .content {{ font-size: 14px; color: #cbd5e1; }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #1e293b;
            font-size: 12px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
        }}
    </style>
</head>
<body>
    <div class="report-card">
        <div class="header">
            <div>
                <div class="brand">TalentIQ AI</div>
                <div style="font-size: 12px; color: #94a3b8;">Autonomous Skill Development & Internal Career Mobility Platform</div>
            </div>
            <span class="badge">Official AI Career Intelligence Report</span>
        </div>

        <div class="meta-grid">
            <div class="meta-item">
                <label>Candidate Name</label>
                <p>{employee.name}</p>
            </div>
            <div class="meta-item">
                <label>Current Designation</label>
                <p>{employee.designation} ({employee.department})</p>
            </div>
            <div class="meta-item">
                <label>Target Internal Role</label>
                <p>{role_title}</p>
            </div>
            <div class="meta-item">
                <label>Report Timestamp</label>
                <p>{now_str}</p>
            </div>
        </div>

        <div class="content">
            {ai_body.replace(chr(10), '<br/>')}
        </div>

        <div class="footer">
            <span>Report ID: {doc_id} • Authenticated Employee: {employee.id}</span>
            <span>Security Classification: Internal Enterprise Mobility</span>
        </div>
    </div>
</body>
</html>
"""

    s3_key = f"employees/{employee.id}/generated_reports/{doc_id}.html"
    
    # Upload report to S3
    try:
        upload_file_to_s3(
            file_bytes=html_content.encode('utf-8'),
            key=s3_key,
            content_type="text/html"
        )
        download_url = get_s3_file_url(s3_key)
    except Exception as e:
        logger.warning(f"S3 report upload fallback: {e}")
        download_url = f"https://talentiq-assets.s3.amazonaws.com/{s3_key}"

    doc_item = GeneratedDocumentItem(
        documentId=doc_id,
        ownerUid=employee.id,
        documentType=report_type,
        title=report_title,
        s3Key=s3_key,
        downloadUrl=download_url,
        createdAt=now_str,
        metadata={
            "targetRole": role_title,
            "skillsAnalyzed": len(employee.skills),
            "reportFormat": "HTML/PDF"
        }
    )
    
    db.save_generated_document(doc_item)
    return doc_item
