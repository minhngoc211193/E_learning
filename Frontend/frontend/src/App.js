import React, {useState, Navigate} from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CreateUser from "./page/User/CreateUser";

import './App.css';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path = "/createuser" element ={<CreateUser/> }/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
