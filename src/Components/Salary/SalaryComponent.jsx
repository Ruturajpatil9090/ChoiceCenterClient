import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import EmployeeHelp from "./EmployeeHelp";
import "../../App.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import { BsFillPrinterFill } from "react-icons/bs";
import logo from "../../Assets/late.avif";

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
var Ratecalculate = "";
var Ratecalculated = "";
var EmpHours = "";
var typeEmpoyeeHours = "";
var totalLateMinutes = 0;
var LocalStorageDays = "";
var CountOfDaysLate = 0;
var MonthlyLateMinutes = 0

const SalaryComponent = () => {
  const apiURL = process.env.REACT_APP_API_URL;
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

  const daysInMonthInputRef = useRef(null);

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
    setIsAddButtonClicked(true);
    newSetSelectedUserId = "";
    newSetEmployeeName = "";
    window.location.reload();

    if (daysInMonthInputRef.current) {
      daysInMonthInputRef.current.focus();
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
    axios
      .delete(
        `http://localhost:5000/api/employees/deleteRecords/${lastSalaryNoCancel}`
      )
      .then((response) => {
        window.alert("Record deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting record:", error.message);
      });

    // Update state
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
        `${apiURL}/api/employees/getlastrecord?salaryNo=${lastSalaryNoCancel}`
      );

      if (response.status === 200) {
        const lastRecordData = response.data.lastRecord;
        const lastRecordData1 = lastRecordData[lastRecordData.length - 1];
        newSetSelectedUserId = lastRecordData[0].userId;
        newSetEmployeeName = lastRecordData[0].Employee_name;

        DaysInMonthNew = lastRecordData[0].daysInMonth;
        newNetRatePerHour = lastRecordData[0].netRatePerHour;
        newBasicSalry = lastRecordData[0].Basic_salary;
        newSalaryDate = lastRecordData[0].salaryDate;
        totalLateMinutes = lastRecordData[0].Late;
        CountOfDaysLate = lastRecordData1.CountOfDaysLateMonth;
        MonthlyLateMinutes = lastRecordData1.MonthlyLateMinutes;
        setTotalAbsentDays(lastRecordData[0].MonthlyOff);
        setSundayAbsentCount(lastRecordData[0].MonthlySundayOff);

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
        // console.log("fetch Record hourly rate", hourlyRate);
        setTotalMonthlySalary(lastRecordData[0].totalMonthlySalary);
        setTotalSundayDeduction(lastRecordData[0].totalMonthlyDeduction);

        // Parse the date string into a JavaScript Date object
        const dateParts = lastRecordData[0].date.split("-");
        const parsedDate = new Date(
          parseInt(dateParts[2], 10),
          parseInt(dateParts[1], 10) - 1,
          parseInt(dateParts[0], 10) + 1
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
              Late: matchingRecord.Late,
              totalAbsentDays: matchingRecord.totalAbsentDays,
              sundayAbsentCount: matchingRecord.sundayAbsentCount,
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
    // setFilteredData([]);
    // newSetSelectedUserId = "";
    // newSetEmployeeName = "";
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

  const handleDateChange = (e) => {
    const inputValue = e.target.value;
    const newDate = new Date(inputValue);

    // Check if the input value is a valid date
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
    } else {
      // Handle invalid date input (you can show an error message or handle it in a way suitable for your app)
      console.error("Invalid date input");
    }
  };

  useEffect(() => {
    // Update the date to be the first day of the previous month when the component mounts
    if (!isCancelButtonClicked) {
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() - 1);
      currentDate.setDate(1); // Set the day to 1
      setSelectedDate(currentDate);
    }
  }, [isCancelButtonClicked]);

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
    try {
      const apiResponse = await axios.get(
        `${apiURL}/api/employees/getlastrecord?salaryNo=${lastSalaryNoCancel}`
      );
      const apiData = apiResponse.data.lastRecord;
      // console.log(apiData);
      const pdf = new jsPDF({
        orientation: "portrait",
      });
      pdf.setFontSize(10);
      pdf.text(`Salary No: ${salaryDetails.salaryNo}`, 15, 10);
      pdf.text(
        `Employee Code: ${
          isCancelButtonClicked ? newSetSelectedUserId : selectedUserId
        }`,
        15,
        15
      );
      pdf.text(
        `Employee Name: ${
          isCancelButtonClicked ? newSetEmployeeName : selectedEmployeeName
        }`,
        15,
        20
      );
      pdf.text(
        `Salary Date: ${formatDate(selectedSalaryDate)}`,
        pdf.internal.pageSize.width - 80,
        10
      );
      pdf.text(
        `Days In Month: ${
          isCancelButtonClicked ? DaysInMonthNew : salaryDetails.daysInMonth
        }`,
        pdf.internal.pageSize.width - 80,
        15
      );

      // Add data from the API to the PDF
      Object.keys(apiData).forEach((key, index) => {
        const entry = apiData[key];
      });
      // Add table headers
      const headers = [
        "Late(min)",
        "Day",
        "Date",
        "D/HRS",
        "R/HRS",
        "PDS",
        "Deduction",
        ...Array.from({ length: maxLogTimes }, (_, idx) => [
          `In ${idx + 1}`,
          `Out ${idx + 1}`,
        ]).flat(),
      ];

      // Add data to the table
      const data = filteredData.map((entry) => [
        entry.Late
          ? {
              content: entry.Late > 0 ? entry.Late : "0.00",
              styles: { textColor: entry.Late > 0 ? [255, 0, 0] : [0, 0, 0] },
            }
          : "0.00",

        // ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][entry.date.getDay()]
        entry.day,

        formatDate(entry.date),
        entry.totalHours,
        entry.netRatePerHour,
        entry.perDaySalary,
        entry.deduction
          ? { content: entry.deduction, styles: { textColor: [255, 0, 0] } }
          : "0.00",

        ...entry.logTimes
          .map((logTime, idx) => [
            formatTime(logTime),
            formatTime(entry.outTimes[idx]),
          ])
          .flat(),
      ]);

      pdf.autoTable({
        startY: 30, // Adjust startY to leave space for the header information
        head: [headers],
        body: data,
        margin: { bottom: 10 },
        styles: {
          fontSize: 8,
          cellPadding: 1,
          lineHeight: 1,
        },
      });
      const totalMonthlySalaryX = pdf.internal.pageSize.width - 80;
      // Add summary information
      pdf.setFontSize(10);
      pdf.text(
        `\u2022 Total Monthly Working Hours= ${totalHours} Hr`,
        15,
        pdf.autoTable.previous.finalY + 10
      );
      pdf.text(
        `\u2022 Total Sunday Deduction= ${totalSundayDeduction}`,
        15,
        pdf.autoTable.previous.finalY + 15
      );
      // Add "Total Monthly Salary" on the right side

      pdf.text(
        `\u2022 Total monthly Leave's = ${totalAbsentDays}`,
        15,
        pdf.autoTable.previous.finalY + 20
      );
      pdf.text(
        `\u2022 Total Monthly Sunday Leave's = ${sundayAbsentCount}`,
        15,
        pdf.autoTable.previous.finalY + 25
      );
      pdf.text(
        `\u2022 Total Monthly Late Minutes= ${MonthlyLateMinutes} min`,
        15,
        pdf.autoTable.previous.finalY + 30
      );
      pdf.text(
        `\u2022 Total Monthly Late Days= ${CountOfDaysLate} days`,
        15,
        pdf.autoTable.previous.finalY + 35
      );
      

      pdf.setFontSize(14);
      pdf.text(
        ` Total: ${totalMonthlySalary}/-`,
        totalMonthlySalaryX,
        pdf.autoTable.previous.finalY + 10
      );

      // Save the PDF
      pdf.save(
        `salary_details_${isCancelButtonClicked ? newSetEmployeeName : ""}.pdf`
      );
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
          `${apiURL}/api/data/getTableData/${year}/${month}?UserId=${selectedUserId}`
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
  const [fromTime, setFromTime] = useState("");

  //In this function we have to get the data from Employee Help such as the userId,Employee_name,rateperhour
  const handleEmployeeCode = (code, name, ratePerHour, Basic_Salary, time) => {
    setSelectedUserId(code);
    setSelectedEmployeeName(name);
    setSelectedRatePerHour(ratePerHour);
    setEmployeeHours(ratePerHour);
    setSelectBasicSalary(Basic_Salary);
    setFromTime(time);
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

        // Convert initialValue to 24-hour format
        const initialTime = new Date(initialValue).toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        setEditTime(initialTime);
        setEditModalOpen(true);
      }
    }
  };

  const saveEdit = () => {
    debugger;
    if (editRowIndex !== null && editColumnIndex !== null) {
      const updatedLogData = [...filteredData];
      if (!updatedLogData[editRowIndex].logTimes) {
        updatedLogData[editRowIndex].logTimes = [];
      }

      const datePart = new Date(updatedLogData[editRowIndex].date)
        .toISOString()
        .split("T")[0];

      if (editColumnIndex % 2 === 0) {
        updatedLogData[editRowIndex].logTimes[Math.floor(editColumnIndex / 2)] =
          new Date(`${datePart}T${editTime}`).toISOString();
      } else {
        updatedLogData[editRowIndex].outTimes[
          Math.floor((editColumnIndex - 1) / 2)
        ] = new Date(`${datePart}T${editTime}`).toISOString();
      }

      setFilteredData(updatedLogData);
      setEditModalOpen(false);
      setEditTime("");
    }
  };

  const openEditModal1 = (rowIndex, columnIndex, initialValue) => {
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

  const saveEdit1 = () => {
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

  const [totalAbsentDays, setTotalAbsentDays] = useState(0);
  const [sundayAbsentCount, setSundayAbsentCount] = useState(0);

  const calculateTotal = () => {
    let totalHours = 0;
    let totalRate = 0;
    let totalSundayDeduction = 0;
    const dailySalaries = [];
    let absentDays = []; // Array to store dates of absent days
    let sundayCount = 0; // Variable to keep track of Sundays

    filteredData.forEach((entry) => {
      const hours = calculateTotalHours(entry.logTimes, entry.outTimes);
      const integerPart = parseInt(hours);
      const decimalPart = parseFloat((hours - integerPart).toFixed(2));

      const typeSalary = isEditMode ? newBasicSalry : selectBasicSalary;
      const RatePerHours = typeSalary / salaryDetails.daysInMonth;

      typeEmpoyeeHours = isEditMode ? EmpHours : fixedRatePerHour;

      Ratecalculated = RatePerHours / typeEmpoyeeHours;
      Ratecalculate = Math.round(Ratecalculated * 100) / 100;

      hourlyRate = Ratecalculate;

      const perDaySalary = (
        integerPart * hourlyRate +
        ((decimalPart * hourlyRate) / 60) * 100
      ).toFixed(2);

      dailySalaries.push(Math.round(perDaySalary));
      totalHours += hours;
      totalRate += hourlyRate;

      // Check if the day is Saturday (6 represents Saturday in JavaScript's Date object)
      if (entry.date.getDay() === 6) {
        // Saturday is a holiday, so skip further calculations for this day
        return;
      }

      // Check if the employee has logged hours for the day
      if (hours === 0) {
        // If the employee hasn't logged hours, consider them absent
        absentDays.push(formatDate(entry.date));

        // Check if the absent day is a Sunday
        if (entry.date.getDay() === 0) {
          sundayCount++;
        }
      }

      // Calculate Sunday deduction
      if (entry.date.getDay() === 0 && hours === 0) {
        const denominator = salaryDetails.daysInMonth;
        const newDataBasicSalry = isEditMode
          ? newBasicSalry
          : selectBasicSalary;
        if (denominator !== 0) {
          const sundayDeduction = hourlyRate * typeEmpoyeeHours * 2;
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

    setTotalAbsentDays(absentDays.length);
    setSundayAbsentCount(sundayCount);

    // Print or use the dates of absent days
    // console.log("Absent Dates (excluding Saturdays):", absentDays);

    // Print or use the count of Sundays among absent days
    // console.log("Sundays among Absent Days:", sundayAbsentCount);

    // Print or use the total count of absent days for the month
    const totalAbsentDays = absentDays.length;
    // console.log("Total Monthly Absent Count:", totalAbsentDays);
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

  //save button click save data on console
  const saveDataToDatabase = async (jsonData) => {
    try {
      const response = await axios.post(
        `${apiURL}/api/employees/insertjsondata`,
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
    sessionStorage.setItem("DaysInMonthNew", salaryDetails.daysInMonth);
    // localStorage.setItem('selectDateNew',selectedSalaryDate)
    const jsonData = filteredData.map((entry, index) => {
      const lateStatus = checkLateStatus(
        formatTime(entry.logTimes[0]),
        fromTime
      );

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
        EmployeeHours: isEditMode ? entry.EmployeeHours : EmployeeHours,
        totalDeduction: isCancelButtonClicked
          ? entry.deduction
          : entry.date.getDay() === 0 &&
            calculateTotalHours(entry.logTimes, entry.outTimes) === 0
          ? `-${parseFloat(hourlyRate * fixedRatePerHour * 2).toFixed(2)}`
          : 0,
        Late: isCancelButtonClicked ? entry.Late : lateStatus,
        MonthlyOff: isCancelButtonClicked ? entry.MonthlyOff : totalAbsentDays,
        MonthlySundayOff: isCancelButtonClicked
          ? entry.MonthlySundayOff
          : sundayAbsentCount,
        MonthlyLateMinutes : isCancelButtonClicked 
        ? entry.MonthlyLateMinutes
        : MonthlyLateMinutes/2,
        CountOfDaysLateMonth: isCancelButtonClicked
        ? entry.CountOfDaysLateMonth
        : CountOfDaysLate/2
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
        `${apiURL}/api/employees/updatesalary?salary_no=${salaryDetails.salaryNo}`,
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
        `${apiURL}/api/employees/getlastsalaryno`
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
        `${apiURL}/api/employees/getlastrecord?salaryNo=${lastSalaryNoCancel}`
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
        const lastRecordData1 = lastRecordData[lastRecordData.length - 1];
        newSetSelectedUserId = lastRecordData[0].userId;
        newSetEmployeeName = lastRecordData[0].Employee_name;
        DaysInMonthNew = lastRecordData[0].daysInMonth;
        newNetRatePerHour = lastRecordData[0].netRatePerHour;
        newBasicSalry = lastRecordData[0].Basic_salary;

        newSalaryDate = lastRecordData[0].salaryDate;
        EmpHours = lastRecordData[0].EmployeeHours;

        
        CountOfDaysLate = lastRecordData1.CountOfDaysLateMonth;
        MonthlyLateMinutes = lastRecordData1.MonthlyLateMinutes;

        // Update the salary details state
        setSalaryDetails({
          salaryNo: lastRecordData[0].salary_no,
          daysInMonth: DaysInMonthNew,
        });

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
              Late: matchingRecord.Late,
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
      setAddOneButtonEnabled(false);
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
      const DaysInMonthNew = "DaysInMonthNew";
      LocalStorageDays = localStorage.getItem(DaysInMonthNew);

      // console.log("LocalStorageDays", LocalStorageDays);
    }
  }, [editRecordData]);

  //late minutes calculation functionality 

  let remainingLateMinutesArray = [];
  // Modify the existing checkLateStatus function
  const checkLateStatus = (actualTime, expectedTime, logTimes) => {
    const actual = new Date(`2024-01-01T${actualTime}`);
    const expected = new Date(`2024-01-01T${expectedTime}`);

    const gracePeriodInMinutes = 15;
    if (isNaN(actual.getTime()) || isNaN(expected.getTime())) {
      // Handle NaN values, return 0
      return 0;
    }

    if (actual <= expected) {
      return 0;
    } else {
      // Employee is late
      const timeDifferenceInMinutes = (actual - expected) / (60 * 1000);
      const remainingLateMinutes = Math.max(
        0,
        timeDifferenceInMinutes - gracePeriodInMinutes
      );

      // console.log("remainingLateMinutes", remainingLateMinutes);
      remainingLateMinutesArray.push(Math.round(remainingLateMinutes));

      remainingLateMinutesArray = remainingLateMinutesArray.filter(minutes => minutes > 0);
      CountOfDaysLate = remainingLateMinutesArray.length;

      MonthlyLateMinutes = remainingLateMinutesArray.reduce(
        (sum, minutes) => sum + minutes,
        0
      );
      

      // console.log("MonthlyLateMinutes", MonthlyLateMinutes);
      // You can return the rounded remaining late minutes
      return Math.round(remainingLateMinutes);
    }
  };

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
            autoComplete="off"
            ref={daysInMonthInputRef}
            value={
              isCancelButtonClicked ? DaysInMonthNew : salaryDetails.daysInMonth
            }
            onChange={handleInputChange}
            disabled={isCancelButtonClicked && !isaddButtonClicked}
          />
        </div>
        <div className="col-md-1">
          <label className="form-label">Select Date:</label>
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            onChange={handleDateChange}
            value={selectedDate.toISOString().slice(0, 10)}
            disabled={isCancelButtonClicked && !isaddButtonClicked}
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
            isCancelButtonClickeded={
              isCancelButtonClicked && !isaddButtonClicked
            }
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
              <button
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
                  <button
                    className="btn btn-primary"
                    onClick={calculateTotal}
                    disabled={isCancelButtonClicked && !isEditMode}
                  >
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
                <th>Late(min)</th>
                {/* <th>fromTime</th> */}
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

                  {isCancelButtonClicked ? (
                    <td>{entry.Late}</td>
                  ) : (
                    <td>
                      {checkLateStatus(
                        formatTime(entry.logTimes[0]),
                        fromTime,
                        entry.logTimes
                      )}
                    </td>
                  )}

                  {/* <td>{fromTime}</td> */}
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
                          -{(hourlyRate * typeEmpoyeeHours * 2).toFixed(2)}
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
                          onClick={() =>
                            isEditMode
                              ? openEditModal1(index, 2 * idx, logTime)
                              : openEditModal(index, 2 * idx, logTime)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          {formatTime(logTime)}
                        </span>
                      </td>
                      <td>
                        <span
                          onClick={() =>
                            isEditMode
                              ? openEditModal1(
                                  index,
                                  2 * idx + 1,
                                  entry.outTimes[idx]
                                )
                              : openEditModal(
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
            <label>Total Monthly Working Hours =</label>{" "}
            <strong>{totalHours}</strong>
          </div>

          <div>
            <label>Total Monthly Salary =</label>
            <strong>{totalMonthlySalary}(₹)</strong>
          </div>

          <div>
            <label>Total Sunday Deduction =</label>
            <strong>{totalSundayDeduction}</strong>
          </div>

        
          <div>
            <label>Total monthly Leave's =</label>
            <strong>{totalAbsentDays}</strong>
          </div>

          <div>
            <label>Total Monthly Sunday Leave's =</label>
            <strong>{sundayAbsentCount}</strong>
          </div>
          <div>
            <label>Total Monthly Late Minutes =</label>
            <strong>{MonthlyLateMinutes} min</strong>
          </div>

          <div>
            <label>Total Monthly Late Days =</label>
            <strong>{CountOfDaysLate} days</strong>
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
                <button
                  onClick={isEditMode ? saveEdit1 : saveEdit}
                  className="btn btn-primary"
                >
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
