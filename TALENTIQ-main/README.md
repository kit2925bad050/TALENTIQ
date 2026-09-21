# TALENTIQ AI 🚀
### AI-Powered Talent Discovery, AI Skill Mentor & Career Mobility
**KIT BUILDATHON 2026 Production-Style Hackathon Platform**

> *"Discover Talent. Develop Skills. Unlock Careers."*

---

## 🌟 1. Product Vision & Loop

**TALENTIQ AI** is a complete end-to-end **AI-Powered Talent Development Platform**. It moves beyond passive role matching by actively closing skill gaps through **AI Skill Mentor**—a personal technical teacher that assesses, teaches, evaluates, re-teaches weak concepts, tracks skill mastery, and updates career readiness in real time.

```
DISCOVER  ──►  ASSESS  ──►  TEACH  ──►  PRACTICE  ──►  EVALUATE  ──►  ADAPT / RE-TEACH  ──►  MASTER  ──►  MATCH  ──►  ADVANCE
```

---

## 💎 2. Core Capabilities & Architecture

### 🎓 1. AI Skill Mentor (Personal AI Teacher)
- **7-Step Pedagogical Engine**:
  1. **Explain**: Crystal-clear conceptual breakdown tailored to the employee's background.
  2. **Example**: Real-world enterprise context and practical code snippets.
  3. **Demonstrate**: Step-by-step numbered execution traces.
  4. **Practice**: Hands-on challenges in a built-in terminal sandbox.
  5. **Evaluate**: Instant multi-factor scoring (*Technical Understanding*, *Implementation Quality*, *Best Practices*).
  6. **Feedback**: Granular strengths and weakness analysis.
  7. **Adapt / Re-teach**: Automatically diagnoses conceptual mistakes (e.g. port mapping inversion) and delivers an interactive re-teaching module with simplified analogies and fresh exercises.
- **AI Skill Mastery Progression**:
  `NOT_STARTED` $\rightarrow$ `LEARNING` $\rightarrow$ `PRACTICING` $\rightarrow$ `ASSESSED` $\rightarrow$ `MASTERED`
- **Dynamic Role Readiness Sync**: Mastering a skill immediately elevates verified employee capability and updates target role alignment %.
- **1-on-1 AI Tutor Chat**: Conversational guidance and on-demand Socratic explanations.

### 🔍 2. AI-Powered Talent Discovery & Employee Profiling
- **Semantic Skill Matrix**: Categorizes verified competencies into *Core*, *Advanced*, and *Emerging* skills.
- **Hidden & Transferable Skill Detection Engine**: Evaluates project milestones and work history to uncover unlisted leadership, data storytelling, and systems capabilities.

### 🎯 3. Explainable Hybrid Role Matching
- **Deterministic Multi-Factor Scoring**:
  $$\text{FinalMatch} = 0.55 \times \text{SkillMatch} + 0.20 \times \text{ExperienceMatch} + 0.15 \times \text{ProjectMatch} + 0.10 \times \text{CertificationMatch}$$
- **"Why Am I a Match?"** AI explanation panel breaking down strengths and specific gap closure vectors.

### 📈 4. Skill Gap Analysis & Career Roadmap
- Side-by-side competency comparisons and curated learning pathways.
- Interactive 4-phase career progression tree (*Current Role* $\rightarrow$ *Skill Bridging* $\rightarrow$ *Team Shadowing* $\rightarrow$ *Capstone Ownership* $\rightarrow$ *Role Placement*).

### 📊 5. HR Talent Intelligence & Workforce Command Center
- Macro KPIs, Recharts workforce distributions, emerging skill shortage forecasts, and multi-skill talent search.

---

## 🎬 3. Complete 18-Step Hackathon Walkthrough Sequence

| Step | Action | Platform Behavior |
| :--- | :--- | :--- |
| **1** | Open `http://localhost:5173` | Dark futuristic landing page showing the unified Talent Development loop. Click **"Explore My Talent Profile"**. |
| **2** | Employee Dashboard | Greeted as **Alex Chen (Senior Data Analyst)**. View AI capability synthesis and animated KPI counters. |
| **3** | My AI Profile | Inspect verified skills. Click **"Run AI Skill Discovery"** to uncover **4 transferable traits**. |
| **4** | Internal Roles | View recommended roles (*Machine Learning Engineer - 87%*). Click **"Why am I a match?"** for AI explanation. |
| **5** | Skill Gap Page | Select *Machine Learning Engineer*. View side-by-side gap comparison identifying *Docker* and *MLOps*. |
| **6** | Launch AI Mentor | Click **"Start AI Mentor"** next to **Docker** to enter the **AI Mentor Learning Room**. |
| **7** | Step 1: AI Lesson | Inspect the 7-step pedagogical curriculum: explanation, analogy, and step-by-step code demonstration. |
| **8** | Step 2: Practice | Switch to **"2. Hands-on Practice"**. View the containerization challenge. |
| **9** | Step 3: Test Mistake | Click *"Simulate Mistake"* (`-p 8000:5000`) and click **"Submit for AI Evaluation"**. |
| **10** | AI Diagnosis | AI evaluates submission: detects **Port Mapping Order Inversion (45% Score)** and recommends `reteach`. |
| **11** | AI Re-teaching | The **AI Re-teaching Panel** appears with a simplified *"Outside:Inside"* analogy and corrected example. |
| **12** | Correct Practice | Click *"Apply Corrected Rule"* and re-submit: score jumps to **92% (Proficient)**. |
| **13** | Knowledge Quiz | Click **"Take Knowledge Quiz"**. AI generates 3 contextual multiple-choice questions. |
| **14** | Submit Quiz | Select correct answers and submit: score achieves **100% (Passed)**. |
| **15** | Skill Mastery | State transitions to **`MASTERED` (88% Verified Proficiency)**. |
| **16** | Role Readiness | Right-hand HUD instantly updates: **Target Role Readiness jumps to 77.8% (5/6 skills mastered)**. |
| **17** | AI Tutor Chat | Open **"1-on-1 AI Tutor Chat"** to ask Socratic questions about *MLOps* and next steps. |
| **18** | HR Command Center | Switch to **HR View** to inspect organizational skill density and emerging shortages. |

---

## 💻 4. Running the Application

```powershell
# Option 1: One-click launcher
.\start_app.bat

# Option 2: Individual terminals
# Backend:
cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Frontend:
cd frontend && npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API & Swagger Docs**: `http://127.0.0.1:8000/docs`
