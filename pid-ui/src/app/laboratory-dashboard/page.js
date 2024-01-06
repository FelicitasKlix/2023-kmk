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
import { Footer, Header, TabBar } from "../components/header";
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
    const router = useRouter();

    // const agent = new https.Agent({
    //     rejectUnauthorized: false,
    // });


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

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        // checkPendingReviews()
        //     .then(() => {
        //         fetchSpecialties();
        //         fetchAppointments();
        //     })
        //     .then(() => setIsLoading(false));
    }, []);

    return (
        <div className={styles.dashboard}>

            <Header role='patient' />

        </div>
    );
};

export default DashboardLaboratory;
