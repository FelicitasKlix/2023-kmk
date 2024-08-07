"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/styles.module.css";
import axios from "axios";
import https from "https";
import { Footer, Header, TabBar } from "../components/header";
import ConfirmationModal from "../components/ConfirmationModal";
import Image from "next/image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyRecord = () => {
    const [isLoading, setIsLoading] = useState(true);
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const [file, setFile] = useState([]); // File to be uploaded
    const [analysis, setAnalysis] = useState([]);
    const [record, setRecord] = useState({
        name: "",
        last_name: "",
        birth_date: "",
        gender: "",
        blood_type: "",
        id: "",
        observations: [],
        lab_details: [],
    });
    const inputRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState('');

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const fetchData = async () => {
        try {
            const response = await axios.get(`${apiURL}records/get-my-record`, {
                httpsAgent: agent,
            });
            console.log(response);
            setRecord(response.data.record);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMyAnalysis = async () => {
        try {
            const response = await axios.get(`${apiURL}analysis`);
            setAnalysis(response.data);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDownload = (url) => {
        const link = document.createElement("a");
        link.download = url;

        link.href = url;

        link.click();
    };

    const handleDeleteClick = (file) => {
        console.log(file);
        setSelectedFile(file);
        setShowModal(true);
    };

    const handleDeleteFile = async () => {
        setShowModal(false);
        try {
            const response = await axios.delete(`${apiURL}analysis/${selectedFile}`);
            console.log(response);
            toast.success("Analisis eliminado con exito");
            fetchMyAnalysis();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar analisis");
        }
    };

    const resetFileInput = () => {
        inputRef.current.value = null;
        setFile([]);
    };

    const onSubmit = async (e) => {
        toast.info("Subiendo analisis");
        const formData = new FormData();
        Array.from(e).forEach((file_to_upload) =>
            formData.append("analysis", file_to_upload)
        );
        try {
            const response = await axios.post(`${apiURL}analysis`, formData);
            console.log(response);
            toast.success("Analisis subido con exito");
            fetchMyAnalysis();
            resetFileInput();
        } catch (error) {
            console.error(error);
            toast.error("Error al subir analisis");
        }
    };

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        fetchData();
        fetchMyAnalysis().then(() => setIsLoading(false));
    }, []);

    return (
        <div className={styles.dashboard}>
            <TabBar highlight="Ficha" />

            <Header role="patient" />

            {isLoading ? (
                <p>Cargando...</p>
            ) : (
                <>
                    <div className={styles["tab-content"]}>
                        <div className={styles.form}>
                            <div className={styles["title"]}>
                                {record.name} {record.last_name}
                            </div>
                            <Image
                                src="/refresh_icon.png"
                                alt="Refrescar"
                                className={styles["refresh-icon"]}
                                width={200}
                                height={200}
                                onClick={() => {
                                    toast.info("Actualizando...");
                                    fetchData();
                                    fetchMyAnalysis();
                                }}
                            />
                            <div className={styles["subtitle"]}>
                                Nac.: {record.birth_date}
                            </div>
                            <div className={styles["subtitle"]}>
                                Genero: {record.gender}
                            </div>
                            <div className={styles["subtitle"]}>
                                Grupo sanguíneo: {record.blood_type}
                            </div>

                            <div className={styles["my-estudios-section"]}>
                                <div className={styles["title"]}>
                                    Mis Estudios
                                </div>

                                <div className={styles["horizontal-scroll"]}>
                                    {analysis.length > 0 ? (
                                        analysis.map((uploaded_analysis) => {
                                            return (
                                                <a
                                                    className={
                                                        styles["estudio-card"]
                                                    }
                                                    key={uploaded_analysis.id}
                                                >
                                                    <div
                                                        onClick={() => {
                                                            handleDownload(
                                                                uploaded_analysis.url
                                                            );
                                                        }}
                                                    >
                                                        <div
                                                            className={
                                                                styles[
                                                                    "estudio-name"
                                                                ]
                                                            }
                                                        >
                                                            {uploaded_analysis.file_name.substring(
                                                                0,
                                                                12
                                                            ) + "..."}
                                                        </div>
                                                        <Image
                                                            src="/document.png"
                                                            alt=""
                                                            className={
                                                                styles[
                                                                    "document-icon"
                                                                ]
                                                            }
                                                            style={{
                                                                alignSelf:
                                                                    "center",
                                                                margin: "auto",
                                                            }}
                                                            width={100}
                                                            height={100}
                                                        />
                                                        <div
                                                            className={
                                                                styles[
                                                                    "estudio-date"
                                                                ]
                                                            }
                                                            style={{
                                                                alignSelf:
                                                                    "center",
                                                                margin: "auto",
                                                                display:
                                                                    "table",
                                                                padding:
                                                                    "5px 0",
                                                            }}
                                                        >
                                                            {new Date(
                                                                uploaded_analysis.uploaded_at *
                                                                    1000
                                                            ).toLocaleDateString(
                                                                "es-AR"
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Image
                                                        src="/trash_icon.png"
                                                        alt=""
                                                        className={
                                                            styles[
                                                                "document-icon"
                                                            ]
                                                        }
                                                        style={{
                                                            alignSelf: "center",
                                                        }}
                                                        width={25}
                                                        height={25}
                                                        onClick={() => {
                                                            handleDeleteClick(
                                                                uploaded_analysis.id
                                                            );
                                                        }}
                                                    />
                                                </a>
                                            );
                                        })
                                    ) : (
                                        <div
                                            style={{
                                                alignSelf: "center",
                                                margin: "auto",
                                                padding: "5px 0",
                                            }}
                                        >
                                            No hay analisis cargados
                                        </div>
                                    )}
                                    {/* ... */}
                                </div>
                                {/* Modal de confirmación */}
                                <ConfirmationModal
                                    isOpen={showModal}
                                    closeModal={() => setShowModal(false)}
                                    confirmAction={handleDeleteFile}
                                    message="¿Estás seguro de que deseas eliminar este archivo?"
                                />

                                <form className={styles["file-upload-form"]}>
                                    <label
                                        htmlFor="files"
                                        className={styles["upload-button"]}
                                        style={{ color: "#fff" }}
                                    >
                                        Cargar analisis
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
                        </div>
                        <div className={styles["title"]}>
                                    Observaciones
                        </div>
                        <div className={styles["records-section"]}>
                            {record.observations.length > 0 ? (
                                <>
                                    {record.observations.map(
                                        (observation, index) => {
                                            console.log(observation);
                                            return (
                                                <div
                                                    className={
                                                        styles["record-card"]
                                                    }
                                                    key={index}
                                                >
                                                    <div
                                                        className={
                                                            styles[
                                                                "record-date"
                                                            ]
                                                        }
                                                    >
                                                        Observacion del{" "}
                                                        {new Date(
                                                            observation.appointment_date *
                                                                1000
                                                        ).toLocaleDateString(
                                                            "es-AR"
                                                        )}{" "}
                                                        - Médico:{" "}
                                                        {observation.physician}
                                                        - Especialidad:{" "}
                                                        {observation.specialty
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        (observation.specialty).slice(1)}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles[
                                                                "record-observations"
                                                            ]
                                                        }
                                                    >
                                                        {
                                                            observation.observation
                                                        }
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </>
                            ) : (
                                <div className={styles["subtitle"]}>
                                    No hay observaciones en esta historia
                                    clinica
                                </div>
                            )}
                        </div>
                        <div className={styles["blank"]}></div>
                        
                        <div className={styles["title"]}>
                                    Estudios de Laboratorio
                        </div>
                        <div className={styles["records-section"]}>
                            {record.lab_details.length > 0 ? (
                                <>
                                    {record.lab_details.map(
                                        (lab_record, index) => {
                                            console.log(lab_record);
                                            return (
                                                <div
                                                    className={
                                                        styles["record-card"]
                                                    }
                                                    key={index}
                                                >
                                                    <div
                                                        className={
                                                            styles[
                                                                "record-date"
                                                            ]
                                                        }
                                                    >
                                                        Estudio:{" "}
                                                        {lab_record.study_title}{" "}
                                                        - Fecha de solicitud:{" "}
                                                        {new Date(
                                                            lab_record.request_date *
                                                                1000
                                                        ).toLocaleDateString(
                                                            "es-AR"
                                                        )}{" "}
                                                        - Médico:{" "}
                                                        {lab_record.physician_name[0] + " " + lab_record.physician_name[1]}
                                                        {" "}
                                                        - Laboratorio:{" "}
                                                        {lab_record.laboratory_name[0] + " - " + lab_record.laboratory_name[1]}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles[
                                                                "record-observations"
                                                            ]
                                                        }
                                                    >
                                                        {
                                                            lab_record.lab_details.charAt(0).toUpperCase()+(lab_record.lab_details).slice(1)
                                                            
                                                        }
                                                        <p></p>
                                                        {/* <a href={lab_record.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
                                                            Link de descarga del archivo
                                                        </a> */}
                                                        {lab_record.files && lab_record.files.length > 0 ? (
                                                        lab_record.files.map((file, fileIndex) => (
                                                            <div key={fileIndex}>
                                                                <a 
                                                                    href={file.url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    style={{ color: 'blue', textDecoration: 'underline' }}
                                                                >
                                                                    Link de descarga del archivo {fileIndex + 1}
                                                                </a>
                                                            </div>
                                                        ))
                                                        ) : lab_record.file_url ? (
                                                            <a 
                                                                href={lab_record.file_url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                style={{ color: 'blue', textDecoration: 'underline' }}
                                                            >
                                                                Link de descarga del archivo
                                                            </a>
                                                        ) : (
                                                            <p>No hay archivos disponibles</p>
                                                        )}
                                                        
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </>
                            ) : (
                                <div className={styles["subtitle"]}>
                                    No hay estudios de laboratorio en esta historia
                                    clinica
                                </div>
                            )}
                        </div>
                    </div>

                    <Footer />
                </>
            )}
        </div>
    );
};
export default MyRecord;
