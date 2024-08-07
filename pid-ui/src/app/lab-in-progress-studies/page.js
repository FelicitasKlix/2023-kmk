"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../styles/styles.module.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import Modal from "react-modal";
import axios from "axios";
import https from "https";
import { Footer, Header, LaboratoryTabBar, TabBar } from "../components/header";
import ConfirmationModal from "../components/ConfirmationModal";
import { redirect } from "../components/userCheck";
import { toast } from "react-toastify";
import {ToastContainer} from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
import InfoIcon from "@mui/icons-material/Info";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { Today } from "@mui/icons-material";
import { set } from "date-fns";

registerLocale("es", es);

const DashboardLaboratory = () => {
    const [isLoading, setIsLoading] = useState(true);
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const [studies, setStudies] = useState([]);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [details, setDetails] = useState("");
    const inputRef = useRef(null);
    const [file, setFile] = useState([]); // File to be uploaded
    const [currentStudyId, setCurrentStudyId] = useState(null);
    const[currentPatientId, setCurrentPatientId] = useState(null);
    const [analysis, setAnalysis] = useState([]);
    const [currentAnalysis, setCurrentAnalysis] = useState([]);
    const [labAnalysis, setLabAnalysis] = useState([]);
    const [uploadedFileIds, setUploadedFileIds] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });


    const customStyles = {
        content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
        },
    };

    const ratingModalStyles = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000 // Un valor mayor que el z-index del header
        },
    };

    const fetchInProgressStudies = async () => {
        try {
            const response = await axios.get(
                `${apiURL}labs/in-progress-studies`
            );
            console.log(response.data.studies);
            response.data.studies == undefined
                ? setStudies([])
                : setStudies(response.data.studies);
        } catch (error) {
            toast.error("Error al obtener los estudios en proceso");
            console.log(error);
        }
    };

    const handleFinishStudy = async (studyId) => {
        toast.info("Finalizando estudio...");
        console.log(studyId);
        try {
            await axios.post(
                `${apiURL}studies/finish/${studyId}`
            );
            toast.success("Estudio finalizado exitosamente");
            fetchInProgressStudies();
        } catch (error) {
            console.log(error);
            switch(error.response.data.detail){
                case "No details provided":
                    toast.error("Debe completar los detalles del estudio");
                    break;
            }
        }
    };

    const getLaboratoryAnalyses = async (patientId, analysisIds) => {
        try {
          const response = await axios.post(`${apiURL}analysis/laboratory/${patientId}`, analysisIds);
          console.log(response);
          console.log(response.data);
          setLabAnalysis(response.data);
          
        } catch (error) {
          console.error('Error fetching laboratory analyses:', error);
          throw error;
        }
      };
      const fetchLabAnalysis = async (currentPatientId, labAnalysis) => {
        try {
          const response = await axios.post(`${apiURL}analysis/laboratory/${currentPatientId}`, labAnalysis);
          console.log(response);
          console.log(response.data);
          
          return response.data;
        } catch (error) {
          console.error('Error fetching laboratory analyses:', error);
          throw error;
        }
      };

    const onSubmit = async (e) => {
        toast.info("Subiendo análisis");
        console.log("---->"+currentPatientId);
        console.log(e);
        const formData = new FormData();
        Array.from(e).forEach((file_to_upload) =>
            formData.append("analysis", file_to_upload)
        );
        
        formData.append("patient_id", currentPatientId); // Asegúrate de obtener el patient_id del formulario
        console.log(formData);
        try {
            
            const response = await axios.post(`${apiURL}analysis/lab-upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            toast.success("Análisis subido con éxito");
            const newAnalysisIds = response.data.map((analysis) => analysis.id);
            
            setCurrentAnalysis((prevAnalysis) => {
                const updatedAnalysis = [...prevAnalysis, ...newAnalysisIds];
                //console.log("LISTA DE FILES: ", updatedAnalysis);
                getLaboratoryAnalyses(currentPatientId, updatedAnalysis);
                const ids = updatedAnalysis.map(file => file.id);
                fetchCurrentAnalysis(updatedAnalysis);
                return updatedAnalysis;
            });
            resetFileInput();
        } catch (error) {
            console.error(error);
            toast.error("Error al subir análisis");
        }
    };

    const handleDeleteClick = (file) => {
        console.log("FILE: ",file);
        setSelectedFile(file);
        console.log("ARCHIVO SELECCIONADO: ",selectedFile);
        setShowConfirmationModal(true);
    };
    
    const handleDeleteFile = async () => {
        setShowConfirmationModal(false);
        console.log("SELECTED FILE: ", selectedFile);
        try {
            
            const response = await axios.delete(`${apiURL}analysis/${selectedFile}`, {
                params: { patient_id: currentPatientId }
            });
            console.log(response);
            setCurrentAnalysis((prevAnalysis) => {
                const updatedAnalysis = prevAnalysis.filter(analysis => analysis.id !== selectedFile);
                console.log("Updated analysis list:", updatedAnalysis);
                
                fetchCurrentAnalysis(updatedAnalysis);
                
                getLaboratoryAnalyses(currentPatientId, updatedAnalysis);
                
                return updatedAnalysis;
            });

            toast.success("Análisis eliminado con éxito");
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar análisis");
        }
    };

    const fetchCurrentAnalysis = async (fileIds) => {
        try {
          const response = await axios.post(`${apiURL}analysis/get`, { patient_id: currentPatientId,file_ids: fileIds });
          setAnalysis(response.data);
          console.log(response);
        } catch (error) {
          console.error(error);
        }
      };


    const resetFileInput = () => {
        inputRef.current.value = null;
        setFile([]);
    };

    const openModal = (study) => {
        setCurrentStudyId(study.id);
        setCurrentPatientId(study.patient_id);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
    };
    
    const handleConfirm = async (details, studyId) => {
        console.log("Archivos: ",labAnalysis);
        let userData = {
            files: labAnalysis.map(file => ({ id: file.id, url: file.url })),
            lab_details: details,
        };

        try{
            const response = await axios.post(
                `${apiURL}studies/update/${studyId}`,
                userData,
                { httpsAgent: agent }
            );
            console.log(response.data);
            if (response.data.message === "Successfull request"){
                toast.success("Estudio cargado exitosamente");
            }
        }catch(error){
            toast.error("Ha ocurrido un error");
        }
        
        closeModal();
    };
    

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        fetchInProgressStudies()
            .then(() => setIsLoading(false)) // Marcar como cargado cuando la respuesta llega
            .catch(() => {
                setIsLoading(false);
                toast.error("Error al obtener los datos del usuario");
            });
    }, []);

    return (
        <div className={styles.dashboard}>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                style={ratingModalStyles}
                ariaHideApp={false}
            >
                <div className={styles["title"]}>Gestion del Estudio</div>
                <div className={styles["appointment"]}>
                <div className={styles["my-estudios-section"]}>
                <div className={styles["subtitle"]}>Cargar estudios</div>
                <div className={styles['horizontal-scroll']}>
                    {analysis.length > 0 ? (
                        analysis.map((uploaded_analysis) => (
                            <a className={styles['estudio-card']} key={uploaded_analysis.id}>
                                <div onClick={() => handleDownload(uploaded_analysis.url)}>
                                    <div className={styles['estudio-name']}>
                                        {uploaded_analysis.file_name.substring(0, 12) + '...'}
                                    </div>
                                    <img
                                        src='/document.png'
                                        alt=''
                                        className={styles['document-icon']}
                                        style={{ alignSelf: 'center', margin: 'auto' }}
                                        width={100}
                                        height={100}
                                    />
                                    <div
                                        className={styles['estudio-date']}
                                        style={{ alignSelf: 'center', margin: 'auto', display: 'table', padding: '5px 0' }}
                                    >
                                        {new Date(uploaded_analysis.uploaded_at * 1000).toLocaleDateString('es-AR')}
                                    </div>
                                </div>
                                <img
                                    src='/trash_icon.png'
                                    alt=''
                                    className={styles['document-icon']}
                                    style={{ alignSelf: 'center' }}
                                    width={25}
                                    height={25}
                                    onClick={() => handleDeleteClick(uploaded_analysis.id)}
                                />
                            </a>
                        ))
                    ) : (
                        <div
                            style={{
                                alignSelf: 'center',
                                margin: 'auto',
                                padding: '5px 0',
                            }}
                        >
                            No hay análisis cargados
                        </div>
                    )}
                </div>
                    <form className={styles["file-upload-form"]}>
                        <label
                            htmlFor="files"
                            className={styles["upload-button"]}
                            style={{ color: "#fff" }}
                        >
                            Cargar archivos
                        </label>
                        <input
                            id="files"
                            type="file"
                            name="file"
                            accept=".pdf"
                            multiple={true}
                            onChange={(e) => {
                                onSubmit(e.target.files);
                                setFile(e.target.files);
                            }}
                            onClick={(event) => {
                                event.target.value = null;
                            }}
                            ref={inputRef}
                            style={{ display: "none" }}
                        />
                    </form>
                </div>

                

                <div className={styles["subtitle"]}>
                                Detalles
                            </div>
                            <textarea
                                id='details'
                                value={details}
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setDetails(e.target.value);
                                }}
                                placeholder='Escriba aqui...'
                                required
                                className={styles["observation-input"]}
                                wrap='soft'
                            />
                </div>
                <button onClick={closeModal} className={styles["delete-button"]}>Cerrar</button>
                <button onClick={() => handleConfirm(details, currentStudyId, file)} className={styles["edit-button"]}>Confirmar</button>
                
            </Modal>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                style={{ zIndex: 10000 }} // Un z-index mayor que el del modal
            />

            <ConfirmationModal
                isOpen={showConfirmationModal}
                closeModal={() => setShowConfirmationModal(false)}
                confirmAction={handleDeleteFile}
                message="¿Estás seguro de que deseas eliminar este archivo?"
            />

            <LaboratoryTabBar highlight='Proceso' />
            <Header role='laboratory' />
            
            {isLoading ? (
                <p>Cargando...</p>
            ) : (
                <>
                    <div className={styles["tab-content"]}>
                        <div className={styles.form}>
                            <div className={styles["title"]}>
                                Estudios En Proceso
                            </div>
                            <Image
                                src="/refresh_icon.png"
                                alt="Notificaciones"
                                className={styles["refresh-icon"]}
                                width={200}
                                height={200}
                                onClick={() => {
                                    toast.info("Actualizando...");
                                    fetchInProgressStudies();
                                }}
                            />
                            <div className={styles["appointments-section"]}>
                                {studies.length > 0 ? (
                                    // If there are appointments, map through them and display each appointment
                                    <div>
                                        {/* ... */}
                                        {studies.map((study) => (
                                            <div
                                                key={study.id}
                                                className={
                                                    styles["appointment"]
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles["subtitle"]
                                                    }
                                                >
                                                    Estudio:{" "}
                                                    {study.title
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        (study.title).slice(1)}
                                                </div>
                                                <p>
                                                    Fecha y hora:{" "}
                                                    {new Date(
                                                        study.request_date * 1000
                                                    ).toLocaleString("es-AR")}
                                                </p>
                                                <p>
                                                    Detalle:{" "}
                                                    {study.details
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        (study.details).slice(1)}
                                                </p>
                                                <p>
                                                    Paciente:{" "}
                                                    {study.patient_full_name}
                                                </p>
                                                <div
                                                    className={
                                                        styles[
                                                            "appointment-buttons-container"
                                                        ]
                                                    }
                                                >
                                                    <button
                                                        className={
                                                            styles[
                                                                "standard-button"
                                                            ]
                                                        }
                                                        onClick={() =>{
                                                            openModal(study);
                                                        }
                                                            
                                                        }
                                                    >
                                                        Cargar informacion{" "}
                                                    </button>
                                                    <button
                                                        className={
                                                            styles[
                                                                "delete-button"
                                                            ]
                                                        }
                                                        onClick={() =>
                                                            handleFinishStudy(
                                                                study.id
                                                            )
                                                        }
                                                    >
                                                        Finalizar{" "}
                                                    </button>

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // If there are no appointments, display the message
                                    <div className={styles["subtitle"]}>
                                        No hay estudios en proceso
                                    </div>
                                )}
                                {/* ... */}
                            </div>
                        </div>
                    </div>

                    <Footer />
                </>
            )}

        </div>
    );
};

export default DashboardLaboratory;
