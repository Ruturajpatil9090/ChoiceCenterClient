import React, { useState, useEffect } from "react";
import { Form, Button, Navbar, Nav } from "react-bootstrap";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { RiLoginBoxLine } from "react-icons/ri";
import logo from "../../../Assets/EmployeeMaster1.png"
import logo1 from "../../../Assets/payslip.png"
import logo2 from "../../../Assets/Employee1.png"

const Home = () => {
  const [userType, setUserType] = useState("");
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const fetchedUserType = decodedToken.userType || "U";

      setUserType(fetchedUserType);
    } else{
      navigate('/')
    }
  }, []);

  const handleEmployeeClick = () => {
    navigate("/employeemasterutility");
  };

  const handleSalaryClick = () => {
    navigate("/salary_genarate_utility");
  };

  const handleUserClick = () => {
    navigate("/user_Creation_utility");
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    navigate("/");
  };

  return (
    <div className="centered">

{token && (
        <Navbar bg="info" expand="lg">
     
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end container ">
       
                <RiLoginBoxLine  style={{ fontSize: '25px'}}  />
          <Navbar.Brand>{userName}</Navbar.Brand>
            <Nav>
              <Button variant="danger" onClick={handleLogoutClick}>
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      )}
<br></br>

      <Form.Label className="animate-charcter">Choice Center</Form.Label>
      <div className="button-container">
        
        <Button variant="primary" className="button " onClick={handleEmployeeClick} style={{ color: "black", fontWeight: "bold" }}>
        <img src={logo} alt="" style={{height:"70px",width:"70px", borderRadius: "50%"}} />
          Employee Master
        </Button>
      
        <Button variant="success" className="button" onClick={handleSalaryClick}  style={{ color: "black", fontWeight: "bold" }}>
        <img src={logo1} alt=""  style={{height:"70px",width:"70px",borderRadius: "50%"}}/>
          Genrate Salary
        </Button>
        {userType === "A" && (
          <Button variant="info" className="button" onClick={handleUserClick}  style={{ color: "black", fontWeight: "bold" }}>
              <img src={logo2} alt=""  style={{height:"70px",width:"70px"}}/>
            User Creation
          </Button>
        )}
       
      </div>
    </div>
  );
};

export default Home;
