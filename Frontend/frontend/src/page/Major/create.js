import React from 'react';
import axios from 'axios';

const createMajor = () => {
    const[majorData, setMajor] = useState({
            Name:"",
            Description:"",  
        });
    
    return(
        <h1>Create Major</h1>
    );
};
export default createMajor;
