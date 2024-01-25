import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { BsFillPrinterFill } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";

function TenderPurchaseUtility() {
  const apiURL = process.env.REACT_APP_API_URL;
  const [fetchedData, setFetchedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValue, setFilterValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${apiURL}/api/employees/getAllUtility`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log("data is", data);
        setFetchedData(data.salaryNoData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = fetchedData
      ? fetchedData.filter((post) => {
          const searchTermLower = searchTerm.toLowerCase();
          const employeeNameLower = post.Employee_name.toLowerCase();
  
          return (
            (filterValue === "" || post.group_Type === filterValue) &&
            employeeNameLower.includes(searchTermLower)
          );
        })
      : [];
  
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterValue, fetchedData]);
  

  const handleSearchTermChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
  };

  const pageCount = Math.ceil(filteredData.length / perPage);

  const paginatedPosts = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleClick = () => {
    navigate("/salary_genarate");
  };

  const handlePrint = () => {
    // Create a new jsPDF instance
    const pdf = new jsPDF();
  
    // Get the first record in filteredData (assuming it is not empty)
    const firstRecord = filteredData.length > 0 ? filteredData[0] : null;
  
    // Add custom header
    pdf.text(`UserId: ${firstRecord?.userId}`, 14, 20);
    pdf.text(`Employee Name: ${firstRecord?.Employee_name}`, 14, 30);
  
    // Add table headers
    const headers = [
      "salary_no",
      "Salary Date",
      "DaysInMonth",
      "userId",
      "Employee Name",
      "netRatePerHour",
      "totalMonthlySalary",
    ];
  
    // Add data to the table
    const data = filteredData.map((post) => [
      post.salary_no,
      post.salaryDate,
      post.daysInMonth,
      post.userId,
      post.Employee_name,
      post.netRatePerHour,
      post.totalMonthlySalary,
    ]);
  
    // Add the table to the PDF
    pdf.autoTable({
      startY: 40, // Adjust the starting Y position for the table
      head: [headers],
      body: data,
    });
  
    // Save the PDF
    pdf.save("filtered_data.pdf");
  };
  
  const handleBackButton = () => {
    navigate("/home");
  };

  const handleRowClick = (salary_no) => {
    const selectedEmployee = fetchedData.find(
      (employee) => employee.salary_no === salary_no
    );
    navigate("/salary_genarate", {
      state: { editRecordData: selectedEmployee },
    });
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <button className="btn btn-success" onClick={handleClick}>
          Genrate Salary
          </button>
          <button className="btn btn-secondary ms-2" onClick={handleBackButton}>
            Back
          </button>
        </div>
        <div className="col-md-4 d-flex justify-content-end">
          <div className="input-group">
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Search By Employee Name..."
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-secondary rounded-pill"
                type="button"
              >
                <FaSearch />
              </button>
            </div>

            <button
              className=" btn btn-primary ms-4 "
              onClick={handlePrint}
              style={{ float: "right" }}
            >
              <BsFillPrinterFill style={{ fontSize: "25px" }} />
              Print
            </button>
          </div>
        </div>
      </div>

      <br></br>

      <table className="table table-bordered table-striped">
        <thead className="thead-dark">
          <tr>
            {/* <th>ID</th> */}
            <th>Salary No</th>
            <th>Salary Date</th>
            <th>UserId</th>
            <th>Employee Name</th>
            <th>Days In Month</th>
            <th>NetRatePerHour</th>
            <th>TotalMonthlySalary</th>
          </tr>
        </thead>
        <tbody>
          {paginatedPosts.map((post) => (
            <tr
              key={post.salary_no}
              className="row-item"
              onDoubleClick={() => handleRowClick(post.salary_no)}
              //   onDoubleClick={() => handleRowClick(post.employeeCode)}
            >
              {/* <td>{post.id}</td> */}
              <td>{post.salary_no}</td>
              <td>{post.salaryDate}</td>
              <td>{post.userId}</td>
              <td>{post.Employee_name}</td>
              <td>{post.daysInMonth}</td>
              <td>{post.netRatePerHour}</td>
              <td>{post.totalMonthlySalary}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav>
        <ul className="pagination justify-content-center">
          {Array.from({ length: pageCount }).map((_, index) => (
            <li
              key={index}
              className={`page-item ${
                index + 1 === currentPage ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default TenderPurchaseUtility;
