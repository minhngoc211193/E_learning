import React from "react";
import { useNavigate } from "react-router-dom";
import styles from './BackButton.module.css'

function BackButton(){
    const navigate  = useNavigate();

    return(
        <div className={styles.backButton}>
            <span onClick={() => navigate(-1)}><i class="fa-solid fa-arrow-left"></i></span>
        </div>
    )
}

export default BackButton;