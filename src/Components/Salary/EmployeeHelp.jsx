import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import DataTableSearch from "../../common/DataTableSearch";
import DataTablePagination from "../../common/DataTablePagination";
import axios from "axios";
import "../../App.css";

var lActiveInputFeild = "";

const ApiDataTableModal = ({ onAcCodeClick, name, millData,userIdNew,newSetEmployeeName,isCancelButtonClickeded}) => {
  const apiURL = process.env.REACT_APP_API_URL;
  const [showModal, setShowModal] = useState(false);
  const [popupContent, setPopupContent] = useState([]);
  const [enteredAcCode, setEnteredAcCode] = useState("");
  const [enteredAcName, setEnteredAcName] = useState("");
  const [enteredAccoid, setEnteredAccoid] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [apiDataFetched, setApiDataFetched] = useState(false);
  const itemsPerPage = 10;

  // Fetch data based on API
  const fetchAndOpenPopup = async () => {
    try {
      const response = await axios.get(`${apiURL}/api/employees/`);
      const data = response.data;
      setPopupContent(data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // await fetchAndOpenPopup();
        setApiDataFetched(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (!apiDataFetched) {
      fetchData();
    }
  }, [apiDataFetched]);

  // Handle Mill Code button click
  const handleMillCodeButtonClick = () => {
    lActiveInputFeild = name;
    fetchAndOpenPopup();
  };

  //popup functionality show and hide
  const handleCloseModal = () => {
    setShowModal(false);
  };





  const handleAcCodeChange = async (event, item) => {
    const { value } = event.target;
    setEnteredAcCode(value);
  
    // Check if the active input field is mill code input
    if (lActiveInputFeild === name) {
      // Update enteredAcName based on the input field value
      setEnteredAcName(value);
    }
  
    try {
      const response = await axios.get(`http://localhost:5000/api/employees/`);
      const data = response.data;
      setPopupContent(data);
      setApiDataFetched(true);
  
      const matchingItem = data.find(
        (item) => item.Employee_Code === parseInt(value, 10)
      );
  
      if (matchingItem) {
        setEnteredAcName(matchingItem.Employee_Name);
        if (onAcCodeClick) {
          onAcCodeClick(
            matchingItem.Employee_Code,
            matchingItem.Employee_Name,
            matchingItem.Rate_Per_Hour,
            matchingItem.Basic_Salary
          );
        }
      } else {
        setEnteredAcName("");
        setEnteredAccoid("");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  


  //After open popup onDoubleClick event that record display on the fields
const handleRecordDoubleClick = (item) => {
  if (lActiveInputFeild === name) {
    setEnteredAcCode(item.Employee_Code);
    setEnteredAcName(item.Employee_Name);
    if (onAcCodeClick) {
      onAcCodeClick(item.Employee_Code, item.Employee_Name, item.Rate_Per_Hour, item.Basic_Salary);
    }
  }
  setShowModal(false);
};





  //handle pagination number
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  //handle search functionality
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue.toLowerCase());
  };

  const filteredData = popupContent.filter((item) =>
    item.Employee_Name.toLowerCase().includes(searchTerm)
  );

  // Get unique items based on Employee_Code
  const uniqueItemsToDisplay = Array.from(
    new Set(filteredData.map((item) => item.Employee_Code))
  ).map((code) => {
    const matchingItem = filteredData.find(
      (item) => item.Employee_Code === code
    );
    return {
      Employee_Code: matchingItem.Employee_Code,
      Employee_Name: matchingItem.Employee_Name,
      Basic_Salary: matchingItem.Basic_Salary,
      Rate_Per_Hour: matchingItem.Rate_Per_Hour,
      Date_Of_Joining: matchingItem.Date_Of_Joining,
      Resigned: matchingItem.Resigned,
    };
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = uniqueItemsToDisplay.slice(startIndex, endIndex);

  // Handle key events
useEffect(() => {
  const handleKeyEvents = async (event) => {
    if (event.key === "F1") {
      if (event.target.id === name) {
        lActiveInputFeild = name;
        fetchAndOpenPopup();
        event.preventDefault(); // Prevent the default action
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedRowIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedRowIndex((prev) =>
        Math.min(prev + 1, itemsToDisplay.length - 1)
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      // Check if a row is selected
     
      if (selectedRowIndex >= 0) {
        handleRecordDoubleClick(itemsToDisplay[selectedRowIndex]);
    
      }
      
    }
  };

  window.addEventListener("keydown", handleKeyEvents);

  return () => {
    window.removeEventListener("keydown", handleKeyEvents);
  };
}, [
  selectedRowIndex,
  itemsToDisplay,
  name,
  fetchAndOpenPopup,
  handleRecordDoubleClick,
]);


  return (
    <div className="d-flex flex-row ">
      <div className="d-flex ">
        <div className="d-flex">
          <label>UserID:</label>
          <input
            type="text"
            className="form-control ms-2"
            id={name}
            autoComplete="off"
            value={enteredAcCode || millData || userIdNew}
            onChange={handleAcCodeChange}
            disabled={isCancelButtonClickeded}
        
            style={{ width: "100px", height: "35px" }}
          />
          <Button
            variant="primary"
            onClick={handleMillCodeButtonClick}
            className="ms-1"
            style={{ width: "30px", height: "35px" }}
            disabled={isCancelButtonClickeded}
          >
            ...
          </Button>
          <label id="acNameLabel" className=" form-labels ms-2">
            {enteredAcName || newSetEmployeeName}
          </label>
        </div>
      </div>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        dialogClassName="modal-dialog modal-fullscreen"
      >
        <Modal.Header closeButton>
          <Modal.Title>Popup</Modal.Title>
        </Modal.Header>
        <DataTableSearch data={popupContent} onSearch={handleSearch} />
        <Modal.Body>
          {Array.isArray(popupContent) ? (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee_Code</th>
                    <th>Employee_Name</th>
                    <th>Basic_Salary</th>
                    <th>Rate_Per_Hour</th>
                    <th>Date_Of_Joining</th>
                    <th>Resigned</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsToDisplay.map((item, index) => (
                    <tr
                      key={index}
                      className={
                        selectedRowIndex === index ? "selected-row" : ""
                      }
                      onDoubleClick={() => handleRecordDoubleClick(item)}
                    >
                      <td>{item.Employee_Code}</td>
                      <td>{item.Employee_Name}</td>
                      <td>{item.Basic_Salary}</td>
                      <td>{item.Rate_Per_Hour}</td>
                      <td>{item.Date_Of_Joining}</td>
                      <td>{item.Resigned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            "Loading..."
          )}
        </Modal.Body>
        <Modal.Footer>
          <DataTablePagination
            totalItems={uniqueItemsToDisplay.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ApiDataTableModal;
