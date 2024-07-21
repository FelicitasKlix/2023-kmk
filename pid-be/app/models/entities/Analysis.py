import time
from fastapi import UploadFile, HTTPException, status
from firebase_admin import storage, firestore

from app.models.entities.Patient import Patient
from app.models.entities.Laboratory import Laboratory

db = firestore.client()


class Analysis:
    analysis: list[UploadFile]
    uid: str
    patient_id: str

    def __init__(self, analysis: list[UploadFile], uid: str, patient_id: str = None):
        self.analysis = analysis
        self.uid = uid
        self.patient_id = patient_id if patient_id else uid
        print(patient_id)
        if not patient_id:
            if not Patient.is_patient(uid):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User must be a patient to upload analysis",
                )
            self.patient_id = uid
        else:
            if not Laboratory.is_laboratory(uid):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User must be a laboratory to upload analysis for a patient",
                )

    async def save(self):
        response_data = []
        bucket = storage.bucket()
        for analysis_to_upload in self.analysis:
            id = (
                db.collection("analysis")
                .document(self.uid)
                .collection("uploaded_analysis")
                .document()
                .id
            )
            blob = bucket.blob(
                f"analysis/{self.patient_id}/{id}.{analysis_to_upload.filename.split('.')[-1]}"
            )
            blob.upload_from_file(analysis_to_upload.file)
            blob.make_public()
            document_data_object = {
                "id": id,
                "file_name": analysis_to_upload.filename,
                "uploaded_at": round(time.time()),
                "url": blob.public_url,
            }
            db.collection("analysis").document(self.patient_id).collection(
                "uploaded_analysis"
            ).document(id).set(document_data_object)
            response_data.append(document_data_object)
        return response_data

    @staticmethod
    def get_all_for(uid):
        uploaded_analysis = (
            db.collection("analysis")
            .document(uid)
            .collection("uploaded_analysis")
            .get()
        )
        return list(map(lambda analysis: analysis.to_dict(), uploaded_analysis))
    
    @staticmethod
    def get_specific_files(file_ids, patient_id):
            uploaded_analysis = (
                db.collection("analysis")
                .document(patient_id)
                .collection("uploaded_analysis")
                .get()
            )
            analysis_list = list(map(lambda analysis: analysis.to_dict(), uploaded_analysis))

            filtered_analysis_list = list(filter(lambda analysis: analysis['id'] in file_ids, analysis_list))
            
            print(filtered_analysis_list)
            return filtered_analysis_list

    @staticmethod
    def get_laboratory_analyses(patient_id: str, analysis_ids: list[str]):
        try:
            db = firestore.client()
            analyses_ref = (
                db.collection("analysis")
                .document(patient_id)
                .collection("uploaded_analysis")
            )
            
            # Obtener todos los documentos
            all_analyses = analyses_ref.get()
            print("IDS de los analisis del lab actual: ",analysis_ids)
            # Filtrar manualmente por los IDs deseados
            filtered_analyses = [
                analysis.to_dict() 
                for analysis in all_analyses 
                if analysis.id in analysis_ids
            ]
            
            return filtered_analyses
        except Exception as e:
            # Log the error for debugging
            print(f"Error in get_laboratory_analyses: {str(e)}")
            raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Internal server error",
                )


    @staticmethod
    def delete(uid, id):
        analysis_doc = (
            db.collection("analysis")
            .document(uid)
            .collection("uploaded_analysis")
            .document(id)
            .get()
        )
        if not analysis_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="The file doesnt exists"
            )
        bucket = storage.bucket()
        blobs = list(bucket.list_blobs(prefix=f"analysis/{uid}/{id}"))
        blobs[0].delete()
        db.collection("analysis").document(uid).collection(
            "uploaded_analysis"
        ).document(id).delete()
