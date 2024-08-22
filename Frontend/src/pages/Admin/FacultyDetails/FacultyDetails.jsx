import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { TextField, InputAdornment, Button, FormControl, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import FacultyDetailsPopup from './FacultyPopup';
import { downloadExcel } from './Excel3'; 
import './FacultyDetails.css';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Custom hook for window size
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Utility function to get the academic year options// Utility function to get the academic year options
function getAcademicYearOptions(rows) {
  const options = [];
  
  // Extract unique combinations of academicYear and semester from rows
  const uniqueCombinations = rows.reduce((acc, row) => {
    if (row.academicYear && row.semester) {
      const combination = `${row.academicYear} ${row.semester}`;
      if (!acc.includes(combination)) {
        acc.push(combination);
      }
    }
    return acc;
  }, []);

  // Sort unique combinations by academic year (descending)
  uniqueCombinations.sort((a, b) => {
    const [yearA, semesterA] = a.split(' ');
    const [yearB, semesterB] = b.split(' ');

    // Sort by academic year first
    const yearDifference = yearB - yearA;
    if (yearDifference !== 0) {
      return yearDifference;
    }

    // Sort by semester (assuming "Odd" comes before "Even")
    if (semesterA === "Odd" && semesterB === "Even") {
      return -1;
    } else if (semesterA === "Even" && semesterB === "Odd") {
      return 1;
    }

    return 0;
  });

  // Filter combinations to keep only the last 3 academic years with their semesters
  const lastThreeYears = new Set();
  const filteredCombinations = uniqueCombinations.filter(combination => {
    const [year] = combination.split(' ');
    lastThreeYears.add(year);
    return lastThreeYears.size <= 3;
  });

  // Add filtered combinations to options
  filteredCombinations.forEach(combination => {
    options.push({ label: combination, value: combination });
  });

  return options;
}





const FacultyDetails = () => {
  const { width } = useWindowSize();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedAcademicYearSemester, setSelectedAcademicYearSemester] = useState('All');
  const [loading, setLoading] = useState(true);


  const getColumnWidth = () => {
    if (width < 1400) {
      return {
        sNo: 70,
        academicYear: 80,
        semester: 80,
        facultyId: 90,
        name: 110,
        department: 160,
        designation: 160,
        positiveCount: 80,
        negativeCount: 80,
        action: 60,
      };
    } else {
      return {
        sNo: 70,
        academicYear: 100,
        semester: 100,
        facultyId: 100,
        name: 150,
        department: 200,
        designation: 180,
        positiveCount: 100,
        negativeCount: 100,
        action: 70,
      };
    }
  };

  const columnWidths = useMemo(() => getColumnWidth(), [width]);

  const columns = useMemo(() => [
    { field: 'id', headerName: 'S.No', headerAlign: 'center', align: 'center', width: columnWidths.sNo },
    { field: 'academicYear', headerName: 'Year', width: columnWidths.academicYear },
    { field: 'semester', headerName: 'Semester', width: columnWidths.semester },
    { field: 'facultyId', headerName: 'Faculty ID', width: columnWidths.facultyId },
    { field: 'facultyName', headerName: 'Name', width: columnWidths.name },
    { field: 'department', headerName: 'Department', width: columnWidths.department },
    { field: 'designation', headerName: 'Designation', width: columnWidths.designation },
    {
      field: 'positiveCount',
      headerName: 'Positives',
      type: 'number',
      width: columnWidths.positiveCount,
      align: 'center',
      renderCell: (params) => (
        <span style={{ color: 'green', fontWeight: 'bold' }}>{params.value}</span>
      ),
    },
    {
      field: 'negativeCount',
      headerName: 'Negatives',
      type: 'number',
      width: columnWidths.negativeCount,
      align: 'center',
      renderCell: (params) => (
        <span style={{ color: 'red', fontWeight: 'bold' }}>{params.value}</span>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: columnWidths.action,
      renderCell: (params) => (
        <Button onClick={() => handleViewClick(params.row)}>
          <VisibilityIcon />
        </Button>
      ),
    },
  ], [columnWidths]);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwt');
        const response = await fetch('http://localhost:4000/api/facultytotalupdates', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        const rowsWithId = data.map((item, index) => ({
          ...item,
          id: index + 1, 
        }));
        setRows(rowsWithId);

        // Determine current semester and year
        const currentMonth = new Date().getMonth(); // January is 0!
        const currentYear = new Date().getFullYear();
        let currentSemester;
        if (currentMonth >= 0 && currentMonth < 6) {
          currentSemester = 'Even';
        } else {
          currentSemester = 'Odd';
        }
        const currentYearSemester = `${currentYear} ${currentSemester}`;

        // Set the current semester as default if available in data
        const availableOptions = getAcademicYearOptions(rowsWithId);
        const defaultSemester = availableOptions.some(option => option.value === currentYearSemester)
          ? currentYearSemester
          : availableOptions[0]?.value || ''; // Fallback to first option if currentYearSemester not available
        setSelectedAcademicYearSemester(defaultSemester);

      } catch (error) {
        console.error('Error fetching faculty data:', error);
        alert('Failed to fetch data. Please try again later.');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  
  useEffect(() => {
    const lowercasedFilter = searchText.toLowerCase();
    const filteredData = rows.filter((item) => {
      const academicYearSemester = `${item.academicYear || ''} ${item.semester || ''}`;
  
      // Filter by academic year and semester
      const matchesAcademicYearSemester = 
        selectedAcademicYearSemester === 'All' || academicYearSemester === selectedAcademicYearSemester;
  
      // Filter by search text
      const matchesSearchText = Object.keys(item).some((key) =>
        (item[key] || '').toString().toLowerCase().includes(lowercasedFilter)
      );
  
      return matchesAcademicYearSemester && matchesSearchText;
    });
  
    // Recalculate IDs starting from 1
    const filteredDataWithId = filteredData.map((item, index) => ({
      ...item,
      id: index + 1,
    }));
  
    setFilteredRows(filteredDataWithId);
  }, [searchText, selectedAcademicYearSemester, rows]);
   useEffect(() => {
    console.log('Rows:', rows); 
    console.log('Search Text:', searchText);
    console.log('Selected Academic Year Semester:', selectedAcademicYearSemester);
  
    const lowercasedFilter = searchText.toLowerCase();
    const filteredData = rows.filter((item) => {
      const academicYearSemester = `${item.academicYear} ${item.semester}`;
      console.log('Academic Year Semester:', academicYearSemester); // Debugging: log academic year and semester
  
      // Filter by academic year and semester
      const matchesAcademicYearSemester = 
        selectedAcademicYearSemester === 'All' || academicYearSemester === selectedAcademicYearSemester;
  
      // Filter by search text
      const matchesSearchText = Object.keys(item).some((key) =>
        item[key].toString().toLowerCase().includes(lowercasedFilter)
      );
  
      return matchesAcademicYearSemester && matchesSearchText;
    });
  
    // Recalculate IDs starting from 1
    const filteredDataWithId = filteredData.map((item, index) => ({
      ...item,
      id: index + 1,
    }));
  
    console.log('Filtered Data:', filteredDataWithId); // Debugging: log filtered data
    setFilteredRows(filteredDataWithId);
  }, [searchText, selectedAcademicYearSemester, rows]);
  
  const handleBackClick = () => {
    navigate('/admin');
  };

  const handleViewClick = (row) => {
    setSelectedFaculty(row); // Set the selected faculty for the popup
    setIsPopupOpen(true); // Open the popup
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false); // Close the popup
  };

  const handleDownloadClick = () => {
    // Ensure columns and filteredRows are correctly defined and available
    console.log('Columns:', columns);
    console.log('Filtered Rows:', filteredRows);
  
    try {
      downloadExcel(filteredRows, columns);
      console.log('Download button clicked');
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      alert('Failed to download the Excel file. Please try again.');
    }
  };
  

  const handleAcademicYearSemesterChange = (event) => {
    setSelectedAcademicYearSemester(event.target.value);
  };

  return (
    <div className="grid-full4">
    <div className="header-container2">
  <div className="frs-heading2">
    <FontAwesomeIcon icon={faHistory} className="history-icon2" style={{ marginRight: '16px' }} />
    Faculty FRS Score
  </div>
  <div className="search-download-container">
    <TextField
      variant="outlined"
      placeholder="Search..."
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#bdbdbd' }} />
          </InputAdornment>
        ),
      }}
      className="search-bar3"
      sx={{
        width: '300px',
        '& .MuiOutlinedInput-root': {
          height: '40px',
          '& fieldset': {
            borderColor: '#bdbdbd',
          },
          '&:hover fieldset': {
            borderColor: '#1565c0',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#0d47a1',
          },
        },
        '& .MuiInputAdornment-root': {
          color: '#1e88e5',
        },
        '& .MuiOutlinedInput-input': {
          padding: '8px 14px',
        },
      }}
    />
    <FormControl variant="outlined" sx={{ minWidth: 200, marginLeft: '16px' }}>
      <Select
        value={selectedAcademicYearSemester}
        onChange={handleAcademicYearSemesterChange}
        displayEmpty
        sx={{ height: '40px' }} // Ensure height matches
      >
        {getAcademicYearOptions(rows).map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <Button
      variant="contained"
      onClick={handleDownloadClick}
      sx={{
        marginLeft: '16px',
        backgroundColor: '#0d47a1',
        '&:hover': {
          backgroundColor: '#1565c0',
        },
        height: '40px',
        minWidth: '120px', 
        boxSizing: 'border-box',
      }}
      startIcon={<DownloadIcon />}
    >
      Download
    </Button>
  </div>
</div>
      <div style={{ height: '500px' }}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
                color: '#1a237e',
                fontSize: '14px', // Smaller font size
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#1e88e5',
              },
              '& .MuiDataGrid-footerContainer': {
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
              },
              '& .MuiDataGrid-cell:focus': {
        outline: 'none',
      },
      '& .MuiDataGrid-cell:focus-within': {
        outline: 'none',
      },
      '& .MuiButtonBase-root:focus': {
        outline: 'none',
      },
              '& .MuiTablePagination-root': {
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
              },
              '& .MuiTablePagination-toolbar': {
                justifyContent: 'center',
                flexWrap: 'wrap',
              },
              '& .MuiTablePagination-selectLabel': {
                display: 'inline-block',
                marginRight: '8px',
              },
              '& .MuiTablePagination-input': {
                marginLeft: '8px',
              },
            }}
          />
        )}
      </div>
      {/* <button className="back-button3" onClick={handleBackClick}>
        <ArrowBackIcon sx={{ fontSize: '18px', marginTop: '0px', fontWeight: 'bold' }} />
        Back
      </button> */}
      {isPopupOpen && selectedFaculty && (
        <FacultyDetailsPopup
          open={isPopupOpen}
          onClose={handlePopupClose}
             faculty={selectedFaculty}
        />
      )}
    </div>
  );
};

export default FacultyDetails;