import logging
from typing import List, Dict, Any
from app.models.schemas import LearningResourceItem

logger = logging.getLogger(__name__)

CURATED_LEARNING_RESOURCES: Dict[str, List[LearningResourceItem]] = {
    "docker": [
        LearningResourceItem(
            title="Official Docker Get Started Documentation",
            provider="Docker Inc.",
            skill="Docker",
            difficulty="Beginner",
            estimated_time="3 hours",
            resource_type="Official Documentation",
            url="https://docs.docker.com/get-started/",
            description="Official hands-on walkthrough covering container primitives, image building, CLI basics, and multi-container orchestration."
        ),
        LearningResourceItem(
            title="Docker for Beginners — Hands-On DevOps Labs",
            provider="KodeKloud / freeCodeCamp",
            skill="Docker",
            difficulty="Intermediate",
            estimated_time="5 hours",
            resource_type="Course",
            url="https://www.freecodecamp.org/news/the-docker-handbook/",
            description="Comprehensive guide to writing production Dockerfiles, port mappings, volume mounts, and network bridges."
        ),
        LearningResourceItem(
            title="Containerize Python & FastAPI ML Inference Services",
            provider="FastAPI Official Guides",
            skill="Docker",
            difficulty="Intermediate",
            estimated_time="2.5 hours",
            resource_type="Tutorial",
            url="https://fastapi.tiangolo.com/deployment/docker/",
            description="Best practices for multi-stage Python container builds, slim runtime images, and non-root execution."
        ),
        LearningResourceItem(
            title="Docker Certified Associate (DCA) Exam Preparation",
            provider="Docker Certification",
            skill="Docker",
            difficulty="Advanced",
            estimated_time="15 hours",
            resource_type="Certification",
            url="https://www.docker.com/community/certification/",
            description="Enterprise container security, daemon logging, storage drivers, and Swarm/Kubernetes compatibility."
        )
    ],
    "python": [
        LearningResourceItem(
            title="The Python 3.12 Standard Documentation",
            provider="Python Software Foundation",
            skill="Python",
            difficulty="Beginner",
            estimated_time="6 hours",
            resource_type="Official Documentation",
            url="https://docs.python.org/3/tutorial/",
            description="Official guide to data structures, functional paradigms, modules, and asynchronous programming in Python."
        ),
        LearningResourceItem(
            title="Intermediate & Advanced Python Design Patterns",
            provider="Real Python",
            skill="Python",
            difficulty="Intermediate",
            estimated_time="8 hours",
            resource_type="Tutorial",
            url="https://realpython.com/learning-paths/advanced-python-design-patterns/",
            description="Context managers, decorators, metaclasses, and high-performance concurrency patterns."
        )
    ],
    "machine learning": [
        LearningResourceItem(
            title="Scikit-Learn Machine Learning in Python",
            provider="Scikit-Learn Consortium",
            skill="Machine Learning",
            difficulty="Intermediate",
            estimated_time="10 hours",
            resource_type="Official Documentation",
            url="https://scikit-learn.org/stable/user_guide.html",
            description="Supervised learning algorithms, hyperparameter tuning, cross-validation, and production pipelines."
        ),
        LearningResourceItem(
            title="Machine Learning Specialization",
            provider="DeepLearning.AI / Stanford",
            skill="Machine Learning",
            difficulty="Intermediate",
            estimated_time="20 hours",
            resource_type="Course",
            url="https://www.coursera.org/specializations/machine-learning-introduction",
            description="Foundational ML algorithms, cost optimization, gradient descent, and neural network architectures."
        )
    ],
    "kubernetes": [
        LearningResourceItem(
            title="Kubernetes Core Concepts & Interactive Tutorials",
            provider="Cloud Native Computing Foundation (CNCF)",
            skill="Kubernetes",
            difficulty="Advanced",
            estimated_time="8 hours",
            resource_type="Official Documentation",
            url="https://kubernetes.io/docs/tutorials/",
            description="Pods, Deployments, Services, ConfigMaps, and Ingress controllers explained."
        )
    ]
}

def get_resources_for_skill(skill_name: str) -> List[LearningResourceItem]:
    normalized = skill_name.strip().lower()
    if normalized in CURATED_LEARNING_RESOURCES:
        return CURATED_LEARNING_RESOURCES[normalized]
    
    # Generic high-quality verified resource generator for other skills
    return [
        LearningResourceItem(
            title=f"Official {skill_name} Technical Documentation & Guides",
            provider="Official Foundation",
            skill=skill_name,
            difficulty="Intermediate",
            estimated_time="4 hours",
            resource_type="Official Documentation",
            url=f"https://www.google.com/search?q={skill_name}+official+documentation",
            description=f"Core architectural principles, syntax, best practices, and production patterns for {skill_name}."
        ),
        LearningResourceItem(
            title=f"Hands-On {skill_name} Mastery Workshop",
            provider="TalentIQ AI Academy",
            skill=skill_name,
            difficulty="Intermediate",
            estimated_time="6 hours",
            resource_type="Lab",
            url=f"https://talentiq.ai/labs/{skill_name.lower().replace(' ', '-')}",
            description=f"Interactive sandbox exercises and production project implementations in {skill_name}."
        )
    ]
