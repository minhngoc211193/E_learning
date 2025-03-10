import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";

function CreateClass (){
    const {step, setStep} = useState(1);
    const {classData, setClassData} = useState({
        Classname: "",
        Subject:"",
        
    })
}
export default CreateClass;