import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Components/Pages/Login/Login';
import Home from './Components/Pages/Home/Home';
import EmployeeMasterCompoenet from './Components/EmployeeMaster/EmployeeMasterCompoenet';
import SalaryComponent from './Components/Salary/SalaryComponent';
import UserCreationCompoenent from './Components/UserCreation/UserCreationCompoenent';
import EmployeeMasterUtility from "./Components/EmployeeMaster/EmployeeMasterUtility"
import UserCreationUtility from "./Components/UserCreation/UserCreationUtility"
import SalaryUtility from "./Components/Salary/SalaryUtility"

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
        <Route path="/"  element={<Login/>} /> 
          <Route path="/home" element={<Home/>} />
          <Route path="/employeemaster"  element={<EmployeeMasterCompoenet/>} /> 
          <Route path="/employeemasterutility"  element={<EmployeeMasterUtility/>} /> 
          <Route path="/salary_genarate"  element={<SalaryComponent/>} /> 
          <Route path="/salary_genarate_utility"  element={<SalaryUtility/>} /> 
          <Route path="/user_Creation"  element={<UserCreationCompoenent/>} /> 
          <Route path="/user_Creation_utility"  element={<UserCreationUtility/>} /> 
        </Routes>
      </div>
    </Router>
  );
};

export default App;

