from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.models.schemas import (
    Employee, InternalRole, RoleMatchScore, SkillGapAnalysis,
    CareerRoadmap, AIChatRequest, AIChatResponse, HiddenSkill
)
from app.services.db_service import db
from app.services.matcher_service import calculate_role_match
from app.services import gemini_service

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])

import logging

logger = logging.getLogger(__name__)

class ProfileAnalysisRequest(BaseModel):
    employeeId: str

class MatchRoleRequest(BaseModel):
    employeeId: str
    roleId: Optional[str] = "role-ml-engineer"

class SkillGapRequest(BaseModel):
    employeeId: str
    targetRoleId: Optional[str] = "role-ml-engineer"

class RoadmapRequest(BaseModel):
    employeeId: str
    targetRoleId: Optional[str] = "role-ml-engineer"

@router.post("/analyze-profile")
def analyze_profile(payload: ProfileAnalysisRequest):
    logger.info(f"[AI] /analyze-profile for employeeId='{payload.employeeId}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    analysis = gemini_service.analyze_employee_profile(emp)
    return analysis

@router.post("/detect-hidden-skills", response_model=List[HiddenSkill])
def detect_hidden_skills(payload: ProfileAnalysisRequest):
    logger.info(f"[AI] /detect-hidden-skills for employeeId='{payload.employeeId}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    hidden_skills = gemini_service.detect_hidden_skills(emp)
    # Save back to employee document
    db.update_employee(emp.id, {"hiddenSkills": [h.model_dump() for h in hidden_skills]})
    return hidden_skills

@router.post("/match-role", response_model=RoleMatchScore)
def match_role_with_explanation(payload: MatchRoleRequest):
    logger.info(f"[AI] /match-role for employeeId='{payload.employeeId}', roleId='{payload.roleId}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    role = db.get_role(payload.roleId)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    score = calculate_role_match(emp, role)
    explanation = gemini_service.explain_role_match(emp, role, score)
    score.aiExplanation = explanation
    return score

@router.post("/analyze-skill-gap", response_model=SkillGapAnalysis)
def analyze_skill_gap(payload: SkillGapRequest):
    logger.info(f"[AI] /analyze-skill-gap for employeeId='{payload.employeeId}', roleId='{payload.targetRoleId}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    role = db.get_role(payload.targetRoleId)
    if not role:
        raise HTTPException(status_code=404, detail="Target role not found")
        
    score = calculate_role_match(emp, role)
    detailed_gaps = gemini_service.generate_skill_gap_analysis(emp, role, score)
    
    summary = f"{emp.name} matches {score.finalMatch}% of requirements for {role.title}. Identified {len(score.missingSkills)} critical skill bridging areas."
    
    return SkillGapAnalysis(
        employeeId=emp.id,
        targetRoleId=role.id,
        targetRoleTitle=role.title,
        matchScore=score.finalMatch,
        matchingSkills=score.matchingSkills,
        missingSkills=score.missingSkills,
        detailedGaps=detailed_gaps,
        summary=summary
    )

@router.post("/generate-roadmap", response_model=CareerRoadmap)
def generate_roadmap(payload: RoadmapRequest):
    logger.info(f"[AI] /generate-roadmap for employeeId='{payload.employeeId}', roleId='{payload.targetRoleId}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    role = db.get_role(payload.targetRoleId)
    if not role:
        raise HTTPException(status_code=404, detail="Target role not found")
        
    score = calculate_role_match(emp, role)
    roadmap = gemini_service.generate_career_roadmap_plan(emp, role, score)
    return roadmap

@router.post("/chat", response_model=AIChatResponse)
def chat_copilot(payload: AIChatRequest):
    logger.info(f"[AI] /chat for employeeId='{payload.employeeId}', msg='{payload.message[:30]}...'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    all_roles = db.get_roles()
    response = gemini_service.copilot_chat(
        employee=emp,
        all_roles=all_roles,
        message=payload.message,
        conversation_history=payload.conversationHistory or []
    )
    return AIChatResponse(**response)
