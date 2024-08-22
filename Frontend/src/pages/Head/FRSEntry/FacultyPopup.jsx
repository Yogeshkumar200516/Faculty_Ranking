import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Checkbox, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Box, Typography, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';

const FacultyPopup = ({ open, onClose, selectedFaculty, handleFacultyChange, handlePopupSubmit }) => {
  const [facultyList, setFacultyList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (open) {
      fetchFacultyData();
      fetchDepartments();
    }
  }, [open]);

  const fetchFacultyData = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('http://localhost:4000/api/faculty_frs', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data.users)) {
        throw new Error('Invalid data format');
      }

      setFacultyList(data.users);
    } catch (error) {
      console.error('Error fetching faculty data:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('http://localhost:4000/api/department', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data.departments)) {
        throw new Error('Invalid data format');
      }

      setDepartments(data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSelectAll = (event) => {
    const isSelected = event.target.checked;
    if (isSelected) {
      const allFacultyIds = filteredFacultyList.map(faculty => faculty.id);
      handleFacultyChange(allFacultyIds);
    } else {
      handleFacultyChange([]);
    }
  };

  const isFacultySelected = (id) => selectedFaculty.includes(id);

  const handleFacultyToggle = (id) => {
    handleFacultyChange((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDepartmentFilterChange = (event) => {
    setDepartmentFilter(event.target.value);
  };

  const filteredFacultyList = facultyList.filter(faculty =>
    (faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.department.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (departmentFilter ? faculty.department === departmentFilter : true)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#01579b', textAlign: 'center' }}>
        Select Faculty
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Search by Name, ID or Department"
            variant="outlined"
            margin="normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography>{`${selectedFaculty.length} selected`}</Typography>
          <FormControl variant="outlined" sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              onChange={handleDepartmentFilterChange}
              label="Department"
              sx={{ height: '55px' }}
            >
              <MenuItem value="">All</MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ height: '350px', overflow: 'auto' }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedFaculty.length > 0 && selectedFaculty.length < filteredFacultyList.length}
                      checked={filteredFacultyList.length > 0 && selectedFaculty.length === filteredFacultyList.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#01579b' }}>Faculty Name</TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#01579b' }}>Faculty ID</TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#01579b' }}>Department</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFacultyList.map((faculty) => (
                  <TableRow key={faculty.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isFacultySelected(faculty.id)}
                        onChange={() => handleFacultyToggle(faculty.id)}
                      />
                    </TableCell>
                    <TableCell>{faculty.name}</TableCell>
                    <TableCell>{faculty.id}</TableCell>
                    <TableCell>{faculty.department}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => handlePopupSubmit(selectedFaculty)}
          color="primary"
          variant="contained"
        >
          Submit
        </Button>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FacultyPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedFaculty: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleFacultyChange: PropTypes.func.isRequired,
  handlePopupSubmit: PropTypes.func.isRequired,
};

export default FacultyPopup;