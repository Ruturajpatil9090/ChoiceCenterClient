import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";


var employeeCodeNew = "";

const UserCreationCompoenent = () => {
  const apiURL = process.env.REACT_APP_API_URL;
  const addNewButtonRef = useRef(null);
  const resaleMillDropdownRef = useRef(null);
  const updateButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const [updateButtonClicked, setUpdateButtonClicked] = useState(false);
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  const [addOneButtonEnabled, setAddOneButtonEnabled] = useState(false);
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(true);
  const [cancelButtonEnabled, setCancelButtonEnabled] = useState(true);
  const [editButtonEnabled, setEditButtonEnabled] = useState(false);
  const [deleteButtonEnabled, setDeleteButtonEnabled] = useState(false);
  const [backButtonEnabled, setBackButtonEnabled] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [highlightedButton, setHighlightedButton] = useState(null);
  const [cancelButtonClicked, setCancelButtonClicked] = useState(false);
  const [tender_date, setTender_Date] = useState(null);
  const [lifting_date, setLifting_Date] = useState(null);
  const [millCode, setMillCode] = useState("");
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedMillCode, setSelectedMillCode] = useState("");

  const [editedrecord, setEditedrecord] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [lastEmployeeCode, setLastEmployeeCode] = useState("");
  const [employeeDetails, setEmployeeDetails] = useState({
    employeeCode: "",
    userName: "",
    mobileNo: "",
    emailId: "",
    password: "",
    userType: "U",
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeDetails({
      ...employeeDetails,
      [name]: value,
    });
  };

  

  const handleAddOne = () => {
    // Disable and enable buttons as needed
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setIsEditMode(false);
    setIsEditing(true);

    // Focus on the dropdown if it exists
    if (resaleMillDropdownRef.current) {
      resaleMillDropdownRef.current.focus();
    }

    // Fetch the last employee code from the API
    axios
      .get(`${apiURL}/api/employees/lastusercode`)
      .then((response) => {
        // Assuming the API response contains the last employee code
        const lastEmployeeCode = response.data.lastUserCreation;

        // Set the last employee code to the employeeDetails
        setEmployeeDetails({
          employeeCode: lastEmployeeCode + 1,
          userName: "",
          mobileNo: "",
          emailId: "",
          password: "",
          userType: "U",
        });
      })
      .catch((error) => {
        console.error("Error fetching last employee code:", error);
      });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsEditMode(true);
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setBackButtonEnabled(true);
    if (resaleMillDropdownRef.current) {
      resaleMillDropdownRef.current.focus();
    }
    employeeCodeNew = employeeDetails.employeeCode;
  };

  const handleSaveOrUpdate = () => {
    if (isEditMode) {
      // Update existing user
      axios
        .put(
          `${apiURL}/api/employees/updateuser/${employeeCodeNew}`,
          employeeDetails
        )
        .then((response) => {
          console.log("Data updated successfully:", response.data);
          setIsEditMode(false);
          setAddOneButtonEnabled(true);
          setEditButtonEnabled(true);
          setDeleteButtonEnabled(true);
          setBackButtonEnabled(true);
          setSaveButtonEnabled(false);
          setCancelButtonEnabled(false);
          setUpdateButtonClicked(true);
          setIsEditing(false);
        })
        .catch((error) => {
          console.error("Error updating data:", error);
        });
    } else {
      // Insert new user
      axios
        .post(
          `${apiURL}/api/employees/insertnewuser`,
          employeeDetails
        )
        .then((response) => {
          console.log("Data saved successfully:", response.data);
          window.alert("Data saved successfully!");
          setIsEditMode(false);
          setAddOneButtonEnabled(true);
          setEditButtonEnabled(true);
          setDeleteButtonEnabled(true);
          setBackButtonEnabled(true);
          setSaveButtonEnabled(false);
          setCancelButtonEnabled(false);
          addNewButtonRef.current.focus();
          setSaveButtonClicked(true);
          setIsEditing(true);
        })
        .catch((error) => {
          console.error("Error saving data:", error);
        });
    }
  };

  const handleBack = () => {
    navigate("/user_Creation_utility");
  };

  const handleDelete = () => {
    console.log("Deleted");
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    axios
      .delete(
        `${apiURL}/api/employees/deleteuser/${employeeCodeNew}`
      )
      .then((response) => {
        console.log("User deleted successfully:", response.data);
        // Reset the form after successful deletion
        setEmployeeDetails({
          employeeCode: "",
          userName: "",
          mobileNo: "",
          emailId: "",
          password: "",
          userType: "U",
        });
      })
      .catch((error) => {
        console.error("Error during API call:", error);
      });
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setCancelButtonClicked(true);
    setIsEditing(false);
    // Use Axios to make a GET request to fetch the last record
    axios
      .get(`${apiURL}/api/employees/getlastrecordbyuserid`)
      .then((response) => {
        // Assuming the response contains the last record data
        const lastRecord = response.data.lastUserCreation;
        employeeCodeNew = response.data.lastUserCreation.employeeCode;
        console.log("++++", lastRecord);

        // Set the values from the last record to the state
        setEmployeeDetails({
          employeeCode: lastRecord.employeeCode,
          userName: lastRecord.userName,
          mobileNo: lastRecord.mobileNo,
          emailId: lastRecord.emailId,
          password: lastRecord.password,
          userType: lastRecord.userType,
        });
      })
      .catch((error) => {
        console.error("Error fetching last record:", error);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };
  const handleButtonClick = (button) => {
    setHighlightedButton(button);
  };
  const handleKeyDown = (event, handler) => {
    if (event.key === "Enter") {
      handler();
      addNewButtonRef.current.focus();
      if (handler === handleAddOne || handler === handleEdit) {
        if (resaleMillDropdownRef.current) {
          resaleMillDropdownRef.current.focus();
        }
      }
    }
  };

  const location = useLocation();
  const editRecordData = location.state && location.state.editRecordData;

  useEffect(() => {
    if (editRecordData) {
      setEmployeeDetails({
        ...editRecordData,
      });
      setAddOneButtonEnabled(true);
      setEditButtonEnabled(true);
      setDeleteButtonEnabled(true);
      setBackButtonEnabled(true);
      setSaveButtonEnabled(false);
      setCancelButtonEnabled(false);
      setCancelButtonClicked(true);
    } else {
      handleAddOne();
    }
  }, [editRecordData]);

  return (
    <>
      <div>
        <h3 className="mt-4 mb-4 text-center custom-heading">
          New User Creation
        </h3>
        <div
          style={{
            marginTop: "30px",
            marginBottom: "10px",
            display: "flex",
            gap: "10px",
            marginLeft: "600px",
          }}
        >
          <button
            onClick={handleAddOne}
            ref={addNewButtonRef}
            disabled={!addOneButtonEnabled}
            onKeyDown={(event) => handleKeyDown(event, handleAddOne)}
            tabIndex={0}
            style={{
              backgroundColor: addOneButtonEnabled ? "blue" : "white",
              color: addOneButtonEnabled ? "white" : "black",
              border: "1px solid #ccc",
              cursor: "pointer",
              width: "6%",
              height: "35px",
              fontSize: "12px",
            }}
          >
            Add
          </button>
          {isEditMode ? (
            <button
              onClick={handleSaveOrUpdate}
              onKeyDown={(event) => handleKeyDown(event, handleSaveOrUpdate)}
              style={{
                backgroundColor: "blue",
                color: "white",
                border: "1px solid #ccc",
                cursor: "pointer",
                width: "6%",
                height: "35px",
                fontSize: "12px",
              }}
            >
              update
            </button>
          ) : (
            <button
              onClick={handleSaveOrUpdate}
              disabled={!saveButtonEnabled}
              onKeyDown={(event) => handleKeyDown(event, handleSaveOrUpdate)}
              style={{
                backgroundColor: saveButtonEnabled ? "blue" : "white",
                color: saveButtonEnabled ? "white" : "black",
                border: "1px solid #ccc",
                cursor: saveButtonEnabled ? "pointer" : "not-allowed",
                width: "6%",
                height: "35px",
                fontSize: "12px",
              }}
            >
              Save
            </button>
          )}
          <button
            onClick={handleEdit}
            disabled={!editButtonEnabled}
            onKeyDown={(event) => handleKeyDown(event, handleEdit)}
            style={{
              backgroundColor: editButtonEnabled ? "blue" : "white",
              color: editButtonEnabled ? "white" : "black",
              border: "1px solid #ccc",
              cursor: editButtonEnabled ? "pointer" : "not-allowed",
              width: "6%",
              height: "35px",
              fontSize: "12px",
            }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={!deleteButtonEnabled}
            style={{
              backgroundColor: deleteButtonEnabled ? "blue" : "white",
              color: deleteButtonEnabled ? "white" : "black",
              border: "1px solid #ccc",
              cursor: deleteButtonEnabled ? "pointer" : "not-allowed",
              width: "6%",
              height: "35px",
              fontSize: "12px",
            }}
          >
            Delete
          </button>
          <button
            onClick={handleCancel}
            disabled={!cancelButtonEnabled}
            onKeyDown={(event) => handleKeyDown(event, handleCancel)}
            style={{
              backgroundColor: cancelButtonEnabled ? "blue" : "white",
              color: cancelButtonEnabled ? "white" : "black",
              border: "1px solid #ccc",
              cursor: cancelButtonEnabled ? "pointer" : "not-allowed",
              width: "6%",
              height: "35px",
              fontSize: "12px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleBack}
            disabled={!backButtonEnabled}
            onKeyDown={(event) => handleKeyDown(event, handleBack)}
            style={{
              backgroundColor: backButtonEnabled ? "blue" : "white",
              color: backButtonEnabled ? "white" : "black",
              border: "1px solid #ccc",
              cursor: backButtonEnabled ? "pointer" : "not-allowed",
              width: "6%",
              height: "35px",
              fontSize: "12px",
            }}
          >
            Back
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          marginLeft: "500px",
        }}
      >
        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <label className="form-label col-md-2">Employee Code:</label>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  name="employeeCode"
                  value={employeeDetails.employeeCode}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2">User Full Name:</label>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  name="userName"
                  value={employeeDetails.userName}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2">Password:</label>
              <div className="col-md-4">
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={employeeDetails.password}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2">Email Id:</label>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  name="emailId"
                  value={employeeDetails.emailId}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2">Mobile No:</label>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  name="mobileNo"
                  value={employeeDetails.mobileNo}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2">User Type:</label>
              <div className="col-md-4">
                <select
                  className="form-select"
                  name="userType"
                  value={employeeDetails.userType}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={!isEditing}
                >
                  <option value="U">User</option>
                  <option value="A">Admin</option>
                </select>
              </div>
            </div>

            <div></div>
          </form>
        </div>
      </div>
    </>
  );
};
export default UserCreationCompoenent;
