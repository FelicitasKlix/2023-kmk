"use client";

import React, { useState, useEffect } from "react";
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
import "react-toastify/dist/ReactToastify.css";
import InfoIcon from "@mui/icons-material/Info";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

registerLocale("es", es);

const DashboardLaboratory = () => {
    const [isLoading, setIsLoading] = useState(true);
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const [studies, setStudies] = useState([]);
    const router = useRouter();

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
        content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "auto",
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
        }
    };

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        fetchInProgressStudies()
            .then(() => setIsLoading(false)) // Marcar como cargado cuando la respuesta llega
            .catch(() => {
                setIsLoading(false); // Asegúrate de marcar como cargado en caso de error
                toast.error("Error al obtener los datos del usuario");
            });
    }, []);

    return (
        <div className={styles.dashboard}>
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
                                    toast.info("Actualizando estudios pendientes...");
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
                                                        // onClick={() =>
                                                        //     handleFinishStudy(
                                                        //         study.id
                                                        //     )
                                                        // }
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
                                        No hay estudios pendientes
                                    </div>
                                )}
                                {/* ... */}
                            </div>
                            {/* Modal de confirmación
                            <ConfirmationModal
                                    isOpen={showModal}
                                    closeModal={() => setShowModal(false)}
                                    confirmAction={handleDenyAppointment}
                                    message="¿Estás seguro de que deseas rechazar este turno?"
                                />  */}
                        </div>
                    </div>

                    <Footer />
                </>
            )}

        </div>
    );
};

export default DashboardLaboratory;
