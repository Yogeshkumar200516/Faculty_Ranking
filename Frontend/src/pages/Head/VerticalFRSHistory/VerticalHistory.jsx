import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import { downloadExcel } from './Excel';
import './VerticalHistory.css';
import PropTypes from 'prop-types';

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

const FacultyFRS = ({ user }) => {
  const { width } = useWindowSize();
  const navigate = useNavigate();
  const id = user.id;
  const [searchText, setSearchText] = useState('');
  const [rows, setRows] = useState([]);
  const [verticalName, setVerticalName] = useState('');

  const getColumnWidth = () => {
    if (width < 1024) {
      return { sno: 50, date: 100, academicYear: 150, semester: 100, facultyName: 180, facultyId: 140, reason: 150, frsScore: 100 };
    } else {
      return { sno: 70, date: 120, academicYear: 150, semester: 100, facultyName: 180, facultyId: 160, reason: 200, frsScore: 160 };
    }
  };

  const columnWidths = getColumnWidth();

  const columns = [
    { field: 'sno', headerName: 'S.No', width: columnWidths.sno, headerAlign: 'center', align: 'center' },
    { field: 'academicYear', headerName: 'Academic Year', width: columnWidths.academicYear },
    { field: 'semester', headerName: 'Semester', width: columnWidths.semester },
    { field: 'date', headerName: 'Date', width: columnWidths.date },
    { field: 'facultyName', headerName: 'Faculty Name', width: columnWidths.facultyName },
    { field: 'facultyId', headerName: 'Faculty ID', width: columnWidths.facultyId },
    { field: 'reason', headerName: 'Reason', width: columnWidths.reason },
    {
      field: 'frsScore',
      headerName: 'FRS Score',
      type: 'number',
      width: columnWidths.frsScore,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className={params.value > 0 ? 'frs-positive' : 'frs-negative'}>
          {params.value}
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const response = await fetch(`http://localhost:4000/api/verticalhead/${id}/VerticalFrs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const { vertical, frsSummary } = data;
        setVerticalName(vertical);

        const mappedRows = frsSummary.map((row, index) => ({
          id: index + 1, // Adding a unique id for each row
          sno: index + 1,
          date: new Date(row.created_at).toLocaleDateString('en-GB'),
          academicYear: row.academic_year,
          semester: row.semester,
          facultyName: row.facultyName,
          facultyId: row.facultyId,
          reason: row.reason,
          frsScore: row.frsScore,
        }));

        setRows(mappedRows);
      } catch (error) {
        console.error('Error fetching FRS data:', error);
      }
    };

    fetchData();
  }, [id]);

  // Memoize filtered data to recalculate S.No on data or search change
  const filteredData = useMemo(() => {
    const lowercasedFilter = searchText.toLowerCase();
    return rows
      .filter(item =>
        Object.keys(item).some(key =>
          item[key] != null && item[key].toString().toLowerCase().includes(lowercasedFilter)
        )
      )
      .map((item, index) => ({ ...item, sno: index + 1 })); // Recalculate S.No for filtered data
  }, [searchText, rows]);

  const handleBackClick = () => {
    navigate('/head-dashboard');
  };

  const handleDownload = () => {
    downloadExcel(filteredData, columns);
  };

  return (
    <div className="grid-full3">
      <div className="header-container">
        <div className='frs-heading'>
          <FontAwesomeIcon icon={faHistory} className="history-icon" />
          {verticalName} Faculty FRS Score
        </div>
        <div className="header-actions">
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
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleDownload}
            className="download-button"
            sx={{
              backgroundColor: '#1e88e5',
              color: '#ffffff',
              height: '40px',
              marginLeft: '16px',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Download
          </Button>
        </div>
      </div>
      <div className='data-grid-container'>
        <DataGrid
          rows={filteredData}
          columns={columns}
          getRowId={(row) => row.sno} // Use sno as the unique id for each row
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[5, 10, 20, 50]}
          sx={{
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
              color: '#1a237e',
              fontSize: '17px',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#1e88e5',
            },
            '& .MuiDataGrid-footerContainer': {
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
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
      <button className='back-button3' onClick={handleBackClick}>
        <ArrowBackIcon sx={{ fontSize: '18px', marginTop: '0px', fontWeight: 'bold' }} />
        Back
      </button>
    </div>
  );
};

FacultyFRS.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    verticals: PropTypes.objectOf(PropTypes.number).isRequired,
    token: PropTypes.string.isRequired, // Added token for authentication
  }).isRequired,
};

export default FacultyFRS;
