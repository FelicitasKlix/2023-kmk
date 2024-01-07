from fastapi import HTTPException, status
from firebase_admin import firestore

db = firestore.client()


class Study:
    @staticmethod
    def get_all():
        studies = db.collection("lab_studies").get()
        return [study.to_dict()["name"] for study in studies]
    
    @staticmethod
    def exists_with_name(name):
        return (
            len(db.collection("lab_studies").where("name", "==", name.lower()).get())
            > 0
        )

    @staticmethod
    def add_study(name):
        if Study.exists_with_name(name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Study already exists",
            )
        db.collection("lab_studies").document().set({"name": name.lower()})

    @staticmethod
    def delete_study(name):
        query = db.collection("lab_studies").where("name", "==", name.lower())

        docs = query.stream()

        for doc in docs:
            doc.reference.delete()