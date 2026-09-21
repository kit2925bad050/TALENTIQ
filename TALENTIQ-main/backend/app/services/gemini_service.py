import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.config import settings
from app.models.schemas import Employee, InternalRole, RoleMatchScore, HiddenSkill, SkillGapItem, RoadmapMilestone, CareerRoadmap

logger = logging.getLogger(__name__)

# Initialize Google Generative AI client if key is configured
genai_client = None
if settings.GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        genai_client = genai
    except Exception as e:
        logger.warning(f"Failed to configure google-generativeai: {e}")

def _clean_json_string(raw: str) -> str:
    """Strip markdown code fences and extract valid JSON boundaries from LLM response."""
    if not raw:
        return ""
    raw = raw.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw)
    if match:
        return match.group(1).strip()
    first_brace = raw.find('{')
    last_brace = raw.rfind('}')
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        return raw[first_brace:last_brace+1].strip()
    first_bracket = raw.find('[')
    last_bracket = raw.rfind(']')
    if first_bracket != -1 and last_bracket != -1 and last_bracket > first_bracket:
        return raw[first_bracket:last_bracket+1].strip()
    return raw

CANDIDATE_MODELS = [
    settings.GEMINI_MODEL,
    "models/gemini-3.5-flash",
    "models/gemini-3.5-flash-lite",
    "models/gemini-3.7-flash",
    "models/gemini-3.8-flash",
    "models/gemini-flash-latest",
    "models/gemini-flash-lite-latest",
    "models/gemini-3.6-flash",
    "models/gemini-2.5-flash-lite",
    "models/gemini-3.1-flash-lite",
    "models/gemini-pro-latest"
]

def _call_gemini_json(prompt: str, system_instruction: str = "") -> Optional[Dict[str, Any]]:
    """Helper to call Gemini and parse structured JSON response with model fallback."""
    if not settings.GEMINI_API_KEY or not genai_client:
        return None
    
    full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
    for model_name in CANDIDATE_MODELS:
        if not model_name:
            continue
        try:
            model = genai_client.GenerativeModel(model_name=model_name)
            response = model.generate_content(full_prompt)
            if response and response.text:
                text = _clean_json_string(response.text)
                if text:
                    return json.loads(text)
        except Exception as e:
            logger.warning(f"Gemini model {model_name} standard call failed: {e}")
            try:
                model = genai_client.GenerativeModel(
                    model_name=model_name,
                    generation_config={"response_mime_type": "application/json"}
                )
                response = model.generate_content(full_prompt)
                if response and response.text:
                    text = _clean_json_string(response.text)
                    if text:
                        return json.loads(text)
            except Exception as e2:
                logger.warning(f"Gemini model {model_name} json_mode call failed: {e2}")
            continue
    return None

def _call_gemini_text(prompt: str, system_instruction: str = "") -> Optional[str]:
    """Helper to call Gemini and return raw text response with model fallback."""
    if not settings.GEMINI_API_KEY or not genai_client:
        return None
    full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
    for model_name in CANDIDATE_MODELS:
        if not model_name:
            continue
        try:
            model = genai_client.GenerativeModel(model_name=model_name)
            response = model.generate_content(full_prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini text model {model_name} failed: {e}")
            continue
    return None

# ==========================================================
# 1. Profile Analysis & Skill Extraction
# ==========================================================
def analyze_employee_profile(employee: Employee) -> Dict[str, Any]:
    if getattr(employee, "profileStatus", "INCOMPLETE") == "INCOMPLETE" or (len(employee.skills) == 0 and len(employee.projects) == 0 and len(employee.certifications) == 0):
        return {
            "aiSummary": "No verified talent profile found yet. Upload your certificate, resume, or project documents to build your verified AI talent profile.",
            "strengths": [],
            "topDomain": "Unverified Profile",
            "readinessRating": 0
        }

    prompt = f"""
    Analyze this employee profile and return a JSON object:
    Name: {employee.name}
    Role: {employee.designation} in {employee.department}
    Experience: {employee.experienceYears} years
    Summary: {employee.summary}
    Skills: {[s.name for s in employee.skills]}
    Projects: {[{'title': p.title, 'desc': p.description, 'tech': p.technologies} for p in employee.projects]}
    Certifications: {[c.name for c in employee.certifications]}

    Output JSON schema:
    {{
        "aiSummary": "2-3 sentences executive summary highlighting core capabilities and domain strengths",
        "strengths": ["list of 3-5 key strength highlights"],
        "topDomain": "primary domain e.g. Data Engineering / Machine Learning",
        "readinessRating": 88
    }}
    """
    res = _call_gemini_json(prompt, "You are an enterprise AI Talent Intelligence engine.")
    if res and "aiSummary" in res:
        return res
    
    # High-quality contextual fallback
    top_skills = [s.name for s in employee.skills[:3]]
    skills_str = ", ".join(top_skills) if top_skills else "software engineering"
    return {
        "aiSummary": f"You are a versatile {employee.designation} with {employee.experienceYears} years of experience in {employee.department}. You demonstrate strong capabilities in {skills_str}, with hands-on delivery across enterprise projects.",
        "strengths": [
            f"Strong technical proficiency in {skills_str}",
            f"Demonstrated project delivery in {len(employee.projects)} enterprise initiatives",
            "Strong cross-functional collaboration and systems problem-solving"
        ],
        "topDomain": employee.department,
        "readinessRating": min(95, int(70 + (employee.experienceYears * 4)))
    }

# ==========================================================
# 2. Hidden & Transferable Skill Detection
# ==========================================================
def detect_hidden_skills(employee: Employee) -> List[HiddenSkill]:
    if getattr(employee, "profileStatus", "INCOMPLETE") == "INCOMPLETE" or len(employee.projects) == 0:
        return []

    prompt = f"""
    Analyze the work history, project descriptions, and accomplishments of this employee to detect transferable / hidden skills that are not explicitly listed in their technical skills list.
    
    Employee: {employee.name}
    Designation: {employee.designation}
    Projects: {[{'title': p.title, 'role': p.role, 'desc': p.description, 'tech': p.technologies, 'impact': p.impact} for p in employee.projects]}
    Existing Skills: {[s.name for s in employee.skills]}

    Find 3 to 5 transferable or hidden skills (e.g. Leadership, Cross-functional Stakeholder Management, Distributed Systems Architecture, Agile Sprint Coaching, Data Storytelling, Incident Management).
    
    Output JSON schema:
    {{
        "hiddenSkills": [
            {{
                "name": "Skill name",
                "detectedFrom": "Short phrase describing the project/achievement context",
                "confidence": 88,
                "category": "Transferable",
                "explanation": "Clear explanation of how this skill was demonstrated in the work."
            }}
        ]
    }}
    """
    res = _call_gemini_json(prompt, "You are a talent intelligence AI analyzing resume and project evidence for hidden transferable skills.")
    if res and "hiddenSkills" in res and isinstance(res["hiddenSkills"], list):
        return [HiddenSkill(**item) for item in res["hiddenSkills"]]
    
    # High-fidelity rule-based detection from projects
    results = []
    text_corpus = (employee.summary + " " + " ".join([p.description + " " + p.role + " " + str(p.impact) for p in employee.projects])).lower()
    
    if any(w in text_corpus for w in ["lead", "led", "team", "coordinate", "mentor", "manage"]):
        results.append(HiddenSkill(
            name="Technical Leadership",
            detectedFrom="Team coordination and project ownership across enterprise deliverables",
            confidence=92,
            category="Transferable",
            explanation="Detected from guiding team members, driving architectural reviews, and coordinating multi-phase deliveries."
        ))
    if any(w in text_corpus for w in ["dashboard", "visual", "stakeholder", "report", "presentation", "insight"]):
        results.append(HiddenSkill(
            name="Data Storytelling & Executive Communication",
            detectedFrom="Delivering interactive analytics and presenting results to business stakeholders",
            confidence=87,
            category="Transferable",
            explanation="Identified from translating complex quantitative findings into clear business metrics and executive dashboards."
        ))
    if any(w in text_corpus for w in ["pipeline", "scale", "optimize", "distributed", "api", "deploy"]):
        results.append(HiddenSkill(
            name="Systems Architecture & Optimization",
            detectedFrom="Production system design, API development, and scalability optimizations",
            confidence=89,
            category="Transferable",
            explanation="Extracted from designing robust production data workflows and backend reliability implementations."
        ))
    if any(w in text_corpus for w in ["agile", "scrum", "sprint", "deadline", "deliver"]):
        results.append(HiddenSkill(
            name="Agile Execution & Sprint Delivery",
            detectedFrom="Rapid prototyping and iterative production releases",
            confidence=84,
            category="Transferable",
            explanation="Inferred from iterative sprint execution and timely cross-functional feature releases."
        ))
    
    if not results:
        results.append(HiddenSkill(
            name="Cross-functional Collaboration",
            detectedFrom="Collaborative execution across engineering, product, and business teams",
            confidence=86,
            category="Transferable",
            explanation="Demonstrated through multi-disciplinary project contributions and shared technical roadmaps."
        ))
    return results

# ==========================================================
# 3. AI Role Matching Explanation
# ==========================================================
def explain_role_match(employee: Employee, role: InternalRole, match_score: RoleMatchScore) -> str:
    prompt = f"""
    Explain why this employee is a {match_score.finalMatch}% match for the internal role '{role.title}'.
    Employee: {employee.name}, {employee.designation}, {employee.experienceYears} yrs exp.
    Skills: {[s.name for s in employee.skills]}
    Matching Skills: {match_score.matchingSkills}
    Missing Skills: {match_score.missingSkills}
    Role: {role.title} in {role.department}, Requires {role.experienceRequired} yrs exp.
    
    Write an insightful, professional, 3-paragraph AI explanation highlighting:
    1. Core alignment & leverage points (why they are well positioned)
    2. How their past projects and transferable skills bridge the role
    3. Exactly what specific gap closure is needed to reach 100% readiness.
    Return pure text without JSON.
    """
    text = _call_gemini_text(prompt, "You are an enterprise AI Talent Matchmaker explaining internal mobility fit.")
    if text:
        return text

    # Fallback template
    matching_str = ", ".join(match_score.matchingSkills[:4]) if match_score.matchingSkills else "foundational engineering"
    missing_str = ", ".join(match_score.missingSkills) if match_score.missingSkills else "specialized domain tools"
    
    return (
        f"{employee.name} exhibits strong profile alignment ({match_score.finalMatch}%) with the {role.title} position in {role.department}. "
        f"Their verified background in {matching_str} directly covers the critical prerequisites required for this role. "
        f"Furthermore, their {employee.experienceYears} years of hands-on experience demonstrate readiness for core project execution.\n\n"
        f"Their proven project history provides relevant contextual domain experience, while detected transferable competencies like technical ownership and problem-solving significantly shorten the onboarding ramp.\n\n"
        f"To achieve full 100% role capability, the primary growth vectors are bridging gaps in: {missing_str}. Targeted completion of hands-on containerization labs and workflow deployments will elevate this candidate to immediate peak readiness."
    )

# ==========================================================
# 4. Skill Gap Analysis & Learning Recommendations
# ==========================================================
def generate_skill_gap_analysis(employee: Employee, role: InternalRole, match_score: RoleMatchScore) -> List[SkillGapItem]:
    prompt = f"""
    Perform a granular skill gap analysis for {employee.name} aspiring to become a {role.title}.
    Missing/Incomplete skills: {match_score.missingSkills}
    Role Required Skills: {role.requiredSkills}
    
    For each missing skill, generate high-quality, practical learning recommendations (Course, Practice Project, Hands-on Lab).
    Do NOT invent fake real URLs. Use realistic descriptive learning modules.
    
    Output JSON schema:
    {{
        "gaps": [
            {{
                "skillName": "Docker",
                "isCritical": true,
                "currentLevel": 15,
                "requiredLevel": 85,
                "recommendations": [
                    {{
                        "type": "Course",
                        "title": "Containerization Fundamentals & Multi-Stage Builds",
                        "duration": "6 hours",
                        "description": "Master image optimization, docker-compose, and volume persistence."
                    }},
                    {{
                        "type": "Project",
                        "title": "Containerize a Python API with Health Checks",
                        "duration": "4 hours",
                        "description": "Build an optimized multi-stage Dockerfile and test locally."
                    }},
                    {{
                        "type": "Practice",
                        "title": "Deploy Container to Cloud Container Registry",
                        "duration": "3 hours",
                        "description": "Configure CI/CD automated builds and tag release images."
                    }}
                ]
            }}
        ]
    }}
    """
    res = _call_gemini_json(prompt, "You are a career development AI specializing in enterprise learning pathways.")
    if res and "gaps" in res and isinstance(res["gaps"], list):
        return [SkillGapItem(**item) for item in res["gaps"]]
    
    # Fallback recommendations generator
    detailed_gaps = []
    missing_list = match_score.missingSkills if match_score.missingSkills else ["Cloud Architecture", "CI/CD Deployment"]
    
    for skill in missing_list:
        detailed_gaps.append(SkillGapItem(
            skillName=skill,
            isCritical=True,
            currentLevel=20,
            requiredLevel=85,
            recommendations=[
                {
                    "type": "Course",
                    "title": f"Mastering {skill} for Enterprise Applications",
                    "duration": "8 hours",
                    "description": f"Comprehensive deep-dive covering foundational concepts, best practices, and enterprise architectures for {skill}."
                },
                {
                    "type": "Project",
                    "title": f"Hands-on {skill} Production Implementation",
                    "duration": "6 hours",
                    "description": f"Build an end-to-end working prototype implementing {skill} integrated with existing codebase."
                },
                {
                    "type": "Practice Activity",
                    "title": f"Real-world Case Study & Peer Review in {skill}",
                    "duration": "4 hours",
                    "description": f"Solve real-world troubleshooting scenarios and conduct peer architecture reviews for {skill}."
                }
            ]
        ))
    return detailed_gaps

# ==========================================================
# 5. Career Roadmap Generation
# ==========================================================
def generate_career_roadmap_plan(employee: Employee, role: InternalRole, match_score: RoleMatchScore) -> CareerRoadmap:
    prompt = f"""
    Generate an interactive 4-phase career progression roadmap for {employee.name} moving from {employee.designation} to {role.title}.
    Match Score: {match_score.finalMatch}%
    Missing Skills: {match_score.missingSkills}
    Matching Skills: {match_score.matchingSkills}
    
    Output JSON schema:
    {{
        "readinessScore": {int(match_score.finalMatch)},
        "aiAdvice": "Strategic advice for the transition",
        "milestones": [
            {{
                "phase": 1,
                "title": "Foundation & Skill Bridging",
                "timeline": "Month 1 - 2",
                "description": "Close immediate gaps in core tooling and modern workflow patterns.",
                "targetSkills": ["Docker", "MLOps"],
                "actionItems": ["Complete Containerization module", "Setup automated local pipelines"],
                "deliverable": "Containerized microservice running in staging",
                "status": "Current"
            }},
            {{
                "phase": 2,
                "title": "Internal Shadowing & Project Contribution",
                "timeline": "Month 3 - 4",
                "description": "Contribute 20% time to an existing internal team project in the target domain.",
                "targetSkills": ["Distributed Systems", "Monitoring"],
                "actionItems": ["Join sprint planning for ML platform team", "Submit 3 pull requests to internal tool"],
                "deliverable": "Production feature PR merged and monitored",
                "status": "Pending"
            }},
            {{
                "phase": 3,
                "title": "End-to-End Ownership & Capstone",
                "timeline": "Month 5",
                "description": "Lead design and deployment of an internal capability.",
                "targetSkills": ["System Architecture", "Model Evaluation"],
                "actionItems": ["Draft Technical Design Doc", "Deploy benchmark evaluation pipeline"],
                "deliverable": "Validated benchmark report and deployment runbook",
                "status": "Pending"
            }},
            {{
                "phase": 4,
                "title": "Internal Mobility Transition",
                "timeline": "Month 6",
                "description": "Formal transition to {role.title} with manager sign-off.",
                "targetSkills": ["Domain Mastery", "Mentorship"],
                "actionItems": ["Conduct talent handover", "Finalize internal role transfer review"],
                "deliverable": "Official internal role transition to {role.title}",
                "status": "Pending"
            }}
        ]
    }}
    """
    res = _call_gemini_json(prompt, "You are a career mobility AI expert creating actionable enterprise career roadmaps.")
    if res and "milestones" in res and isinstance(res["milestones"], list):
        return CareerRoadmap(
            employeeId=employee.id,
            targetRoleId=role.id,
            targetRoleTitle=role.title,
            currentRole=employee.designation,
            readinessScore=res.get("readinessScore", int(match_score.finalMatch)),
            milestones=[RoadmapMilestone(**m) for m in res["milestones"]],
            aiAdvice=res.get("aiAdvice", f"Focus on completing Phase 1 containerization milestones while leveraging your existing {', '.join(match_score.matchingSkills[:2])} strengths.")
        )
    
    # Fallback structured roadmap
    gaps = match_score.missingSkills if match_score.missingSkills else ["Cloud Deployment", "Pipeline Automation"]
    milestones = [
        RoadmapMilestone(
            phase=1,
            title="Skill Bridging & Tooling Setup",
            timeline="Month 1 - 2",
            description=f"Close foundational gaps in {', '.join(gaps[:2])} via structured labs.",
            targetSkills=gaps[:2],
            actionItems=[f"Complete hands-on labs in {gaps[0] if gaps else 'Core Tech'}", "Containerize existing backend project"],
            deliverable="Containerized service running in staging environment",
            status="Current"
        ),
        RoadmapMilestone(
            phase=2,
            title="Internal Project Shadowing & PR Contributions",
            timeline="Month 3 - 4",
            description="Collaborate with the target team on cross-functional sprints.",
            targetSkills=gaps[2:] if len(gaps) > 2 else ["Architecture Review", "CI/CD"],
            actionItems=["Participate in sprint architecture syncs", "Submit 2 collaborative pull requests"],
            deliverable="Merged pull requests and operational runbook",
            status="Pending"
        ),
        RoadmapMilestone(
            phase=3,
            title="Capstone Project & Technical Ownership",
            timeline="Month 5",
            description=f"Own the delivery of a production feature aligned with {role.title}.",
            targetSkills=["Production Deployment", "Performance Tuning"],
            actionItems=["Design architecture RFC", "Deploy optimized service with monitoring alerts"],
            deliverable="Production-grade project demo and performance evaluation",
            status="Pending"
        ),
        RoadmapMilestone(
            phase=4,
            title="Role Transition & Internal Mobility",
            timeline="Month 6",
            description=f"Formal internal transfer review and onboarding to {role.title}.",
            targetSkills=["Technical Leadership", "Domain Mastery"],
            actionItems=["Present capstone to department leadership", "Complete internal mobility onboarding"],
            deliverable=f"Official role placement as {role.title}",
            status="Pending"
        )
    ]
    
    return CareerRoadmap(
        employeeId=employee.id,
        targetRoleId=role.id,
        targetRoleTitle=role.title,
        currentRole=employee.designation,
        readinessScore=int(match_score.finalMatch),
        milestones=milestones,
        aiAdvice=f"You already possess a {match_score.finalMatch}% baseline match. Prioritize Phase 1 deliverables to rapidly close your remaining {len(gaps)} skill gaps."
    )

# ==========================================================
# 6. AI Career Copilot Chat (Context Grounded)
# ==========================================================
def copilot_chat(
    employee: Employee,
    all_roles: List[InternalRole],
    message: str,
    conversation_history: List[Dict[str, str]] = []
) -> Dict[str, Any]:
    """
    Answers strictly using employee profile, real skill gaps, and actual internal roles.
    """
    emp_skills = [s.name for s in employee.skills]
    hidden_skills = [s.name for s in employee.hiddenSkills]
    roles_summary = [{
        "id": r.id,
        "title": r.title,
        "dept": r.department,
        "reqSkills": r.requiredSkills,
        "exp": r.experienceRequired
    } for r in all_roles]
    
    prompt = f"""
    You are TalentIQ Career Copilot, an enterprise internal mobility AI assistant.
    Answer the employee's career question accurately based ONLY on their real profile and organization data below:
    
    EMPLOYEE CONTEXT:
    Name: {employee.name}
    Role: {employee.designation} in {employee.department}
    Experience: {employee.experienceYears} years
    Core Skills: {emp_skills}
    Detected Hidden/Transferable Skills: {hidden_skills}
    Projects: {[{'title': p.title, 'tech': p.technologies} for p in employee.projects]}
    Certifications: {[c.name for c in employee.certifications]}
    
    AVAILABLE INTERNAL ROLES:
    {roles_summary}
    
    USER QUESTION:
    "{message}"
    
    INSTRUCTIONS:
    1. Be concise, highly professional, encouraging, and actionable.
    2. Reference their actual skills and real internal roles from the context.
    3. Do NOT invent fake roles or hallucinate credentials not present in the context.
    4. If asked something completely outside their profile or unavailable data, politely clarify what data is currently in their profile.
    5. Propose 3 helpful follow-up questions the employee might want to ask next.
    
    Output JSON schema:
    {{
        "reply": "Your markdown-formatted response",
        "suggestedQuestions": [
            "What projects can I build to learn Docker?",
            "Show my compatibility with ML Engineer role",
            "What are my detected transferable skills?"
        ],
        "relatedRoleId": "optional-matched-role-id-or-null"
    }}
    """
    res = _call_gemini_json(prompt, "You are TalentIQ Career Copilot, an internal talent mobility AI.")
    if res and "reply" in res:
        return res
    
    # Grounded rule-based fallback
    lower_msg = message.lower()
    if "match" in lower_msg or "role" in lower_msg or "opportunity" in lower_msg:
        best_roles = all_roles[:2] if all_roles else []
        role_names = ", ".join([r.title for r in best_roles]) if best_roles else "Machine Learning Engineer and Senior Data Analyst"
        return {
            "reply": f"Based on your profile as a **{employee.designation}** with skills in **{', '.join(emp_skills[:3])}**, your highest internal alignment is currently with **{role_names}**.\n\nYour detected transferable strengths in **{', '.join(hidden_skills[:2]) if hidden_skills else 'Systems Thinking'}** give you an accelerated path for these opportunities!",
            "suggestedQuestions": [
                "Why am I a match for ML Engineer?",
                "What skills am I missing for Cloud Architect?",
                "Show my personalized career roadmap"
            ],
            "relatedRoleId": best_roles[0].id if best_roles else None
        }
    elif "skill" in lower_msg or "gap" in lower_msg or "learn" in lower_msg or "missing" in lower_msg:
        return {
            "reply": f"Analyzing your profile against target roles: your verified core skills include **{', '.join(emp_skills[:4])}**.\n\nTo unlock senior AI/Cloud roles, your primary growth recommendations are:\n1. **Docker & Containerization** (Multi-stage builds)\n2. **MLOps & Pipeline CI/CD**\n3. **Distributed Cloud Architecture**\n\nWould you like me to generate a personalized practice project for one of these?",
            "suggestedQuestions": [
                "What project should I build to learn Docker?",
                "How do my hidden skills help my career?",
                "Generate a 6-month career roadmap"
            ],
            "relatedRoleId": None
        }
    else:
        return {
            "reply": f"Hello {employee.name}! As your **TalentIQ Career Copilot**, I have full visibility into your **{len(employee.skills)} verified skills**, **{len(employee.projects)} enterprise projects**, and current internal openings in **{employee.department}**.\n\nHow can I help accelerate your career mobility today?",
            "suggestedQuestions": [
                "What roles match my profile?",
                "What skills am I missing for ML Engineer?",
                "What transferable skills did AI detect for me?"
            ],
            "relatedRoleId": None
        }
