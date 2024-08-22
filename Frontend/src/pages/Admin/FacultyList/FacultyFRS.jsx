import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { TextField, InputAdornment, Button, MenuItem, Select, FormControl, } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faDownload } from '@fortawesome/free-solid-svg-icons';
import './FacultyFRS.css';
import { jwtDecode } from 'jwt-decode';
import { downloadExcel } from './Excel1'; 
import { fontWeight } from '@mui/system';

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

const FacultyFRS = () => {
  const { width } = useWindowSize();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  const generateAcademicYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];

    for (let i = 0; i < 3; i++) {
      const startYear = currentYear - i;
      const endYear = startYear + 1;
      const academicYear = `${startYear}-${endYear}`;

      options.push(
        { value: `${academicYear}:Odd`, label: `${academicYear} - Odd` },
        { value: `${academicYear}:Even`, label: `${academicYear} - Even` }
      );
    }

    return options;
  };

  const academicYearOptions = generateAcademicYearOptions();

  const getCurrentSemester = () => {
    const month = new Date().getMonth() + 1; 
    const year = new Date().getFullYear();
    const startYear = month >= 7 ? year : year - 1; 
    const endYear = startYear + 1;

    return month >= 7
      ? `${startYear}-${endYear}:Odd`
      : `${startYear}-${endYear}:Even`;
  };

  useEffect(() => {
    setFilter(getCurrentSemester());
  }, []);

  const getColumnWidth = () => {
    if (width < 1024) {
      return { id: 40, facultyId: 80, facultyName: 110, department: 150, designation: 150, frsScore: 60, semester: 50, academicYear: 70 };
    } else {
      return { id: 60, facultyId: 120, facultyName: 140, department: 200, designation: 200, frsScore: 120, semester: 90, academicYear: 120 };
    }
  };

  const columnWidths = getColumnWidth();

  const columns = [
    { field: 'sNo', headerName: 'S.No', align: 'center', fontWeight: 'bold', width: columnWidths.id },
    { field: 'semester', headerName: 'Semester', width: columnWidths.semester },
    { field: 'academicYear', headerName: 'Academic Year', width: columnWidths.academicYear },
    { field: 'facultyId', headerName: 'Faculty ID', width: columnWidths.facultyId },
    { field: 'facultyName', headerName: 'Faculty Name', width: columnWidths.facultyName },
    { field: 'department', headerName: 'Department', width: columnWidths.department },
    { field: 'designation', headerName: 'Designation', width: columnWidths.designation },

    {
      field: 'frsScore',
      headerName: 'FRS Score',
      type: 'number',
      width: columnWidths.frsScore,
      align: 'center',
      renderCell: (params) => {
        const score = parseFloat(params.value).toFixed(2);
        return (
          <div className={params.value > 0 ? 'frs-positive' : 'frs-negative'}>
            {score}
          </div>
        );
      },
    },
  ];

  const fetchFacultyData = async () => {
    const token = localStorage.getItem('jwt');

    if (!token || !checkTokenValidity(token)) {
        setError('Token has expired or is invalid');
        return;
    }

    try {
        let academicYear = '';
        let semester = '';

        if (filter && filter !== 'All') {
            [academicYear, semester] = filter.split(':');
        } else {
            const currentSemester = getCurrentSemester();
            [academicYear, semester] = currentSemester.split(':');
        }

        const query = new URLSearchParams({
            academicYear: academicYear || '',
            semester: semester || ''
        }).toString();

        const response = await fetch(`http://localhost:4000/api/faculty?${query}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let data = await response.json();

        
        if (semester) {
            data = data.map(item => ({
                ...item,
                semester: semester
            }));
        }

        const sortedData = data.sort((a, b) => b.frsScore - a.frsScore);
        setRows(sortedData);
    } catch (error) {
        console.error('Error fetching faculty data:', error);
        setError(error.message);
    }
};

  
  useEffect(() => {
    fetchFacultyData();
  }, [filter]);

  useEffect(() => {
    let lowercasedFilter = searchText.toLowerCase();
    let filteredData = rows.filter((item) => {
        return Object.keys(item).some((key) =>
            item[key].toString().toLowerCase().includes(lowercasedFilter)
        );
    });

    if (filter && filter !== 'All') {
        const [academicYear, semester] = filter.split(':');
        if (semester && academicYear) {
            filteredData = filteredData.filter((item) =>
                item.semester === semester && item.academicYear === academicYear
            );
        } else if (semester) {
            filteredData = filteredData.filter((item) => item.semester === semester);
        } else if (academicYear) {
            filteredData = filteredData.filter((item) => item.academicYear === academicYear);
        }
    } else {
        const [currentAcademicYear, currentSemester] = getCurrentSemester().split(':');
        filteredData = filteredData.filter((item) =>
            item.semester === currentSemester && item.academicYear === currentAcademicYear
        );
    }

  
    const updatedFilteredData = filteredData.map((item, index) => ({
        ...item,
        sNo: index + 1, 
    }));

    setFilteredRows(updatedFilteredData);
}, [searchText, rows, filter]);


  const handleBackClick = () => {
    navigate('/admin');
  };

  const handleDownload = () => {
    downloadExcel(filteredRows, columns); 
  };

  return (
    <div className="grid-full3">
      <div className="header-container">
        <div className="frs-heading">
          <FontAwesomeIcon icon={faHistory} className="history-icon" />
          Faculty FRS Score
        </div>
        <div className="actions-container">
  <TextField
    variant="outlined"
    placeholder="Search..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon sx={{ color: '#bdbdbd', height: '40px'}} />
        </InputAdornment>
      ),
    }}
    className="search-bar2"
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
        height: '40px', 
      },
    }}
  />
  <FormControl sx={{ minWidth: 200, marginLeft: 1, height: '40px' }}>
    <Select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      sx={{ height: '40px' }} 
    >
      <MenuItem value="All">
        <em>All</em>
      </MenuItem>
      {academicYearOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
  <Button
    variant="contained"
    startIcon={<FontAwesomeIcon icon={faDownload} />}
    onClick={handleDownload}
    sx={{ 
      marginLeft: 1, 
      backgroundColor: '#1565c0', 
      color: '#fff', 
      minWidth: '120px',
      height: '38px', // Ensure button height matches
      display: 'flex',
      
    }}
  >
    Download
  </Button>
</div>

      </div>
      <div className="data-grid-container" style={{height: '500px'}}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.sNo} // Use sNo as the unique ID
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          // checkboxSelection
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
      </div>
      {/* <button className="back-button3" onClick={handleBackClick}>
        <ArrowBackIcon sx={{ fontSize: '18px', marginTop: '0px', fontWeight: 'bold' }} />
        Back
      </button> */}
    </div>
  );
};

function checkTokenValidity(token) {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) { 
      console.log('Token has expired');
      return false;
    }

    console.log('Token is valid');
    return true;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return false;
  }
}

export default FacultyFRS;