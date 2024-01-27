import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";


function UserCreationUtility() {
  const apiURL = process.env.REACT_APP_API_URL

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
        const apiUrl = `${apiURL}/api/employees/getallusers`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log("data is",data)
        setFetchedData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = fetchedData.filter(post => {
      const searchTermLower = searchTerm.toLowerCase();
      const userName = (post.userName || '').toLowerCase();

      return (
        (filterValue === "" || post.group_Type === filterValue) &&
        (userName.includes(searchTermLower))
      );
    });

    setFilteredData(filtered);
    setCurrentPage(1); 
  }, [searchTerm, filterValue, fetchedData]);

  const handleSearchTermChange = (event) => {
    const term = event.target.value;
    
    setSearchTerm(term);
  };

  const pageCount = Math.ceil(filteredData.length / perPage);

  const paginatedPosts = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleClick = () => {
    navigate("/user_Creation");
  };
  
  const handleRowClick = (employeeCode) => {
  const selectedEmployee = fetchedData.find((employee) => employee.employeeCode === employeeCode);
  navigate("/user_Creation", { state: { editRecordData: selectedEmployee } });
};



  const handleBackButton=()=>{
    navigate("/home")
  }

  return (
    <div className="container mt-4">
    <div className="row">
      <div className="col-md-6">
        <button className="btn btn-primary" onClick={handleClick}>
          Add
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
      <button className="btn btn-outline-secondary rounded-pill" type="button">
        <FaSearch />
      </button>
    </div>
  </div>
</div>
</div>


    <br></br>
      
      <table className="table table-bordered table-striped">
  <thead className="thead-dark">
          <tr>
            <th>Employee Code</th>
            <th>Employee Name</th>
            <th>Mobile No</th>
            <th>Email Id</th>
            <th>User Type</th>
          </tr>
        </thead>
        <tbody>
          {paginatedPosts.map((post) => (
            <tr
              key={post.employeeCode}
              className="row-item"
              onDoubleClick={() => handleRowClick(post.employeeCode)}
            >
              <td>{post.employeeCode}</td>
              <td>{post.userName}</td>
              <td>{post.mobileNo}</td>
              <td>{post.emailId}</td>
              <td>{post.userType}</td>
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

export default UserCreationUtility;
