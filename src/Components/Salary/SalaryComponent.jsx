import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import EmployeeHelp from "./EmployeeHelp";
import "../../App.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import { BsFillPrinterFill } from "react-icons/bs";

//Global variables
var lastRecordDate = "";
var lastSalaryNoCancel = "";
var newNetRatePerHour = "";
var newBasicSalry = "";
var newDataBasicSalry = "";
var DaysInMonthNew = "";
var newSetSelectedUserId = "";
var newSetEmployeeName = "";
var newSalaryDate = "";
var hourlyRate = "";
var Ratecalculate = ""
var Ratecalculated = ""
var EmpHours = ""
var typeEmpoyeeHours = ""


const SalaryComponent = () => {
  //Button Enabled and Disabled Functionality state
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
  const userIdInputRef = useRef(null);

  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSalaryDate, setselectedSalaryDate] = useState(new Date());
  const [filteredData, setFilteredData] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isNewSalaryGenerated, setIsNewSalaryGenerated] = useState(false);
  const [EmployeeHelpEnabled, setEmployeeHelpEnabled] = useState(false);
  const [disabledFields, setDisabledFields] = useState(false);
  const [lastRecord, setLastRecord] = useState([]);
  const [isCancelButtonClicked, setIsCancelButtonClicked] = useState(false);

  const [isaddButtonClicked, setIsAddButtonClicked] = useState(false);



  //handle AddOne button functionality
  const handleAddOne = () => {
  
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setIsEditMode(false);

    setFilteredData([]);
    // Reset totalMonthlySalary and totalHours
    setTotalMonthlySalary("0.00");
    setTotalHours("0.00");
    setTotalSundayDeduction("0.00");
    lastSalaryNoCancel = "";
    fetchLastSalaryNo();
    setIsAddButtonClicked(true)
    newSetSelectedUserId = "";
    newSetEmployeeName = "";
  
    window.location.href = window.location.href;

    // Focus on the dropdown if it exists
    if (userIdInputRef.current) {
      userIdInputRef.current.focus();
    }
  };

  

 
  //handle Edit button functionality
  const handleEdit = () => {
    setIsEditMode(true);
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setBackButtonEnabled(true);
    setDisabledFields(false);

    if (resaleMillDropdownRef.current) {
      resaleMillDropdownRef.current.focus();
    }
  };

  //handle handleSaveOrUpdate button functionality
  const handleSaveOrUpdate = () => {
    if (isEditMode) {
      saveDataToConsole();
      setIsEditMode(false);
      setAddOneButtonEnabled(true);
      setEditButtonEnabled(true);
      setDeleteButtonEnabled(true);
      setBackButtonEnabled(true);
      setSaveButtonEnabled(false);
      setCancelButtonEnabled(false);
      setUpdateButtonClicked(true);
      setDisabledFields(false);
      window.alert("Data update successfully!");
      setDisabledFields(true);
      window.location.reload();
    } else {
      saveDataToConsole();
      saveDataToDatabase();
      newSetSelectedUserId = "";
      newSetEmployeeName = "";
      setIsNewSalaryGenerated(true);
      setAddOneButtonEnabled(true);
      window.alert("Data saved successfully!");
       window.location.reload();
    }
  };
  const handleBack = () => {
    navigate("/salary_genarate_utility");
  };

  //handle Delete button functionality
  const handleDelete = () => {
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
  };

  //FetchLastRecord this Function  call on cancel button is click and show last record on table.
  const fetchLastRecord = async () => {

    try {
      const response = await axios.get(
        `http://localhost:5000/api/employees/getlastrecord?salaryNo=${lastSalaryNoCancel}`
      );

      if (response.status === 200) {
        const lastRecordData = response.data.lastRecord;
        newSetSelectedUserId = lastRecordData[0].userId;
        newSetEmployeeName = lastRecordData[0].Employee_name;
        // console.log("lastRecordData", newSetEmployeeName);
        // console.log("lastRecordData", lastRecordData[0].salaryDate);
        DaysInMonthNew = lastRecordData[0].daysInMonth;
        newNetRatePerHour = lastRecordData[0].netRatePerHour;
        newBasicSalry = lastRecordData[0].Basic_salary;
        newSalaryDate = lastRecordData[0].salaryDate;

        EmpHours = lastRecordData[0].EmployeeHours;

        // Update the salary details state
        setSalaryDetails({
          salaryNo: lastRecordData[0].salary_no,
          daysInMonth: DaysInMonthNew,
        });

        // Update other relevant state variables based on the first record in lastRecordData
        setTotalHours(lastRecordData[0].totalMonthyHours);
        setNetRate(lastRecordData[0].netRatePerHour);
        hourlyRate = lastRecordData[0].netRatePerHour;
        console.log("fetch Record hourly rate",hourlyRate)
        setTotalMonthlySalary(lastRecordData[0].totalMonthlySalary);
        setTotalSundayDeduction(lastRecordData[0].totalMonthlyDeduction);

        // Parse the date string into a JavaScript Date object
        const dateParts = lastRecordData[0].date.split("-");
        const parsedDate = new Date(
          parseInt(dateParts[2], 10),
          parseInt(dateParts[1], 10) - 1,
          parseInt(dateParts[0], 10)
        );

        setSelectedDate(parsedDate);

        // Update the filteredData state
        const allDatesData = getDatesInMonth(
          parsedDate.getFullYear(),
          parsedDate.getMonth() + 1
        ).map((date) => {
          const dateString = formatDate(date);

          const matchingRecord = lastRecordData.find(
            (record) => record.date === dateString
          );

          if (matchingRecord) {
            // Extract common properties
            const commonProperties = {
              date,
              day: matchingRecord.day,
              deduction: matchingRecord.totalDeduction,
              userId: matchingRecord.userId,
              Employee_name: matchingRecord.Employee_name,
              netRatePerHour: matchingRecord.netRatePerHour,
              perDaySalary: matchingRecord.perDaySalary,
              totalMonthlySalary: matchingRecord.totalMonthlySalary,
              totalHours: matchingRecord.totalHours,
              newBasicSalry: matchingRecord.Basic_salary,
              id: matchingRecord.id,
              salaryDate: matchingRecord.salaryDate,
            };

            // Handle log and out times
            const logTimes = [
              matchingRecord.logTime1,
              matchingRecord.logTime2,
              matchingRecord.logTime3,
            ];
            const outTimes = [
              matchingRecord.outTime1,
              matchingRecord.outTime2,
              matchingRecord.outTime3,
            ];
            const formattedLogTimes = logTimes.map((time) =>
              time
                ? new Date(
                    `${matchingRecord.date
                      .split("-")
                      .reverse()
                      .join("-")}T${time}`
                  )
                : null
            );

            const formattedOutTimes = outTimes.map((time) =>
              time
                ? new Date(
                    `${matchingRecord.date
                      .split("-")
                      .reverse()
                      .join("-")}T${time}`
                  )
                : null
            );

            return {
              ...commonProperties,
              logTimes: formattedLogTimes,
              outTimes: formattedOutTimes,
            };
          } else {
            return {
              id: null,
              date,
              day: null,
              totalHours: null,
              deduction: null,
              userId: null,
              Employee_name: null,
              logTimes: [null, null, null],
              outTimes: [null, null, null],
              netRatePerHour: null,
              perDaySalary: null,
              totalMonthlySalary: null,
              newBasicSalry: null,
              salaryDate: null,
            };
          }
        });

        if (!isEditMode) {
          setTotalMonthlySalary(lastRecordData[0].totalMonthlySalary);
        }

        setFilteredData(allDatesData);
      } else {
        console.error(
          "Failed to fetch the last record. Server responded with:",
          response.status,
          response.data
        );
      }
    } catch (error) {
      console.error(
        "An error occurred while fetching the last record:",
        error.message
      );
    }
  };

  //handle cancel button functionality
  const handleCancel = () => {
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setDisabledFields(true);
    setIsCancelButtonClicked(true);
    setEmployeeHelpEnabled(false);
    fetchLastRecord();
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

  //functionality of all feilds in Head section
  const handleDateChange = (e) => {
    const { value } = e.target;
    const date = new Date(value);
    setSelectedDate(date);

    // Reset totalMonthlySalary and totalHours
    setTotalMonthlySalary("0.00");
    setTotalHours("0.00");
    setTotalSundayDeduction("0.00");

    fetchData(date);
  };

  const handleSalaryDate = (e) => {
    const { value } = e.target;
    const date = new Date(value);
    setselectedSalaryDate(date);
  };

  //manage the Head section feilds state
  const [salaryDetails, setSalaryDetails] = useState({
    salaryNo: "",
    salaryDate: getCurrentDate(),
    fromDate: getCurrentDate(),
    toDate: getCurrentDate(),
    daysInMonth: "",
  });

  //Genrate PDF logic to genrate the salry PDF on Genrate PDF button.
  const generatePdf = async () => {
    debugger;
    try {
      const apiResponse = await axios.get(
        `http://localhost:5000/api/employees/getlastrecord?salaryNo=${lastSalaryNoCancel}`
      );
      const apiData = apiResponse.data.lastRecord;
      // console.log(apiData);
      const pdf = new jsPDF({
        orientation: "landscape",
      });

      // Add company name, employee code, and employee name
      pdf.text(`Salary No: ${salaryDetails.salaryNo}`, 20, 10);
      pdf.text(
        "Company Name: Choice Centre in Mahadwar Road, Kolhapur.",
        20,
        20
      );
      pdf.text(
        `Employee Code: ${
          isCancelButtonClicked ? newSetSelectedUserId : selectedUserId
        }`,
        20,
        30
      );
      pdf.text(
        `Employee Name: ${
          isCancelButtonClicked ? newSetEmployeeName : selectedEmployeeName
        }`,
        20,
        40
      );
  
    
      pdf.text(
        `Slary Date: ${formatDate(selectedSalaryDate)}`,
        pdf.internal.pageSize.width - 80,
        10
      );
      pdf.text(
        `Days In Month: ${
          isCancelButtonClicked ? DaysInMonthNew : salaryDetails.daysInMonth
        }`,
        pdf.internal.pageSize.width - 80,
        20
      );

      // Add data from the API to the PDF
      Object.keys(apiData).forEach((key, index) => {
        const entry = apiData[key];
      });
      // Add table headers
      const headers = [
        "Day",
        "Date",
        "Total Hours",
        "Net Rate per Hour",
        "Per Day Salary (Rs)",
        "Deduction",
        ...Array.from({ length: maxLogTimes }, (_, idx) => [
          `In Time ${idx + 1}`,
          `Out Time ${idx + 1}`,
        ]).flat(),
      ];

      // Add data to the table
      const data = filteredData.map((entry) => [
        // ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][entry.date.getDay()]
        entry.day,

        formatDate(entry.date),
        entry.totalHours,
        entry.netRatePerHour,
        entry.perDaySalary,
        entry.deduction ? { content: entry.deduction, styles: { textColor: [255, 0, 0] } } : "0.00",

        ...entry.logTimes
          .map((logTime, idx) => [
            formatTime(logTime),
            formatTime(entry.outTimes[idx]),
          ])
          .flat(),
      ]);

      // console.log(data);
      // Add the table to the PDF
      pdf.autoTable({
        startY: 50,
        head: [headers],
        body: data,
      });

      // Add total hours and total monthly salary
      pdf.text(
        `Total monthly Hours: ${totalHours}`,
        20,
        pdf.internal.pageSize.height - 40
      );
      pdf.text(
        `Total Deduction on month: ${totalSundayDeduction}`,
        20,
        pdf.internal.pageSize.height - 30
      );
      pdf.text(
        `Total Monthly Salary (Rs): ${totalMonthlySalary}`,
        20,
        pdf.internal.pageSize.height - 20
      );

      // Save the PDF
      pdf.save(`salary_details_${selectedEmployeeName}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };



  //After slect the salary Date and UserId we have to show that particular month data
  const fetchData = async (selectedDate) => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    

    if (selectedUserId) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/data/getTableData/${year}/${month}?UserId=${selectedUserId}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            processAndDisplayData(data);
          }
        } else {
          console.error("Failed to fetch data from the API.");
        }
      } catch (error) {
        console.error("An error occurred while fetching data:", error);
      }
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, selectedUserId]);

  //we are getting the data from the api and process it in well format.
  const processAndDisplayData = (data) => {
    const selectedMonth = selectedDate.getMonth() + 1;
    const selectedYear = selectedDate.getFullYear();

    // Filter data by the selected user ID and selected month
    data = data.filter((entry) => {
      const entryDate = new Date(entry.LogDate);
      const entryMonth = entryDate.getMonth() + 1;
      const entryYear = entryDate.getFullYear();
      return entryMonth === selectedMonth && entryYear === selectedYear;
    });

    // Create a map to group data by date
    const dateMap = new Map();

    data.forEach((entry) => {
      const entryDate = new Date(entry.LogDate);
      const entryKey = entryDate.toDateString();

      if (!dateMap.has(entryKey)) {
        dateMap.set(entryKey, {
          date: entryDate,
          logTimes: [],
          outTimes: [],
        });
      }

      const dateEntry = dateMap.get(entryKey);

      if (dateEntry.logTimes.length === dateEntry.outTimes.length) {
        dateEntry.logTimes.push(entry.LogDate);
      } else {
        dateEntry.outTimes.push(entry.LogDate);
      }
    });

    // Create an array of entries for all dates in the selected month
    const filteredDataArray = datesInMonth.map((date) => ({
      date,
      logTimes: [],
      outTimes: [],
    }));

    // Update the array with the available data
    dateMap.forEach((entry, key) => {
      const dateIndex = datesInMonth.findIndex(
        (date) => date.toDateString() === key
      );
      if (dateIndex !== -1) {
        filteredDataArray[dateIndex] = entry;
      }
    });

    // Ensure logTimes and outTimes are ordered sequentially
    filteredDataArray.forEach((entry) => {
      entry.logTimes.sort((a, b) => new Date(a) - new Date(b));
      entry.outTimes.sort((a, b) => new Date(a) - new Date(b));
    });

    setFilteredData(filteredDataArray);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSalaryDetails({
      ...salaryDetails,
      [name]: value,
    });
  };

  //This function we have to get the current date means today date set on the salary Date feild.
  function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${day}`;
  }

  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [selectedRatePerHour, setSelectedRatePerHour] = useState(0);
  const [EmployeeHours, setEmployeeHours] = useState(0);
  const [selectBasicSalary, setSelectBasicSalary] = useState("");

  //In this function we have to get the data from Employee Help such as the userId,Employee_name,rateperhour
  const handleEmployeeCode = (code, name, ratePerHour, Basic_Salary) => {
    debugger;
    setSelectedUserId(code);
    setSelectedEmployeeName(name);
    setSelectedRatePerHour(ratePerHour);
    setEmployeeHours(ratePerHour)
    setSelectBasicSalary(Basic_Salary);
  };

  //In this function we have to fetch the how many days that employee present on that month.
  const getDatesInMonth = (year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const dates = [];

    for (
      let date = startDate;
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      dates.push(new Date(date));
    }

    return dates;
  };

  //In this code after clcik the particular time we haev to edit that time
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editColumnIndex, setEditColumnIndex] = useState(null);
  const [editTime, setEditTime] = useState("");

  const openEditModal = (rowIndex, columnIndex, initialValue) => {
    if (filteredData && filteredData[rowIndex]) {
      const updatedLogData = [...filteredData];
      if (!updatedLogData[rowIndex].logTimes) {
        updatedLogData[rowIndex].logTimes = [];
      }
      if (columnIndex >= 0) {
        setEditRowIndex(rowIndex);
        setEditColumnIndex(columnIndex);
        setEditTime(new Date(initialValue));
        setEditModalOpen(true);
      }
    }
  };

  const saveEdit = () => {
    if (editRowIndex !== null && editColumnIndex !== null) {
      const updatedLogData = [...filteredData];
      if (!updatedLogData[editRowIndex].logTimes) {
        updatedLogData[editRowIndex].logTimes = [];
      }
      if (editColumnIndex % 2 === 0) {
        updatedLogData[editRowIndex].logTimes[Math.floor(editColumnIndex / 2)] =
          editTime;
      } else {
        updatedLogData[editRowIndex].outTimes[
          Math.floor((editColumnIndex - 1) / 2)
        ] = editTime;
      }
      setFilteredData(updatedLogData);
      setEditModalOpen(false);
      setEditTime("");
    }
  };

  const datesInMonth = getDatesInMonth(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1
  );

  // Modify the formatDate function
  const formatDate = (date) => {
    try {
      // Check if date is already a Date object
      const parsedDate = date instanceof Date ? date : new Date(date);

      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format");
      }

      // Implement your date formatting logic
      const day = parsedDate.getDate().toString().padStart(2, "0");
      const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
      const year = parsedDate.getFullYear();

      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Modify the formatTime function
  const formatTime = (timeString) => {
    if (timeString) {
      const options = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      return new Date(timeString).toLocaleTimeString(undefined, options);
    } else {
      return isCancelButtonClicked ? "" : "NA";
    }
  };

  const [totalHours, setTotalHours] = useState(0);
  const [totalRate, setNetRate] = useState(0);
  const [totalSundayDeduction, setTotalSundayDeduction] = useState(0);
  const [perDaySalaries, setPerDaySalaries] = useState([]); 
 

  const fixedRatePerHour = isEditMode ? newNetRatePerHour : selectedRatePerHour;
  const [totalMonthlySalary, setTotalMonthlySalary] = useState(0);
  
 
  const calculateTotal = () => {
  
    let totalHours = 0;
    let totalRate = 0;
    let totalSundayDeduction = 0;
    const dailySalaries = [];

    filteredData.forEach((entry) => {
      const hours = calculateTotalHours(entry.logTimes, entry.outTimes);
      console.log("total all array hours",hours)
      const integerPart = parseInt(hours);
      const decimalPart = parseFloat((hours - integerPart).toFixed(2));

   
      const typeSalary = isEditMode ? newBasicSalry:selectBasicSalary
      const RatePerHours = typeSalary /salaryDetails.daysInMonth 

      typeEmpoyeeHours = isEditMode ? EmpHours:fixedRatePerHour
  
      Ratecalculated = (RatePerHours/typeEmpoyeeHours)
      Ratecalculate = Math.round(Ratecalculated * 100) / 100;


      hourlyRate = Ratecalculate;
  
      // Calculate salary for the day
      const perDaySalary = (
        integerPart * hourlyRate +
        ((decimalPart * hourlyRate) / 60) * 100
      ).toFixed(2);

      dailySalaries.push(Math.round(perDaySalary));
      totalHours += hours;
      totalRate += hourlyRate;

      console.log('totalRate',totalRate)
      // Check if the day is Sunday and there are no logTimes and outTimes
      if (entry.date.getDay() === 0 && hours === 0) {
      
        const denominator = salaryDetails.daysInMonth;
        const newDataBasicSalry = isEditMode
          ? newBasicSalry
          : selectBasicSalary;
        if (denominator !== 0) { 
          
          const sundayDeduction = (hourlyRate * typeEmpoyeeHours) * 2;
          console.log('sundayDeduction',sundayDeduction)
          totalSundayDeduction += sundayDeduction;
        } else {
          console.error(
            "Denominator is zero, cannot calculate Sunday deduction"
          );
        }
      }
    });

    setTotalHours(totalHours.toFixed(2));
    setNetRate(totalRate.toFixed(2));
    setPerDaySalaries(dailySalaries);
    
    setTotalSundayDeduction(totalSundayDeduction.toFixed(2));

    // Calculate total monthly salary, deducting Sunday salary
    const totalSalary = dailySalaries.reduce(
      (acc, salary) => acc + parseFloat(salary),
      0
    );
    setTotalMonthlySalary(totalSalary);
  };

  //In this function we haev to calculate the differnece between the in time and out time
  const calculateTotalHours = (logTimes, outTimes) => {
    let totalMinutes = 0;

    for (let i = 0; i < logTimes.length; i++) {
      const logTime = new Date(logTimes[i]);
      const outTime = new Date(outTimes[i]);
      const diffMilliseconds = outTime - logTime;
      const minutes = Math.floor(diffMilliseconds / (1000 * 60));
      totalMinutes += minutes;
    }

    // Calculate total hours and remaining minutes
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    // Format the result as "hours.minutes"
    const formattedTotalHours = totalHours + remainingMinutes / 100;

    return formattedTotalHours;
  };

  // const calculateDaysInMonth = async () => {
  //   const year = selectedDate.getFullYear();
  //   const month = selectedDate.getMonth() + 1;
  //   if (selectedUserId) {
  //     try {
  //       const response = await fetch(
  //         `http://localhost:5000/api/data/getTableData/${year}/${month}?UserId=${selectedUserId}`
  //       );
  //       if (response.ok) {
  //         const data = await response.json();
  //         const uniqueDays = new Set();

  //         data.forEach((entry) => {
  //           const entryDate = new Date(entry.LogDate);
  //           const entryDay = entryDate.getDate();
  //           uniqueDays.add(entryDay);
  //         });

  //         return uniqueDays.size;
  //       } else {
  //         console.error("Failed to fetch data from the API.");
  //       }
  //     } catch (error) {
  //       console.error("An error occurred while fetching data:", error);
  //     }
  //   }

  //   return 0;
  // };

  // useEffect(() => {
  //   calculateDaysInMonth().then((days) => {
  //     setSalaryDetails((prevDetails) => ({
  //       ...prevDetails,
  //       daysInMonth: days,
  //     }));
  //   });
  //   fetchData(selectedDate);
  // }, [selectedDate, selectedUserId]);

  //save button click save data on console
  const saveDataToDatabase = async (jsonData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/employees/insertjsondata",
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
      } else {
        console.error(
          "Failed to save data to the database. Server responded with:",
          response.status,
          response.data
        );
      }
    } catch (error) {
      console.error(
        "An error occurred while saving data to the database:",
        error
      );
    }
  };

  //In this function we have to save the data on database
  const saveDataToConsole = () => {
    const jsonData = filteredData.map((entry, index) => {
      return {
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          entry.date.getDay()
        ],
        date: formatDate(entry.date),
        totalHours: parseFloat(
          calculateTotalHours(entry.logTimes, entry.outTimes).toFixed(2)
        ),
        netRatePerHour: parseFloat(hourlyRate),
        perDaySalary: perDaySalaries[index],
        userId: isCancelButtonClicked ? salaryDetails.userId : selectedUserId,
        ...generateLogTimeAndOutTimeObjects(entry.logTimes, entry.outTimes),
        totalMonthlySalary: parseFloat(totalMonthlySalary),
        totalMonthyHours: parseFloat(totalHours),
        totalMonthlyDeduction: parseFloat(totalSundayDeduction),
        daysInMonth: isCancelButtonClicked
          ? DaysInMonthNew
          : salaryDetails.daysInMonth,
        salaryNo: salaryDetails.salaryNo,
        salaryDate: formatDate(selectedSalaryDate),
        Employee_name: isCancelButtonClicked
          ? salaryDetails.Employee_name
          : selectedEmployeeName,
        Basic_salary: isCancelButtonClicked
          ? salaryDetails.Basic_Salary
          : selectBasicSalary,
        id: entry.id,
        EmployeeHours:isEditMode ? entry.EmployeeHours : EmployeeHours,
        totalDeduction: isCancelButtonClicked
          ? entry.deduction
          : entry.date.getDay() === 0 &&
            calculateTotalHours(entry.logTimes, entry.outTimes) === 0
          ? `-${parseFloat((hourlyRate * fixedRatePerHour) * 2).toFixed(2)}`
          : 0,
      };
    });

    if (isEditMode) {
      updateDataInDatabase(jsonData);
    } else {
      saveDataToDatabase(jsonData);
    }
  };

  // Helper function to generate logTime and outTime objects dynamically
  const generateLogTimeAndOutTimeObjects = (logTimes, outTimes) => {
    const logTimeObjects = logTimes.map((logTime, i) => ({
      [`logTime${i + 1}`]: logTime ? formatTime(logTime) : null,
    }));

    const outTimeObjects = outTimes.map((outTime, i) => ({
      [`outTime${i + 1}`]: outTime ? formatTime(outTime) : null,
    }));

    return Object.assign({}, ...logTimeObjects, ...outTimeObjects);
  };

  //In this code we have to update the data from datatabse
  const updateDataInDatabase = async (jsonData) => {
  
    try {
      const response = await axios.put(
        `http://localhost:5000/api/employees/updatesalary?salary_no=${salaryDetails.salaryNo}`,
        { updateData: jsonData },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
      } else {
        console.error(
          "Failed to update data in the database. Server responded with:",
          response.status,
          response.data
        );
      }
    } catch (error) {
      console.error(
        "An error occurred while updating data in the database:",
        error
      );
    }
  };

  //In this function we have to get the last salary no from the datatabse
  const fetchLastSalaryNo = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/employees/getlastsalaryno"
      );
      if (response.status === 200) {
        const lastSalaryNo = response.data.lastRecord
          ? response.data.lastRecord.salary_no
          : 0;

        lastSalaryNoCancel = lastSalaryNo;

        setSalaryDetails({
          salaryNo: lastSalaryNo + 1,
        });
      } else {
        console.error(
          "Failed to fetch the last salary number. Server responded with:",
          response.status,
          response.data
        );
      }
    } catch (error) {
      console.error(
        "An error occurred while fetching the last salary number:",
        error.message
      );
    }
  };

  //In this function we have to display the all in time and out times in the table
  const maxLogTimes = Math.max(
    ...filteredData.map((entry) => entry.logTimes.length)
  );

  const maxOutTimes = Math.max(
    ...filteredData.map((entry) => entry.outTimes.length)
  );

  //Below functionality is the in utility page double click the particular record show for the update.
  const location = useLocation();
  const editRecordData = location.state && location.state.editRecordData;

  // console.log("editRecordData", editRecordData);
  const fetchRecordDoubleClick = async () => {
   
    try {
      const response = await axios.get(
        `http://localhost:5000/api/employees/getlastrecord?salaryNo=${lastSalaryNoCancel}`
      );
      setIsCancelButtonClicked(true);
      setIsEditMode(false);
      setAddOneButtonEnabled(true);
      setEditButtonEnabled(true);
      setDeleteButtonEnabled(true);
      setBackButtonEnabled(true);
      setSaveButtonEnabled(false);
      setCancelButtonEnabled(false);
      setDisabledFields(true);

      setIsCancelButtonClicked(true);
      if (response.status === 200) {
        const lastRecordData = response.data.lastRecord;
        newSetSelectedUserId = lastRecordData[0].userId;
        newSetEmployeeName = lastRecordData[0].Employee_name;
        // console.log("lastRecordData", newSetEmployeeName);
        // console.log("lastRecordData", lastRecordData[0].salaryDate);
        DaysInMonthNew = lastRecordData[0].daysInMonth;
        newNetRatePerHour = lastRecordData[0].netRatePerHour;
        newBasicSalry = lastRecordData[0].Basic_salary;

        newSalaryDate = lastRecordData[0].salaryDate;
        // console.log("DDDDDDDDDDDDD", newSalaryDate);

        // Update the salary details state
        setSalaryDetails({
          salaryNo: lastRecordData[0].salary_no,
          daysInMonth: DaysInMonthNew,

          // Add other properties as needed
        });

        // setSelectedUserId(lastRecordData[0].userId)
        // setSelectedEmployeeName(lastRecordData[0].Employee_name)

        // Update other relevant state variables based on the first record in lastRecordData
        setTotalHours(lastRecordData[0].totalMonthyHours);
        setNetRate(lastRecordData[0].netRatePerHour);
        setTotalMonthlySalary(lastRecordData[0].totalMonthlySalary);
        setTotalSundayDeduction(lastRecordData[0].totalMonthlyDeduction);

        // Parse the date string into a JavaScript Date object
        const dateParts = lastRecordData[0].date.split("-");
        const parsedDate = new Date(
          parseInt(dateParts[2], 10), // Year
          parseInt(dateParts[1], 10) - 1, // Month (0-indexed)
          parseInt(dateParts[0], 10) // Day
        );

        setSelectedDate(parsedDate); // Set the parsed date

        // Update the filteredData state
        const allDatesData = getDatesInMonth(
          parsedDate.getFullYear(),
          parsedDate.getMonth() + 1
        ).map((date) => {
          const dateString = formatDate(date);

          const matchingRecord = lastRecordData.find(
            (record) => record.date === dateString
          );

          if (matchingRecord) {
            // Extract common properties
            const commonProperties = {
              date,
              day: matchingRecord.day,
              deduction: matchingRecord.totalDeduction,
              userId: matchingRecord.userId,
              Employee_name: matchingRecord.Employee_name,
              netRatePerHour: matchingRecord.netRatePerHour,
              perDaySalary: matchingRecord.perDaySalary,
              totalMonthlySalary: matchingRecord.totalMonthlySalary,
              totalHours: matchingRecord.totalMonthyHours,
              newBasicSalry: matchingRecord.Basic_salary,
              id: matchingRecord.id,
              salaryDate: matchingRecord.salaryDate,
            };

            // Handle log and out times
            const logTimes = [
              matchingRecord.logTime1,
              matchingRecord.logTime2,
              matchingRecord.logTime3,
            ];
            const outTimes = [
              matchingRecord.outTime1,
              matchingRecord.outTime2,
              matchingRecord.outTime3,
            ];
            const formattedLogTimes = logTimes.map((time) =>
              time
                ? new Date(
                    `${matchingRecord.date
                      .split("-")
                      .reverse()
                      .join("-")}T${time}`
                  )
                : null
            );

            const formattedOutTimes = outTimes.map((time) =>
              time
                ? new Date(
                    `${matchingRecord.date
                      .split("-")
                      .reverse()
                      .join("-")}T${time}`
                  )
                : null
            );

            return {
              ...commonProperties,
              logTimes: formattedLogTimes,
              outTimes: formattedOutTimes,
            };
          } else {
            return {
              id: null,
              date,
              day: null,
              totalHours: null,
              deduction: null,
              userId: null,
              Employee_name: null,
              logTimes: [null, null, null],
              outTimes: [null, null, null],
              netRatePerHour: null,
              perDaySalary: null,
              totalMonthlySalary: null,
              newBasicSalry: null,
              salaryDate: null,
            };
          }
        });

        if (!isEditMode) {
          setTotalMonthlySalary(lastRecordData[0].totalMonthlySalary);
        }

        setFilteredData(allDatesData);
      } else {
        console.error(
          "Failed to fetch the last record. Server responded with:",
          response.status,
          response.data
        );
      }
    } catch (error) {
      console.error(
        "An error occurred while fetching the last record:",
        error.message
      );
    }
  };

  useEffect(() => {
    if (editRecordData) {
      setAddOneButtonEnabled(true);
      setEditButtonEnabled(true);
      setDeleteButtonEnabled(true);
      setBackButtonEnabled(true);
      setSaveButtonEnabled(false);
      setCancelButtonEnabled(false);
      setCancelButtonClicked(true);
      lastSalaryNoCancel = editRecordData.salary_no;
      fetchRecordDoubleClick();
    } else {
      fetchLastSalaryNo();
    }
  }, [editRecordData]);

  return (
    <div className="container">
      <h3 className="mt-4 mb-4 text-center custom-heading">Genrate Salary</h3>
      <div className="row mb-1">
        <div className="col-md-1 ">
          <label className="form-label">Salary Date:</label>
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            name="salaryDate"
            value={selectedSalaryDate.toISOString().slice(0, 10)}
            onChange={handleSalaryDate}
            autoComplete="off"
            disabled
          />
        </div>

        <div className="col-md-1">
          <label className="form-label">Salary No:</label>
        </div>
        <div className="col-md-1">
          <input
            type="text"
            className="form-control"
            name="salaryNo"
            value={salaryDetails.salaryNo}
            onChange={handleInputChange}
            disabled
          />
        </div>

        <div className="col-md-1">
          <label className="form-label">DaysInMonth:</label>
        </div>
        <div className="col-md-1">
          <input
            type="text"
            className="form-control"
            name="daysInMonth"
            value={
              isCancelButtonClicked ? DaysInMonthNew : salaryDetails.daysInMonth
            }
            onChange={handleInputChange}
            disabled={isCancelButtonClicked && !isaddButtonClicked }
       
          />
        </div>
        <div className="col-md-1">
          <label className="form-label">Select Date:</label>
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            value={selectedDate.toISOString().slice(0, 10)}
            onChange={handleDateChange}
            disabled={isCancelButtonClicked && !isaddButtonClicked }
          />
        </div>

        <div className="col-md-1">
          <EmployeeHelp
            name="User_Id"
            inputRef={userIdInputRef}
            value={salaryDetails.userId}
            onAcCodeClick={handleEmployeeCode}
            disabled={disabledFields}
            userIdNew={isCancelButtonClicked ? newSetSelectedUserId : ""}
            newSetEmployeeName={isCancelButtonClicked ? newSetEmployeeName : ""}
            isCancelButtonClickeded={isCancelButtonClicked && !isaddButtonClicked }
          />
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-md-12">
          <div className="container">
            <div
              style={{
                marginTop: "50px",
                marginBottom: "10px",
                display: "flex",
                gap: "10px",
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
                  width: "4%",
                  height: "35px",
                  fontSize: "12px",
                }}
              >
                Add
              </button>

              {isEditMode ? (
                <button
                  onClick={handleSaveOrUpdate}
                  onKeyDown={(event) =>
                    handleKeyDown(event, handleSaveOrUpdate)
                  }
                  style={{
                    backgroundColor: "blue",
                    color: "white",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    width: "4%",
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
                  onKeyDown={(event) =>
                    handleKeyDown(event, handleSaveOrUpdate)
                  }
                  style={{
                    backgroundColor: saveButtonEnabled ? "blue" : "white",
                    color: saveButtonEnabled ? "white" : "black",
                    border: "1px solid #ccc",
                    cursor: saveButtonEnabled ? "pointer" : "not-allowed",
                    width: "4%",
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
                  width: "4%",
                  height: "35px",
                  fontSize: "12px",
                }}
              >
                Edit
              </button>
              {/* <button
                onClick={handleDelete}
                disabled={!deleteButtonEnabled}
                style={{
                  backgroundColor: deleteButtonEnabled ? "blue" : "white",
                  color: deleteButtonEnabled ? "white" : "black",
                  border: "1px solid #ccc",
                  cursor: deleteButtonEnabled ? "pointer" : "not-allowed",
                  width: "4%",
                  height: "35px",
                  fontSize: "12px",
                }}
              >
                Delete
              </button> */}
              <button
                onClick={handleCancel}
                disabled={!cancelButtonEnabled}
                onKeyDown={(event) => handleKeyDown(event, handleCancel)}
                style={{
                  backgroundColor: cancelButtonEnabled ? "blue" : "white",
                  color: cancelButtonEnabled ? "white" : "black",
                  border: "1px solid #ccc",
                  cursor: cancelButtonEnabled ? "pointer" : "not-allowed",
                  width: "4%",
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
                  width: "4%",
                  height: "35px",
                  fontSize: "12px",
                }}
              >
                Back
              </button>
            </div>

            <div
              className="row mb-3"
              style={{ float: "right", marginTop: "-40px" }}
            >
              <div className="col-md-12 ">
                <div>
                  <button className="btn btn-primary" onClick={calculateTotal}>
                    Calculate
                  </button>

                  <button
                    className="btn btn-success ms-3"
                    onClick={generatePdf}
                    disabled={!isCancelButtonClicked || isEditMode}
                  >
                    <BsFillPrinterFill style={{ fontSize: "25px" }} />
                    Generate PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          <br></br>
          <br></br>
          <table
            className={`table table-bordered ${
             !isaddButtonClicked && disabledFields ? "disabled" : ""
            }`}
          >
            <thead>
              <tr>
                {/* <th>ID</th> */}
                <th>User ID</th>
                <th>Employee Name</th>
                <th>Day</th>
                <th>Date</th>

                <th>Total Hours</th>
                <th>Rate per Hour</th>

                <th>Per Day Salary (Rs)</th>
                <th>Deduction</th>

                {Array.from({ length: maxLogTimes }, (_, idx) => (
                  <React.Fragment key={`logTimeHeading-${idx}`}>
                    <th>{`In Time ${idx + 1}`}</th>
                    <th>{`Out Time ${idx + 1}`}</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry, index, matchingRecord) => (
                <tr key={index}>
                  {/* {isCancelButtonClicked ? <td>{entry.id}</td> : ""} */}

                  <td>
                    {isCancelButtonClicked ? entry.userId : selectedUserId}
                    
                  </td>

                  {isCancelButtonClicked ? (
                    <td>{entry.Employee_name}</td>
                  ) : (
                    <td>{selectedEmployeeName}</td>
                  )}

                  <td>
                    {
                      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                        entry.date.getDay()
                      ]
                    }
                  </td>
                  <td>{formatDate(entry.date)}</td>

                  <td>
                    {calculateTotalHours(
                      entry.logTimes,
                      entry.outTimes
                    ).toFixed(2)}
                  </td>

                  {isCancelButtonClicked ? (
                    <td>{entry.netRatePerHour}</td>
                  ) : (
                    <td>{Ratecalculate}</td>
                  )}

                  <td
                    style={{
                      fontWeight: isCancelButtonClicked ? "bold" : "bold",
                    }}
                  >
                    {isCancelButtonClicked && isEditMode
                      ? perDaySalaries[index]
                      : entry.perDaySalary || perDaySalaries[index]}
                  </td>

                  {isCancelButtonClicked ? (
                    <td>{entry.deduction}</td>
                  ) : (
                    <td>
                      {entry.date.getDay() === 0 &&
                      calculateTotalHours(entry.logTimes, entry.outTimes) ===
                        0 ? (
                        <span style={{ color: "red" }}>
                          -{((hourlyRate * typeEmpoyeeHours) * 2).toFixed(2)}
                        </span>
                      ) : (
                        "0"
                      )}
                    </td>
                  )}

                  {entry.logTimes.map((logTime, idx) => (
                    <React.Fragment key={idx}>
                      <td>
                        <span
                          onClick={() => openEditModal(index, 2 * idx, logTime)}
                          style={{ cursor: "pointer" }}
                        >
                          {formatTime(logTime)}
                        </span>
                      </td>
                      <td>
                        <span
                          onClick={() =>
                            openEditModal(
                              index,
                              2 * idx + 1,
                              entry.outTimes[idx]
                            )
                          }
                          style={{ cursor: "pointer" }}
                        >
                          {formatTime(entry.outTimes[idx])}
                        </span>
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <label>Total monthly Hours:</label> <strong>{totalHours}</strong>
          </div>

          <div>
            <label>Total Deduction on month:</label>
            <strong>{totalSundayDeduction}</strong>
          </div>

          <div>
            <label>Total Monthly Salary (Rs):</label>
            <strong>{totalMonthlySalary}</strong>
          </div>
        </div>
      </div>
      {editModalOpen && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Time</h5>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="close"
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Time:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={saveEdit} className="btn btn-primary">
                  Save
                </button>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryComponent;
