import React, { useState, useEffect, useRef } from "react";
import "../../App.css";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

var lastemployeeCode = "";
var From_Time = "";
var To_Time = "";

const EmployeeMasterComponent = () => {
  console.log("from time values", From_Time, To_Time);
  const apiURL = process.env.REACT_APP_API_URL;
  const [lastEmployeeCode, setLastEmployeeCode] = useState("");
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
  const [isEditing, setIsEditing] = useState(false);

  const [fromTime, setFromTime] = useState(new Date()); // Provide a default value
  const [toTime, setToTime] = useState(new Date()); // Provide a default value

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
      .get(`${apiURL}/api/employees/getlastemployee`)
      .then((response) => {
        // Assuming the API response contains the last employee code
        const lastEmployeeCode = response.data.lastEmployee;
        // Set the last employee code to the employeeDetails
        setEmployeeDetails((prevState) => ({
          ...prevState,
          Employee_Code: lastEmployeeCode + 1,
          Employee_Name: "",
          Basic_Salary: "",
          Rate_Per_Hour: "",
          Date_Of_Joining: getCurrentDate(),
          Resigned: "N",
        }));
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
    lastemployeeCode = employeeDetails.Employee_Code;
  };

  const handleSaveOrUpdate = () => {
    if (isEditMode) {
      // console.log("Employee details:", employeeDetails);
      const dateOfJoining = employeeDetails.Date_Of_Joining;

      // Format the date to the desired format (yyyy-MM-dd)
      const formattedDate = new Date(dateOfJoining).toISOString().split("T")[0];

      // Create a new object with the date part
      const employeeToUpdate = {
        ...employeeDetails,
        Date_Of_Joining: formattedDate,
        From_Time: fromTime
          ? fromTime.toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : null,
        To_Time: toTime
          ? toTime.toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : null,
      };

      // Send the employee details to the backend API for update
      axios
        .put(
          `${apiURL}/api/employees/updateemployee?Employee_Code=${employeeDetails.Employee_Code}`,
          employeeToUpdate
        )
        .then((response) => {
          // console.log("Employee updated:", response.data);
          // Optionally, reset the form or perform other actions after a successful update
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
          console.error("Error updating employee:", error);
          // Handle the error or show an error message
        });
    } else {
      // console.log("Employee details:", employeeDetails);
      // const dateOfJoining = employeeDetails.Date_Of_Joining;

      const dateOfJoining = new Date(employeeDetails.Date_Of_Joining);
      const formattedDate = dateOfJoining.toISOString().split("T")[0];

      // Create a new object with the date part
      const employeeToSave = {
        ...employeeDetails,
        Date_Of_Joining: formattedDate,
        From_Time: fromTime
          ? fromTime.toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : null,
        To_Time: toTime
          ? toTime.toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : null,
      };

      // Send the employee details to the backend API for insertion
      axios
        .post(`${apiURL}/api/employees/insert`, employeeToSave)
        .then((response) => {
          // console.log("Employee saved:", response.data);
          window.alert("Data saved successfully!");
          setEmployeeDetails({
            Employee_Code: "",
            Employee_Name: "",
            Basic_Salary: "",
            Rate_Per_Hour: "",
            Date_Of_Joining: getCurrentDate(),
            Resigned: "",
          });
        })
        .catch((error) => {
          console.error("Error saving employee:", error);
          // Handle the error or show an error message
        });
    }
  };

  const handleBack = () => {
    navigate("/employeemasterutility");
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      // Add a confirmation dialog to make sure the user really wants to delete

      axios
        .delete(
          `${apiURL}/api/employees/deleteemployee/${employeeDetails.Employee_Code}`
        )
        .then((response) => {
          console.log("Employee deleted:", response.data);
          // Optionally, perform other actions after a successful delete
          setEmployeeDetails({
            Employee_Code: "",
            Employee_Name: "",
            Basic_Salary: "",
            Rate_Per_Hour: "",
            Date_Of_Joining: getCurrentDate(),
            Resigned: "N",
          });
          setAddOneButtonEnabled(true);
          setEditButtonEnabled(true);
          setDeleteButtonEnabled(true);
          setBackButtonEnabled(true);
          setSaveButtonEnabled(false);
          setCancelButtonEnabled(false);
        })
        .catch((error) => {
          console.error("Error deleting employee:", error);
        });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setCancelButtonClicked(true);

    // Use Axios to make a GET request to fetch the last record
    axios
      .get(`${apiURL}/api/employees/getlastEmployeeAll`)
      .then((response) => {
        // Assuming the response contains the last record data
        const lastRecord = response.data.lastUserCreation;

        // Set the values from the last record to the state
        setEmployeeDetails({
          Employee_Code: lastRecord.Employee_Code,
          Employee_Name: lastRecord.Employee_Name,
          Basic_Salary: lastRecord.Basic_Salary,
          Rate_Per_Hour: lastRecord.Rate_Per_Hour,
          Date_Of_Joining: lastRecord.Date_Of_Joining,
          Resigned: lastRecord.Resigned,
        });
        setFromTime(
          lastRecord.From_Time
            ? new Date(`2024-01-01 ${lastRecord.From_Time}`)
            : null
        );
        setToTime(
          lastRecord.To_Time
            ? new Date(`2024-01-01 ${lastRecord.To_Time}`)
            : null
        );
      })
      .catch((error) => {
        console.error("Error fetching last record:", error);
      });
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

  const [employeeDetails, setEmployeeDetails] = useState({
    Employee_Code: "",
    Employee_Name: "",
    Basic_Salary: "",
    Rate_Per_Hour: "",
    Date_Of_Joining: getCurrentDate(),
    Resigned: "N",
  });

  const navigate = useNavigate();

  const getData = () => {
    axios
      .get(`${apiURL}/api/employees/lastemployee`)
      .then((response) => {
        const newCode = response.data.lastEmployee;
        setLastEmployeeCode(newCode);
        setLastEmployeeCode(newCode);
        // Calculate the next Employee_Code and set it in the employeeDetails
        setEmployeeDetails((prevState) => ({
          ...prevState,
          Employee_Code: newCode + 1, // Increment the lastEmployeeCode by 1
        }));
      })
      .catch((error) => {
        console.error("Error fetching lastEmployeeCode:", error);
      });
  };

  const getDatalast = () => {
    axios
      .get(`${apiURL}/api/employees/lastemployee`)
      .then((response) => {
        const newCode = response.data.lastEmployee;
        setLastEmployeeCode(newCode);
        setLastEmployeeCode(newCode);
        lastemployeeCode = newCode;
        // Calculate the next Employee_Code and set it in the employeeDetails
        setEmployeeDetails((prevState) => ({
          ...prevState,
          Employee_Code: newCode, // Increment the lastEmployeeCode by 1
        }));
      })
      .catch((error) => {
        console.error("Error fetching lastEmployeeCode:", error);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation function for float values
    const isValidFloat = (input) => /^\d+(\.\d*)?$/.test(input);

    // Validate input based on the field name
    switch (name) {
      case "Basic_Salary":
        if (!/^\d+$/.test(value)) {
          console.error(
            "Invalid Basic Salary value. Please enter a valid integer."
          );
          // Clear the field when an invalid value is entered
          setEmployeeDetails({
            ...employeeDetails,
            [name]: "",
          });
          return;
        }
        break;

      case "Rate_Per_Hour":
        if (!isValidFloat(value)) {
          console.error(
            "Invalid Rate Per Hour value. Please enter a valid float."
          );

          setEmployeeDetails({
            ...employeeDetails,
            [name]: "",
          });
          return;
        }
        break;

      default:
        break;
    }

    // Update state if validation passes
    setEmployeeDetails({
      ...employeeDetails,
      [name]: value,
    });
  };

  const handleFromTimeChange = (time) => {
    console.log("time is", time);
    setFromTime(time);
  };

  const handleToTimeChange = (time) => {
    setToTime(time);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Employee details submitted:", {
      ...employeeDetails,
      From_Time: fromTime
        ? fromTime.toLocaleTimeString("en-US", { hour12: false })
        : null,
      To_Time: toTime ? toTime.toLocaleTimeString() : null,
    });
  };

  function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;

    return `${year}-${month}-${day}`;
  }

  const location = useLocation();
  const editRecordData = location.state && location.state.editRecordData;

  console.log("editRecordData", editRecordData);

  useEffect(() => {
    if (editRecordData) {
      setEmployeeDetails({
        ...editRecordData,
      });
      setFromTime(
        editRecordData.From_Time
          ? new Date(`2024-01-01 ${editRecordData.From_Time}`)
          : null
      );
      setToTime(
        editRecordData.To_Time
          ? new Date(`2024-01-01 ${editRecordData.To_Time}`)
          : null
      );
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

  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [records, setRecords] = useState([]);

  const fetchFirstRecord = () => {
    axios
      .get(`${apiURL}/api/employees/getfirstnavigationemployee`)
      .then((response) => {
        const firstRecord = response.data.firstUserCreation;
        setEmployeeDetails(firstRecord);
        setRecords([firstRecord]);
        setFromTime([firstRecord].From_Time);
        setCurrentRecordIndex(0);
        setFromTime(
          firstRecord.From_Time
            ? new Date(`2024-01-01 ${firstRecord.From_Time}`)
            : null
        );
        setToTime(
          firstRecord.To_Time
            ? new Date(`2024-01-01 ${firstRecord.To_Time}`)
            : null
        );
      });
  };

  const fetchLastRecord = () => {
    axios
      .get(`${apiURL}/api/employees/getlastnavigationemployee`)
      .then((response) => {
        const lastRecord = response.data.lastUserCreation;
        setEmployeeDetails(lastRecord);
        setRecords([lastRecord]);
        setCurrentRecordIndex(0);
        setFromTime(
          lastRecord.From_Time
            ? new Date(`2024-01-01 ${lastRecord.From_Time}`)
            : null
        );
        setToTime(
          lastRecord.To_Time
            ? new Date(`2024-01-01 ${lastRecord.To_Time}`)
            : null
        );
      });
  };

  const fetchPreviousRecord = async () => {
    // const currentEmployeeCode = records[currentRecordIndex].employeeCode;
    const response = await axios.get(
      `${apiURL}/api/employees/getpreviousnavigationemployee/${employeeDetails.Employee_Code}`
    );

    if (response.data.previousUserCreation) {
      const previousRecord = response.data.previousUserCreation;
      setEmployeeDetails(previousRecord);
      setCurrentRecordIndex(currentRecordIndex - 1);
      setFromTime(
        previousRecord.From_Time
          ? new Date(`2024-01-01 ${previousRecord.From_Time}`)
          : null
      );
      setToTime(
        previousRecord.To_Time
          ? new Date(`2024-01-01 ${previousRecord.To_Time}`)
          : null
      );
    } else {
      console.log("No previous record available.");
    }
  };

  const fetchNextRecord = async () => {
    // const currentEmployeeCode = records[currentRecordIndex].employeeCode;
    const response = await axios.get(
      `${apiURL}/api/employees/getnextnavigationemployee/${employeeDetails.Employee_Code}`
    );

    if (response.data.nextUserCreation) {
      const nextRecord = response.data.nextUserCreation;
      setEmployeeDetails(nextRecord);
      setCurrentRecordIndex(currentRecordIndex + 1);
      setFromTime(
        nextRecord.From_Time
          ? new Date(`2024-01-01 ${nextRecord.From_Time}`)
          : null
      );
      setToTime(
        nextRecord.To_Time ? new Date(`2024-01-01 ${nextRecord.To_Time}`) : null
      );
    } else {
      console.log("No next record available.");
    }
  };

  const handleFirst = () => {
    fetchFirstRecord();
  };

  const handleLast = () => {
    fetchLastRecord();
  };

  const handlePrevious = () => {
    fetchPreviousRecord();
  };

  const handleNext = () => {
    fetchNextRecord();
  };

  return (
    <>
      <div>
        <h3 className="mt-4 mb-4 text-center custom-heading">
          Employee Master Detail
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


          <div style={{ display:"flex", justifyContent: "space-between", marginLeft: "100px" }}>

          <button
            onClick={handleFirst}
            style={{
              backgroundColor: "blue",
              color: "white",
              border: "1px solid #ccc",
              cursor: "pointer",
              width: "200px",
              height: "35px",
              fontSize: "12px",
             
              
            }}
          >
            &lt;&lt; 
          </button>
          <button
            onClick={handlePrevious}
            style={{
              backgroundColor: "blue",
              color: "white",
              border: "1px solid #ccc",
              cursor: "pointer",
              width: "100%",
              height: "35px",
              fontSize: "12px",
              marginLeft:"5px"
            }}
          >
            &lt; 
          </button>
          <button
            onClick={handleNext}
            style={{
              backgroundColor: "blue",
              color: "white",
              border: "1px solid #ccc",
              cursor: "pointer",
              width: "100%",
              height: "35px",
              fontSize: "12px",
              marginLeft:"5px"
            }}
          >
             &gt;
          </button>
          <button
            onClick={handleLast}
            style={{
              backgroundColor: "blue",
              color: "white",
              border: "1px solid #ccc",
              cursor: "pointer",
              width: "100%",
              height: "35px",
              fontSize: "12px",
              marginLeft:"5px"
            }}
          >
            &gt;&gt; 
          </button>
          </div>




        </div>
      </div>
      <br></br>
      <br></br>
      <br></br>

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
                  name="Employee_Code"
                  value={employeeDetails.Employee_Code}
                  onChange={handleInputChange}
                  autoComplete="off"
                  readOnly
                  disabled={true}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2">Employee Name:</label>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  name="Employee_Name"
                  value={employeeDetails.Employee_Name}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2">Basic Salary:</label>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  name="Basic_Salary"
                  value={employeeDetails.Basic_Salary}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2">Rate Per Hour:</label>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  name="Rate_Per_Hour"
                  value={employeeDetails.Rate_Per_Hour}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2">From Time:</label>
              <div className="col-md-6">
                <DatePicker
                  selected={fromTime}
                  onChange={handleFromTimeChange}
                  showTimeSelect
                  showTimeSelectOnly
                  // timeIntervals={15}
                  dateFormat="h:mm aa"
                  placeholderText="Select from time"
                  className="form-control"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2">To Time:</label>
              <div className="col-md-6">
                <DatePicker
                  selected={toTime}
                  onChange={handleToTimeChange}
                  showTimeSelect
                  showTimeSelectOnly
                  // timeIntervals={15}
                  dateFormat="h:mm aa"
                  placeholderText="Select to time"
                  className="form-control"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2">Date of Joining:</label>
              <div className="col-md-4">
                <input
                  type="date"
                  className="form-control"
                  name="Date_Of_Joining"
                  value={employeeDetails.Date_Of_Joining}
                  onChange={handleInputChange}
                  autoComplete="off"
                  format="DD-MM-YYYY"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2">Resigned:</label>
              <div className="col-md-4">
                <select
                  className="form-select"
                  name="Resigned"
                  value={employeeDetails.Resigned}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={!isEditing}
                >
                  <option value="N">No</option>
                  <option value="Y">Yes</option>
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

export default EmployeeMasterComponent;
