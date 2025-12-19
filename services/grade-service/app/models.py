from pydantic import BaseModel

class Grade(BaseModel):
    etudiant_id: str
    cours_id: str
    note: float
    coefficient: int = 1