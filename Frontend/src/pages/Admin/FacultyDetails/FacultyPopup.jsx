import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, InputAdornment, Button, IconButton, Modal, Box, Typography, FormControl, Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import { downloadExcel } from './Excel4';

const FacultyDetailsPopup = ({ open, onClose, faculty }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedVertical, setSelectedVertical] = useState('All Verticals');
  const [showPositive, setShowPositive] = useState(false);
  const [showNegative, setShowNegative] = useState(false);
  const [originalScores, setOriginalScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPositiveUpdates, setTotalPositiveUpdates] = useState(0);
  const [totalNegativeUpdates, setTotalNegativeUpdates] = useState(0);
  const [totalFRS, setTotalFRS] = useState(0);

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleVerticalChange = (event) => {
    setSelectedVertical(event.target.value);
  };

  const handleShowPositiveChange = (event) => {
    setShowPositive(event.target.checked);
  };

  const handleShowNegativeChange = (event) => {
    setShowNegative(event.target.checked);
  };

  const handleDownload = () => {
    const positiveUpdates = filteredScores.filter(item => item.updatedFRS > 0).length;
    const negativeUpdates = filteredScores.filter(item => item.updatedFRS < 0).length;
    const totalFRSValue = filteredScores.reduce((total, item) => total + item.updatedFRS, 0);

    downloadExcel(
      filteredScores,
      columns,
      faculty.facultyId,
      faculty.facultyName,
      faculty.department,
      positiveUpdates,
      negativeUpdates,
      totalFRSValue
    );
  };

  useEffect(() => {
    if (faculty && faculty.facultyId) {
      const fetchData = async () => {
        try {
          setLoading(true);

          const query = new URLSearchParams({
            academicYear: faculty.academicYear || '',
            semester: faculty.semester || ''
          });

          const response = await fetch(`http://localhost:4000/api/popup/${faculty.facultyId}?${query.toString()}`);

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          const dataArray = Array.isArray(data) ? data : [];

          const dataWithId = dataArray.map((item, index) => ({ ...item, id: item.serialNo || index }));

          setOriginalScores(dataWithId);
          setFilteredScores(dataWithId);

          const positiveUpdates = dataWithId.filter(item => item.updatedFRS > 0).length;
          const negativeUpdates = dataWithId.filter(item => item.updatedFRS < 0).length;
          const totalFRSValue = dataWithId.reduce((total, item) => total + item.updatedFRS, 0);

          setTotalPositiveUpdates(positiveUpdates);
          setTotalNegativeUpdates(negativeUpdates);
          setTotalFRS(totalFRSValue);
        } catch (error) {
          console.error('Error fetching FRS data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [faculty]);

  useEffect(() => {
    const lowercasedFilter = searchText.toLowerCase();
    const filteredData = originalScores.filter(item => {
      const matchesVertical = selectedVertical === 'All Verticals' || item.vertical === selectedVertical;
      const matchesText = Object.keys(item).some(key =>
        item[key].toString().toLowerCase().includes(lowercasedFilter)
      );
      const matchesSign = (!showPositive && !showNegative) ||
        (showPositive && item.updatedFRS > 0) ||
        (showNegative && item.updatedFRS < 0);

      return matchesVertical && matchesText && matchesSign;
    });

    const positiveUpdates = filteredData.filter(item => item.updatedFRS > 0).length;
    const negativeUpdates = filteredData.filter(item => item.updatedFRS < 0).length;
    const totalFRSValue = filteredData.reduce((total, item) => total + item.updatedFRS, 0);

    setTotalPositiveUpdates(positiveUpdates);
    setTotalNegativeUpdates(negativeUpdates);
    setTotalFRS(totalFRSValue);

    setFilteredScores(filteredData);
  }, [searchText, selectedVertical, originalScores, showPositive, showNegative]);

  const columns = [
    {
      field: 'serialNo',
      headerName: 'S.No',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => params.api.getSortedRowIds().indexOf(params.id) + 1,
    },
    { field: 'date', headerName: 'Date', width: 130 },
    { field: 'academicYear', headerName: 'Academic Year', width: 160 },
    { field: 'semester', headerName: 'Semester', width: 120 },
    { field: 'vertical', headerName: 'Vertical', width: 130 },
    { field: 'reason', headerName: 'Reason', width: 200 },
    {
      field: 'updatedFRS',
      headerName: 'Updated FRS',
      type: 'number',
      width: 180,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <Typography
            sx={{
              color: params.value >= 0 ? 'green' : 'red',
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: 'normal',
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="faculty-details-popup"
      aria-describedby="faculty-details-popup-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{
          width: '80%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          height: '700px',
        }}
      >
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6" sx={{ color: '#424242' }}>
            Faculty FRS Score - {faculty.facultyName} ({faculty.facultyId})
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box display="flex" alignItems="center" mb={2} sx={{ height: '40px' }}>
          <TextField
            variant="outlined"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mr: 2,
              flexGrow: 0.2,
              height: '100%',
              '& .MuiInputBase-root': {
                height: '100%',
                padding: '0 14px',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: 1,
              },
            }}
          />
          <FormControl variant="outlined" sx={{ minWidth: 200, mr: 2, height: '100%' }}>
            <Select
              value={selectedVertical}
              onChange={handleVerticalChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Vertical Filter' }}
              sx={{ height: '100%' }}
            >
              <MenuItem value="All Verticals">All Verticals</MenuItem>
              <MenuItem value="Academic">Academic</MenuItem>
              <MenuItem value="Special Lab">Special Lab</MenuItem>
              <MenuItem value="IQAC">IQAC</MenuItem>
              <MenuItem value="COE">COE</MenuItem>
              <MenuItem value="Skill">Skill</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
            sx={{ height: '100%' }}
          >
            Download
          </Button>
        </Box>
 <Box display="flex" alignItems="center" mb={2} sx={{ flexWrap: 'wrap' }}>
  <FormControlLabel
    control={<Checkbox checked={showPositive} onChange={handleShowPositiveChange} />}
    label="Show Positive"
    sx={{ mr: 2 }} // Space between checkboxes
  />
  <FormControlLabel
    control={<Checkbox checked={showNegative} onChange={handleShowNegativeChange} />}
    label="Show Negative"
    sx={{ mr: 4 }} // Space between checkboxes and total FRS
  />

  <Typography variant="body1" sx={{ color: '#9e9e9e', fontWeight: 'bold', ml: 'auto' }}>
    Total Positive Updates: <span style={{ color: '#66bb6a', marginLeft: '10px' }}>{totalPositiveUpdates}</span>
  </Typography>
  <Typography variant="body1" sx={{ color: '#9e9e9e', fontWeight: 'bold' , ml: 'auto'}}>
    Total Negative Updates: <span style={{ color: '#ff5722', marginLeft: '10px' }}>{totalNegativeUpdates}</span>
  </Typography>
  <Typography variant="body1" sx={{ color: '#9e9e9e', fontWeight: 'bold', ml: 'auto' }}>
    Total FRS: <span style={{ color: '#29b6f6', marginLeft: '10px' }}>{totalFRS}</span>
  </Typography>
</Box>


        <Box flexGrow={1} mb={2}>
          <DataGrid 
            rows={filteredScores}
            columns={columns}
            pageSize={10}
            loading={loading}
            getRowId={(row) => row.id}
            disableSelectionOnClick
            sx={{
              height: '460px',
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
        </Box>
      </Box>
    </Modal>
  );
};

FacultyDetailsPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  faculty: PropTypes.shape({
    facultyId: PropTypes.string,
    facultyName: PropTypes.string,
    academicYear: PropTypes.string,
    semester: PropTypes.string,
    department: PropTypes.string,
  }),
};

export default FacultyDetailsPopup;
