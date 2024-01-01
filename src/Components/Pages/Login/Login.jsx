import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../../../Assets/boutique.png"
import { IoIosPersonAdd } from "react-icons/io";
import { RiLockPasswordFill } from "react-icons/ri";
import "../../../App.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    showPassword: false,
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTogglePassword = () => {
    setFormData({
      ...formData,
      showPassword: !formData.showPassword,
    });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees/loginuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { token, userType,userName} = await response.json();

        // Store the token in localStorage
        localStorage.setItem('token', token);

        // Optionally, you can store userType as well
        localStorage.setItem('userType', userType);
        localStorage.setItem('userName', userName);

        if (userType === 'admin') {
          console.log('Admin logic');
          // Add logic for admin user
        } else {
          // Add logic for regular user
        }

        // Navigate to the home page
        navigate('/home');
      } else {
        const errorData = await response.json();
        alert('Invalid Credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again later.');
    }
  };


  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div className="col-md-4">
        <div className="card shadow">
          <div className="card-body">
          <img src={logo} alt="" width="100" height="100" style={{marginLeft:"180px"}} />

            <h2 className="text-center mb-4 custom-heading" >Choice Center</h2>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center' }}>
                
                <IoIosPersonAdd  style={{ fontSize: '30px' }} />
                Username
              </label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                autoComplete='off'
              />
            </div>
          <br></br>
            <div className="form-group" style={{ position: 'relative' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
               
                <RiLockPasswordFill  style={{ fontSize: '30px' }}  />
                Password
              </label>
              <input
                type={formData.showPassword ? 'text' : 'password'}
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete='off'
              />
              <i
                className="material-icons"
                onClick={handleTogglePassword}
                style={{ cursor: 'pointer', position: 'absolute', top: '70%', right: '10px', transform: 'translateY(-50%)' }}
              >
                {formData.showPassword ? 'visibility' : 'visibility_off'}
              </i>
            </div>
            
            <br />
            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-primary rounded-pill" onClick={handleLogin}>
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
