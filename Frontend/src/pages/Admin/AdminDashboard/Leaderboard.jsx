import * as React from 'react';
import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';

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

const Leaderboard = () => {
  const { width } = useWindowSize();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/negativedata'); // Replace with your API endpoint
        if (response.ok) {
          const data = await response.json();
          setRows(data.map((item, index) => ({
            ...item,
            id: item.id, // Ensure each row has a unique id
            index: index + 1 // Add index for serial number
          })));
        } else {
          console.error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);

  const getColumnWidth = () => {
    if (width < 450) {
      return { sNo: 50, id: 150, facultyName: 150, department: 150, designation: 150, totalNegativeUpdates: 100 };
    } else if (width < 1024) {
      return { sNo: 70, id: 150, facultyName: 200, department: 200, designation: 180, totalNegativeUpdates: 120 };
    } else {
      return { sNo: 90, id: 150, facultyName: 200, department: 200, designation: 250, totalNegativeUpdates: 150 };
    }
  };

  const getRowHeight = () => {
    if (width < 450) {
      return 100;
    } else if (width < 1024) {
      return 80;
    } else {
      return 60;
    }
  };

  const getFontSize = () => {
    if (width < 450) {
      return '16px';
    } else if (width < 1024) {
      return '16px';
    } else {
      return '16px';
    }
  };

  const getHeaderFontSize = () => {
    if (width < 450) {
      return '16px';
    } else if (width < 1024) {
      return '20px';
    } else {
      return '24px';
    }
  };

  const rowHeight = getRowHeight();
  const fontSize = getFontSize();
  const headerFontSize = getHeaderFontSize();
  const columnWidths = getColumnWidth();

  const columns = [
    {
      field: 'sNo',
      headerName: 'S.No.',
      width: columnWidths.sNo,
      headerClassName: 'custom-header',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => params.row.index, // Use the index for serial number
    },
    { field: 'id', headerName: 'ID', width: columnWidths.id, headerClassName: 'custom-header', },
    { field: 'facultyName', headerName: 'Faculty Name', width: columnWidths.facultyName, headerClassName: 'custom-header', align: 'left', headerAlign: 'left' },
    { field: 'department', headerName: 'Department', width: columnWidths.department, headerClassName: 'custom-header', align: 'left', headerAlign: 'left' },
    { field: 'designation', headerName: 'Designation', width: columnWidths.designation, headerClassName: 'custom-header', align: 'left', headerAlign: 'left' },
    { field: 'totalNegativeUpdates', headerName: 'Negative Updates', width: columnWidths.totalNegativeUpdates, headerClassName: 'custom-header', align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <span style={{ color: 'red', fontWeight: 'bold', fontSize: '16px' }}>{params.value}</span>
      ),

     },
  ];

  const handleViewAllClick = () => {
    navigate('/faculty-details'); // Adjust the path to your route
  };

  return (
    <div className="grid-full2">
      <div className="grid2-head">
        <span>Faculty with Frequent Negative FRS</span>
        <button className="view-all-button5" onClick={handleViewAllClick}>
          View All Faculty
        </button>
      </div>
      <div className="data-grid-wrapper">
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={rowHeight}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          autoHeight
          disableSelectionOnClick
          stickyHeader
          sx={{
            '& .MuiDataGrid-cell': {
              fontSize: fontSize,
              textAlign: 'center',
            },
            '& .MuiDataGrid-columnHeaders': {
              fontSize: headerFontSize,
              textAlign: 'center',
            },
            '& .MuiDataGrid-cell--textLeft': {
              textAlign: 'left',
            },
            '& .MuiDataGrid-cell--textRight': {
              textAlign: 'right',
            },
          }}
        />
      </div>
    </div>
  );
};

export default Leaderboard;