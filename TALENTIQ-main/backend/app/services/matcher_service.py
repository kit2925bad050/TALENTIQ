import math
from typing import List, Dict, Tuple
from app.models.schemas import Employee, InternalRole, RoleMatchScore

def calculate_role_match(employee: Employee, role: InternalRole) -> RoleMatchScore:
    """
    Deterministic Hybrid Match Algorithm:
    finalMatch = 0.55 * skillMatch + 0.20 * experienceMatch + 0.15 * projectMatch + 0.10 * certificationMatch
    """
    # Check for incomplete or empty profile
    if getattr(employee, "profileStatus", "INCOMPLETE") == "INCOMPLETE" or (len(employee.skills) == 0 and len(employee.projects) == 0 and len(employee.certifications) == 0):
        return RoleMatchScore(
            roleId=role.id,
            roleTitle=role.title,
            department=role.department,
            experienceRequired=role.experienceRequired,
            finalMatch=0.0,
            skillMatch=0.0,
            experienceMatch=0.0,
            projectMatch=0.0,
            certificationMatch=0.0,
            matchingSkills=[],
            missingSkills=role.requiredSkills,
            label="Insufficient verified profile data to calculate role match",
            aiExplanation="No verified skills or credentials found in profile. Please upload and verify your certificate or resume to calculate role alignment."
        )

    # 1. Extract all employee skill names in lowercase
    emp_skill_names = set(s.name.lower().strip() for s in employee.skills)
    # Include hidden skills in the discovery pool
    for hs in employee.hiddenSkills:
        emp_skill_names.add(hs.name.lower().strip())
        
    req_skills = [s.strip() for s in role.requiredSkills if s.strip()]
    pref_skills = [s.strip() for s in role.preferredSkills if s.strip()]
    
    # 2. Skill Match
    matching_req = []
    missing_req = []
    for s in req_skills:
        if s.lower() in emp_skill_names:
            matching_req.append(s)
        else:
            missing_req.append(s)
            
    matching_pref = [s for s in pref_skills if s.lower() in emp_skill_names]
    
    total_req_count = len(req_skills) if len(req_skills) > 0 else 1
    req_ratio = len(matching_req) / total_req_count
    
    # Extra credit from preferred skills (up to +0.15 bonus capped at 1.0)
    pref_bonus = (len(matching_pref) / len(pref_skills) * 0.15) if pref_skills else 0.0
    skill_match = min(1.0, req_ratio + pref_bonus)
    
    # 3. Experience Match
    req_exp = role.experienceRequired if role.experienceRequired > 0 else 1.0
    emp_exp = employee.experienceYears
    if emp_exp >= req_exp:
        exp_match = 1.0
    else:
        exp_match = max(0.2, emp_exp / req_exp)
        
    # 4. Project Match
    project_skills = set()
    for proj in employee.projects:
        for tech in proj.technologies:
            project_skills.add(tech.lower().strip())
            
    all_role_skills_lower = set(s.lower() for s in req_skills + pref_skills)
    if all_role_skills_lower:
        matched_proj_skills = project_skills.intersection(all_role_skills_lower)
        project_match = min(1.0, len(matched_proj_skills) / max(1, len(all_role_skills_lower) * 0.5))
    else:
        project_match = 0.8
        
    # 5. Certification Match
    cert_names = " ".join([c.name.lower() for c in employee.certifications])
    matched_certs = 0
    for s in req_skills + pref_skills:
        if s.lower() in cert_names:
            matched_certs += 1
    cert_match = min(1.0, 0.4 + (matched_certs * 0.3)) if employee.certifications else 0.3
    
    # Final weighted score
    final_score_raw = (
        0.55 * skill_match +
        0.20 * exp_match +
        0.15 * project_match +
        0.10 * cert_match
    )
    
    final_percentage = round(final_score_raw * 100, 1)
    
    return RoleMatchScore(
        roleId=role.id,
        roleTitle=role.title,
        department=role.department,
        experienceRequired=role.experienceRequired,
        finalMatch=final_percentage,
        skillMatch=round(skill_match * 100, 1),
        experienceMatch=round(exp_match * 100, 1),
        projectMatch=round(project_match * 100, 1),
        certificationMatch=round(cert_match * 100, 1),
        matchingSkills=matching_req + matching_pref,
        missingSkills=missing_req,
        label="AI-assisted profile alignment"
    )

def match_employee_with_roles(employee: Employee, roles: List[InternalRole]) -> List[RoleMatchScore]:
    matches = [calculate_role_match(employee, role) for role in roles]
    # Sort descending by match score
    matches.sort(key=lambda x: x.finalMatch, reverse=True)
    return matches
