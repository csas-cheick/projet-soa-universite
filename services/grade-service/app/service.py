from .database import Database

class GradeService:
    def __init__(self):
        self.collection = Database.get_collection()

    def _fix_id(self, doc):
        """Méthode privée pour nettoyer l'ID"""
        doc["id"] = str(doc.pop("_id"))
        return doc

    def add_grade(self, grade_data: dict):
        result = self.collection.insert_one(grade_data)
        return str(result.inserted_id)

    def get_by_student(self, student_id: str):
        grades = list(self.collection.find({"etudiant_id": student_id}))
        return [self._fix_id(g) for g in grades]

    def calculate_average(self, student_id: str):
        grades = list(self.collection.find({"etudiant_id": student_id}))
        
        if not grades:
            return {"etudiant_id": student_id, "moyenne": 0.0, "mention": "N/A"}

        total_points = sum(g["note"] * g["coefficient"] for g in grades)
        total_coeffs = sum(g["coefficient"] for g in grades)

        if total_coeffs == 0:
            return {"moyenne": 0}

        moyenne = round(total_points / total_coeffs, 2)
        mention = self._get_mention(moyenne)

        return {
            "etudiant_id": student_id,
            "nombre_notes": len(grades),
            "moyenne": moyenne,
            "mention": mention
        }

    def _get_mention(self, moyenne):
        if moyenne < 10: return "Ajourné"
        if moyenne >= 16: return "Très Bien"
        if moyenne >= 14: return "Bien"
        if moyenne >= 12: return "Assez Bien"
        return "Passable"