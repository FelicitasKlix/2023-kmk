"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Pie } from "react-chartjs-2";
import Chart from "chart.js/auto"; // NO BORRAR; Es necesario para que los graficos corran correctamente
import styles from "../styles/styles.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";
import https from "https";
import ConfirmationModal from "../components/ConfirmationModal";
import { Header, Footer } from "../components/header";
import { toast } from "react-toastify";
import { userCheck } from "../components/userCheck";

const Admin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const [firstLoad, setFirstLoad] = useState(true);
    const [specialties, setSpecialties] = useState([]);
    const [newSpecialty, setNewSpecialty] = useState("");
    const [physicians, setPhysicians] = useState([]);
    const [approvedLabs, setLabs] = useState([]);
    const [pendingPhysicians, setPendingPhysicians] = useState([]);
    const [blockedPhysicians, setBlockedPhysicians] = useState([]);
    const [blockedLabs, setBlockedLabs] = useState([]);
    const [metrics, setMetrics] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const [disabledSpecialtyAddButton, setDisabledSpecialtyAddButton] =
        useState(false);
    const [newStudy, setNewStudy] = useState("");
    const [disabledStudyAddButton, setDisabledStudyAddButton] =
    useState(false);
    const [studies, setStudies] = useState([]);
    const [selectedStudy, setSelectedStudy] = useState("");
    const [deletingStudy, setDeletingStudy] = useState(false);
    const [pendingLaboratories, setPendingLaboratories] = useState([]);
    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const fetchSpecialties = async () => {
        try {
            const response = await axios.get(`${apiURL}specialties/`, {
                httpsAgent: agent,
            });
            console.log(response.data.specialties);
            response.data.specialties == undefined
                ? setSpecialties([])
                : setSpecialties(response.data.specialties);

            //!firstLoad ? toast.success("Especialidades actualizadas") : null;
            toast.success("Especialidades actualizadas");
        } catch (error) {
            toast.error("Error al cargar especialidades");
            console.error(error);
        }
    };

    const fetchStudies = async () => {
        try {
            const response = await axios.get(`${apiURL}studies/`, {
                httpsAgent: agent,
            });
            console.log(response.data.studies);
            response.data.studies == undefined
                ? setStudies([])
                : setStudies(response.data.studies);

            !firstLoad ? toast.success("Estudios actualizados") : null;
        } catch (error) {
            toast.error("Error al cargar estudios");
            console.error(error);
        }
    };

    const handleAddSpecialty = async () => {
        setDisabledSpecialtyAddButton(true);
        try {
            toast.info("Agregando especialidad...");
            const response = await axios.post(
                `${apiURL}specialties/add/${newSpecialty}`,
                {
                    httpsAgent: agent,
                }
            );
            toast.success("Especialidad agregada");
            setNewSpecialty("");
            setFirstLoad(true);
            fetchSpecialties();
            setFirstLoad(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al agregar especialidad");
        }
        setDisabledSpecialtyAddButton(false);
    };

    const handleAddStudy = async () => {
        setDisabledStudyAddButton(true);
        try {
            toast.info("Agregando estudio...");
            const response = await axios.post(
                `${apiURL}studies/add/${newStudy}`,
                {
                    httpsAgent: agent,
                }
            );
            toast.success("Estudio agregado");
            setNewStudy("");
            setFirstLoad(true);
            fetchStudies();
            setFirstLoad(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al agregar especialidad");
        }
        setDisabledStudyAddButton(false);
    };

    const handleDeleteClick = (specialty) => {
        setSelectedSpecialty(specialty);
        setShowModal(true);
    };

    const handleDeleteStudyClick = (study) => {
        setSelectedStudy(study);
        setDeletingStudy(true);
        setShowModal(true);
    };

    const handleDeleteConfirmation = async () => {
        setShowModal(false);
        if (deletingStudy){
            try {
                toast.info("Borrando estudio...");
                const response = await axios.delete(
                    `${apiURL}studies/delete/${selectedStudy}`
                );
                console.log(response.data);
                toast.success("Estudio eliminado exitosamente");
                fetchStudies();
            } catch (error) {
                console.error(error);
                toast.error("Error al borrar estudio");
            }
        }
        else{
            try {
                toast.info("Borrando especialidad...");
                const response = await axios.delete(
                    `${apiURL}specialties/delete/${selectedSpecialty}`
                );
                console.log(response.data);
                toast.success("Especialidad eliminada exitosamente");
                fetchSpecialties();
            } catch (error) {
                console.error(error);
                toast.error("Error al borrar especialidad");
            }
        }
    };

    const fetchPendingPhysicians = async () => {
        try {
            const response = await axios.get(
                `${apiURL}admin/physicians-pending`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data.physicians_pending_validation);
            setPendingPhysicians(response.data.physicians_pending_validation);
            //!firstLoad ? toast.success("Profesionales actualizados") : null;
        } catch (error) {
            console.error(error);
            !firstLoad
                ? toast.error("Error al actualizar los profesionales")
                : null;
        }
    };

    const fetchPendingLaboratories = async () => {
        try {
            const response = await axios.get(
                `${apiURL}admin/laboratories-pending`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data.laboratories_to_validate);
            setPendingLaboratories(response.data.laboratories_to_validate);
            //!firstLoad ? toast.success("Laboratorios actualizados") : null;
        } catch (error) {
            console.error(error);
            !firstLoad
                ? toast.error("Error al actualizar los laboratorios")
                : null;
        }
    };

    const fetchPhysicians = async () => {
        try {
            const response = await axios.get(
                `${apiURL}admin/physicians-working`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data.physicians_working);
            setPhysicians(response.data.physicians_working);
            !firstLoad ? toast.success("Profesionales actualizados") : null;
        } catch (error) {
            console.error(error);
            !firstLoad
                ? toast.error("Error al actualizar los profesionales")
                : null;
        }
    };

    const fetchLabs = async () => {
        try {
            const response = await axios.get(
                `${apiURL}admin/labs-working`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data.appoved_laboratories);
            setLabs(response.data.appoved_laboratories);
            !firstLoad ? toast.success("Laboratorios actualizados") : null;
        } catch (error) {
            console.error(error);
            !firstLoad
                ? toast.error("Error al actualizar los laboratorios")
                : null;
        }
    };

    const fetchBlockedLabs = async () => {
        try {
            const response = await axios.get(
                `${apiURL}admin/labs-blocked`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data.denied_laboratories);
            setBlockedLabs(response.data.denied_laboratories);
            //!firstLoad ? toast.success("Laboratorios actualizados") : null;
        } catch (error) {
            console.error(error);
            !firstLoad
                ? toast.error("Error al actualizar los laboratorios")
                : null;
        }
    };

    const fetchBlockedPhysicians = async () => {
        try {
            const response = await axios.get(
                `${apiURL}admin/physicians-blocked`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data.physicians_blocked);
            setBlockedPhysicians(response.data.physicians_blocked);
            //!firstLoad ? toast.success("Profesionales actualizados") : null;
        } catch (error) {
            console.error(error);
            !firstLoad
                ? toast.error("Error al actualizar los profesionales")
                : null;
        }
    };

    const handleApprovePhysician = async (physician) => {
        try {
            toast.info("Aprobando profesional...");
            console.log(physician.id);
            const response = await axios.post(
                `${apiURL}admin/approve-physician/${physician.id}`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data);
            toast.success("Profesional aprobado");
            setFirstLoad(true);
            fetchPendingPhysicians();
            fetchPhysicians();
            fetchBlockedPhysicians();
            setFirstLoad(false);
        } catch (error) {
            console.log(error);
            toast.error("Error al aprobar profesional");
        }
    };

    const handleDenyPhysician = async (physician) => {
        toast.info("Denegando profesional...");
        try {
            toast.info("Bloquando medico...");
            console.log(physician.id);
            const response = await axios.post(
                `${apiURL}admin/deny-physician/${physician.id}`,
                {
                    httpsAgent: agent,
                }
            );
            toast.success("Profesional denegado");
            setFirstLoad(true);
            fetchPendingPhysicians();
            fetchPhysicians();
            fetchBlockedPhysicians();
            setFirstLoad(false);
        } catch (error) {
            console.log(error);
            toast.error("Error al denegar profesional");
        }
    };

    const handleUnblockPhysician = async (physician) => {
        toast.info("Desbloqueando profesional...");
        try {
            toast.info("Desbloqueando medico...");
            console.log(physician.id);
            const response = await axios.post(
                `${apiURL}admin/unblock-physician/${physician.id}`,
                {
                    httpsAgent: agent,
                }
            );
            toast.success("Profesional desbloqueado");
            setFirstLoad(true);
            fetchPendingPhysicians();
            fetchPhysicians();
            fetchBlockedPhysicians();
            setFirstLoad(false);
        } catch (error) {
            console.log(error);
            toast.error("Error al desbloquear profesional");
        }
    };

    const handleApproveLaboratory = async (laboratory) => {
        try {
            toast.info("Aprobando laboratorio...");
            console.log(laboratory.id);
            const response = await axios.post(
                `${apiURL}admin/approve-laboratory/${laboratory.id}`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data);
            toast.success("Laboratorio aprobado");
            setFirstLoad(true);
            fetchPendingLaboratories();
            fetchLabs();
            fetchBlockedLabs();
            setFirstLoad(false);
        } catch (error) {
            console.log(error);
            toast.error("Error al aprobar laboratorio");
        }
    };

    const handleDenyLaboratory = async (laboratory) => {
        try {
            toast.info("Bloquando laboratorio...");
            console.log(laboratory.id);
            const response = await axios.post(
                `${apiURL}admin/deny-laboratory/${laboratory.id}`,
                {
                    httpsAgent: agent,
                }
            );
            //toast.success("Laboratorio denegado");
            setFirstLoad(true);
            fetchPendingLaboratories();
            fetchLabs();
            fetchBlockedLabs();
            setFirstLoad(false);
        } catch (error) {
            console.log(error);
            toast.error("Error al denegar laboratorio");
        }
    };

    const handleUnblockLab = async (laboratory) => {
        //toast.info("Desbloqueando laboratorio...");
        try {
            toast.info("Desbloqueando laboratorio...");
            console.log(laboratory.id);
            const response = await axios.post(
                `${apiURL}admin/unblock-lab/${laboratory.id}`,
                {
                    httpsAgent: agent,
                }
            );
            toast.success("Laboratorio desbloqueado");
            setFirstLoad(true);
            fetchPendingLaboratories();
            fetchLabs();
            fetchBlockedLabs();
            setFirstLoad(false);
        } catch (error) {
            console.log(error);
            toast.error("Error al desbloquear laboratorio");
        }
    };

    const fetchMetrics = async () => {
        try {
            const response = await axios.get(`${apiURL}dashboard/admin`, {
                httpsAgent: agent,
            });
            response.data.dashboard_metrics == undefined
                ? setMetrics({})
                : setMetrics(response.data.dashboard_metrics);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        userCheck(router, "admin").then(() => {
            fetchSpecialties();
            fetchMetrics();
            fetchStudies();
            fetchPhysicians();
            fetchBlockedPhysicians();
            fetchLabs();
            fetchBlockedLabs();
            fetchPendingPhysicians().then(() => setIsLoading(false));
            fetchPendingLaboratories().then(() => setIsLoading(false));
            setFirstLoad(false);
        });
    }, []);

    return (
        <div className={styles.dashboard}>
            <ConfirmationModal
                isOpen={showModal}
                closeModal={() => setShowModal(false)}
                confirmAction={handleDeleteConfirmation}
                message='¿Estás seguro de que deseas eliminar esta especialidad??'
            />

            <Header />
            {isLoading ? (
                <p>Cargando...</p>
            ) : (
                <>
                    <div className={styles["tab-content"]}>
                        <div className={styles.form}>
                            <div className={styles["title"]}>
                                Especialidades
                            </div>
                            <Image
                                src='/refresh_icon.png'
                                alt='Notificaciones'
                                className={styles["refresh-icon"]}
                                width={200}
                                height={200}
                                onClick={() => {
                                    toast.info(
                                        "Actualizando especialidades..."
                                    );
                                    fetchSpecialties();
                                }}
                            />

                            <div className={styles["subtitle"]}>
                                Agregar Especialidad
                            </div>
                            <input
                                type='text'
                                id='specialty'
                                name='specialty'
                                placeholder='Especialidad'
                                value={newSpecialty}
                                onChange={(e) =>
                                    setNewSpecialty(e.target.value)
                                }
                            />
                            <button
                                className={`${styles["add-button"]} ${
                                    disabledSpecialtyAddButton
                                        ? styles["disabled-button"]
                                        : ""
                                }`}
                                onClick={handleAddSpecialty}
                                disabled={disabledSpecialtyAddButton}
                            >
                                Agregar
                            </button>
                            <div className={styles["admin-scrollable-section"]}>
                                {specialties.length > 0 ? (
                                    <>
                                        {specialties.map((specialty) => (
                                            <div
                                                key={specialty}
                                                className={
                                                    styles[
                                                        "specialty-container"
                                                    ]
                                                }
                                            >
                                                <p>
                                                    {specialty
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        specialty.slice(1)}
                                                </p>
                                                <div
                                                    className={
                                                        styles[
                                                            "appointment-buttons-container"
                                                        ]
                                                    }
                                                >
                                                    <Image
                                                        src='/trash_icon.png'
                                                        alt='borrar'
                                                        className={styles.logo}
                                                        width={25}
                                                        height={25}
                                                        onClick={() => {
                                                            handleDeleteClick(
                                                                specialty
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className={styles["subtitle"]}>
                                        No hay especialidades
                                    </div>
                                )}
                            </div>
                        </div>

                        
                        <div className={styles.form}>
                            <div className={styles["title"]}>
                                Estudios
                            </div>
                            <Image
                                src='/refresh_icon.png'
                                alt='Notificaciones'
                                className={styles["refresh-icon"]}
                                width={200}
                                height={200}
                                onClick={() => {
                                    toast.info(
                                        "Actualizando estudios..."
                                    );
                                    fetchStudies();
                                }}
                            />

                            <div className={styles["subtitle"]}>
                                Agregar Estudios
                            </div>
                            <input
                                type='text'
                                id='study'
                                name='study'
                                placeholder='Estudio'
                                value={newStudy}
                                onChange={(e) =>
                                    setNewStudy(e.target.value)
                                }
                            />
                            <button
                                className={`${styles["add-button"]} ${
                                    disabledStudyAddButton
                                        ? styles["disabled-button"]
                                        : ""
                                }`}
                                onClick={handleAddStudy}
                                disabled={disabledStudyAddButton}
                            >
                                Agregar
                            </button>
                            <div className={styles["admin-scrollable-section"]}>
                                {studies.length > 0 ? (
                                    <>
                                        {studies.map((study) => (
                                            <div
                                                key={study}
                                                className={
                                                    styles[
                                                        "specialty-container"
                                                    ]
                                                }
                                            >
                                                <p>
                                                    {study
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        study.slice(1)}
                                                </p>
                                                <div
                                                    className={
                                                        styles[
                                                            "appointment-buttons-container"
                                                        ]
                                                    }
                                                >
                                                    <Image
                                                        src='/trash_icon.png'
                                                        alt='borrar'
                                                        className={styles.logo}
                                                        width={25}
                                                        height={25}
                                                        onClick={() => {
                                                            handleDeleteStudyClick(
                                                                study
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className={styles["subtitle"]}>
                                        No hay estudios
                                    </div>
                                )}
                            </div>
                        </div>
                        

                        <div className={styles.form}>
                            <div className={styles["title"]}>
                                Profesionales pendientes de aprobación
                            </div>
                            <Image
                                src='/refresh_icon.png'
                                alt='Notificaciones'
                                className={styles["refresh-icon"]}
                                width={200}
                                height={200}
                                onClick={() => {
                                    toast.info("Actualizando profesionales...");
                                    fetchPendingPhysicians();
                                }}
                            />
                            <div className={styles["admin-section"]}>
                                {pendingPhysicians.length > 0 ? (
                                    <div>
                                        {pendingPhysicians.map((doctor) => (
                                            <div
                                                key={doctor.id}
                                                className={
                                                    styles["appointment"]
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles["subtitle"]
                                                    }
                                                >
                                                    {doctor.first_name +
                                                        " " +
                                                        doctor.last_name}
                                                </div>
                                                <p>
                                                    Especialidad:{" "}
                                                    {doctor.specialty}
                                                </p>
                                                <p>E-mail: {doctor.email}</p>
                                                <p>
                                                    Matricula: {doctor.tuition}
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
                                                                "approve-button"
                                                            ]
                                                        }
                                                        onClick={() =>
                                                            handleApprovePhysician(
                                                                doctor
                                                            )
                                                        }
                                                    >
                                                        Aprobar
                                                    </button>

                                                    <button
                                                        className={
                                                            styles[
                                                                "delete-button"
                                                            ]
                                                        }
                                                        onClick={() =>
                                                            handleDenyPhysician(
                                                                doctor
                                                            )
                                                        }
                                                    >
                                                        Bloquear
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles["subtitle"]}>
                                        No hay aprobaciones pendientes
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.form}>
                            <div className={styles["title"]}>
                                Profesionales en funciones
                            </div>
                            <Image
                                src='/refresh_icon.png'
                                alt='Notificaciones'
                                className={styles["refresh-icon"]}
                                width={200}
                                height={200}
                                onClick={() => {
                                    toast.info("Actualizando profesionales...");
                                    fetchPhysicians();
                                }}
                            />
                            <div className={styles["admin-section"]}>
                                {physicians.length > 0 ? (
                                    <div>
                                        {physicians.map((doctor) => (
                                            <div
                                                key={doctor.id}
                                                className={
                                                    styles["appointment"]
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles["subtitle"]
                                                    }
                                                >
                                                    {doctor.first_name +
                                                        " " +
                                                        doctor.last_name}
                                                </div>
                                                <p>
                                                    Especialidad:{" "}
                                                    {doctor.specialty}
                                                </p>
                                                <p>E-mail: {doctor.email}</p>
                                                <p>
                                                    Matricula: {doctor.tuition}
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
                                                                "delete-button"
                                                            ]
                                                        }
                                                        onClick={() =>
                                                            handleDenyPhysician(
                                                                doctor
                                                            )
                                                        }
                                                    >
                                                        Bloquear
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles["subtitle"]}>
                                        No hay profesionales en funciones
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.form}>
                            <div className={styles["title"]}>
                                Profesionales bloqueados / denegados
                            </div>
                            <Image
                                src='/refresh_icon.png'
                                alt='Notificaciones'
                                className={styles["refresh-icon"]}
                                width={200}
                                height={200}
                                onClick={() => {
                                    toast.info("Actualizando profesionales...");
                                    fetchBlockedPhysicians();
                                }}
                            />
                            <div className={styles["admin-section"]}>
                                {blockedPhysicians.length > 0 ? (
                                    // If there are pending doctor approvals, map through them and display each appointment
                                    <div>
                                        {blockedPhysicians.map((doctor) => (
                                            <div
                                                key={doctor.id}
                                                className={
                                                    styles["appointment"]
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles["subtitle"]
                                                    }
                                                >
                                                    {doctor.first_name +
                                                        " " +
                                                        doctor.last_name}
                                                </div>
                                                <p>
                                                    Especialidad:{" "}
                                                    {doctor.specialty}
                                                </p>
                                                <p>E-mail: {doctor.email}</p>
                                                <p>
                                                    Matricula: {doctor.tuition}
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
                                                                "approve-button"
                                                            ]
                                                        }
                                                        onClick={() =>
                                                            handleUnblockPhysician(
                                                                doctor
                                                            )
                                                        }
                                                    >
                                                        Desbloquear
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // If there are no pending doctor approvals, display the message
                                    <div className={styles["subtitle"]}>
                                        No hay profesionales bloqueados
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.form}>
                            <div className={styles["title"]}>
                                Laboratorios pendientes de aprobación
                            </div>
                            <Image
                                src='/refresh_icon.png'
                                alt='Notificaciones'
                                className={styles["refresh-icon"]}
                                width={200}
                                height={200}
                                onClick={() => {
                                    toast.info("Actualizando laboratorios...");
                                    fetchPendingLaboratories();
                                }}
                            />
                            <div className={styles["admin-section"]}>
                                {pendingLaboratories.length > 0 ? (
                                    <div>
                                        {pendingLaboratories.map((lab) => (
                                            <div
                                                key={lab.id}
                                                className={
                                                    styles["appointment"]
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles["subtitle"]
                                                    }
                                                >
                                                    {lab.first_name}
                                                </div>
                                                <p>Dirección: {lab.last_name}</p>
                                                <p>E-mail: {lab.email}</p>
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
                                                                "approve-button"
                                                            ]
                                                        }
                                                        onClick={() =>
                                                            handleApproveLaboratory(
                                                                lab
                                                            )
                                                        }
                                                    >
                                                        Aprobar
                                                    </button>

                                                    <button
                                                        className={
                                                            styles[
                                                                "delete-button"
                                                            ]
                                                        }
                                                        onClick={() =>
                                                            handleDenyLaboratory(
                                                                lab
                                                            )
                                                        }
                                                    >
                                                        Bloquear
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles["subtitle"]}>
                                        No hay aprobaciones pendientes
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.form}>
                            <div className={styles["title"]}>
                                Laboratorios en funciones
                            </div>
                            <Image
                                src='/refresh_icon.png'
                                alt='Notificaciones'
                                className={styles["refresh-icon"]}
                                width={200}
                                height={200}
                                onClick={() => {
                                    toast.info("Actualizando laboratorios...");
                                    fetchLabs();
                                }}
                            />
                            <div className={styles["admin-section"]}>
                                {approvedLabs.length > 0 ? (
                                    <div>
                                        {approvedLabs.map((lab) => (
                                            <div
                                                key={lab.id}
                                                className={
                                                    styles["appointment"]
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles["subtitle"]
                                                    }
                                                >
                                                    {lab.first_name}
                                                </div>
                                                <p>
                                                    Dirección:{" "}
                                                    {lab.last_name}
                                                </p>
                                                <p>
                                                    Email:{" "}
                                                    {lab.email}
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
                                                                "delete-button"
                                                            ]
                                                        }
                                                        onClick={() =>
                                                            handleDenyLaboratory(
                                                                lab
                                                            )
                                                        }
                                                    >
                                                        Bloquear
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles["subtitle"]}>
                                        No hay laboratorios en funciones
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.form}>
                            <div className={styles["title"]}>
                                Laboratorios bloqueados / denegados
                            </div>
                            <Image
                                src='/refresh_icon.png'
                                alt='Notificaciones'
                                className={styles["refresh-icon"]}
                                width={200}
                                height={200}
                                onClick={() => {
                                    toast.info("Actualizando laboratorios...");
                                    fetchBlockedLabs();
                                }}
                            />
                            <div className={styles["admin-section"]}>
                                {blockedLabs.length > 0 ? (
                                    // If there are pending doctor approvals, map through them and display each appointment
                                    <div>
                                        {blockedLabs.map((lab) => (
                                            <div
                                                key={lab.id}
                                                className={
                                                    styles["appointment"]
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles["subtitle"]
                                                    }
                                                >
                                                    {lab.first_name}
                                                </div>
                                                <p>
                                                    Dirección:{" "}
                                                    {lab.last_name}
                                                </p>
                                                <p>
                                                    Email:{" "}
                                                    {lab.email}
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
                                                                "approve-button"
                                                            ]
                                                        }
                                                        onClick={() =>
                                                            handleUnblockLab(
                                                                lab
                                                            )
                                                        }
                                                    >
                                                        Desbloquear
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // If there are no pending doctor approvals, display the message
                                    <div className={styles["subtitle"]}>
                                        No hay laboratorios bloqueados
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.form}>
                            <div className={styles["title"]}>Metricas</div>
                            <div className={styles["admin-section"]}>
                                {metrics.all_appointments_by_specialty &&
                                Object.keys(
                                    metrics.all_appointments_by_specialty
                                ).length > 0 ? (
                                    <div>
                                        <div className={styles["subtitle"]}>
                                            Turnos por especialidad
                                        </div>
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "400px",
                                                justifyContent: "center",
                                                alignContent: "space-around",
                                                justifyContent: "space-around",
                                                margin: "auto",
                                                padding: "1rem",
                                            }}
                                        >
                                            <Pie
                                                data={{
                                                    labels: Object.keys(
                                                        metrics.all_appointments_by_specialty
                                                    ),
                                                    datasets: [
                                                        {
                                                            label: "Cantidad de turnos",
                                                            data: Object.values(
                                                                metrics.all_appointments_by_specialty
                                                            ),
                                                            backgroundColor: [
                                                                "rgba(43, 59, 127, 0.3)",
                                                                "rgba(43, 59, 127, 0.5)",
                                                                "rgba(43, 59, 127, 0.7)",
                                                                "rgba(43, 59, 127, 0.9)",
                                                                "rgba(43, 59, 127, 1.1)",
                                                                "rgba(43, 59, 127, 1.3)",
                                                                "rgba(43, 59, 127, 1.5)",
                                                                "rgba(43, 59, 127, 1.7)",
                                                                "rgba(43, 59, 127, 1.9)",
                                                            ],
                                                        },
                                                    ],
                                                }}
                                                // height={30}
                                                // width={70}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    layout: {
                                                        padding: {
                                                            left: 150,
                                                            right: 150,
                                                        },
                                                    },
                                                    plugins: {
                                                        legend: {
                                                            position: "right",
                                                            labels: {
                                                                usePointStyle: true,
                                                                pointStyle:
                                                                    "circle",
                                                                padding: 20,
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles["subtitle"]}>
                                        No hay datos suficientes para mostrar
                                        metricas
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <Footer />
                </>
            )}
        </div>
    );
};

export default Admin;
