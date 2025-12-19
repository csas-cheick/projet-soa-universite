from fastapi import APIRouter, Depends
from .models import Grade
from .auth import verify_token
from .service import GradeService

router = APIRouter()
service = GradeService()

@router.get("/")
def home():
    return {"message": "Service Notes (FastAPI POO) est en ligne 🚀"}

@router.post("/api/notes", dependencies=[Depends(verify_token)])
def add_grade(grade: Grade):
    grade_id = service.add_grade(grade.dict())
    return {"message": "Note ajoutée", "id": grade_id}

@router.get("/api/notes/etudiant/{etudiant_id}", dependencies=[Depends(verify_token)])
def get_student_grades(etudiant_id: str):
    return service.get_by_student(etudiant_id)

@router.get("/api/notes/moyenne/{etudiant_id}", dependencies=[Depends(verify_token)])
def get_average(etudiant_id: str):
    return service.calculate_average(etudiant_id)