import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import FacultyPopup from './FacultyPopup'; // Adjust the path as needed

const TextFields = ({
  formData,
  handleChange,
  handlePopupSubmit,
  handleFacultyChange,
  handleDropdownOpen,
  handleIdDropdownOpen,
  showPopup,
  showDropdown,
  showIdDropdown,
  filteredFacultyList,
  filteredIdList,
}) => {
  const handlePopupOpen = () => {
    // Implement this function or remove if not needed
  };

  const handlePopupClose = () => {
    // Implement this function or remove if not needed
  };

  return (
    <>
      <TextField
        fullWidth
        label="Faculty Name"
        name="facultyName"
        value={formData.facultyName}
        onChange={handleChange}
        onClick={showDropdown ? handleDropdownOpen : showPopup ? handlePopupOpen : null}
        variant="outlined"
        margin="normal"
      />
      <TextField
        fullWidth
        label="Faculty ID"
        name="facultyID"
        value={formData.facultyID}
        onChange={handleChange}
        onClick={showIdDropdown ? handleIdDropdownOpen : showPopup ? handlePopupOpen : null}
        variant="outlined"
        margin="normal"
      />
      <TextField
        fullWidth
        label="FRS"
        name="frs"
        value={formData.frs}
        onChange={handleChange}
        variant="outlined"
        margin="normal"
      />
      <TextField
        fullWidth
        label="Reason Title"
        name="reason"
        value={formData.reason}
        onChange={handleChange}
        variant="outlined"
        margin="normal"
      />
      <TextField
        fullWidth
        label="Reason"
        name="reasonTitle"
        value={formData.reasonTitle}
        onChange={handleChange}
        variant="outlined"
        margin="normal"
        multiline
        rows={2}
      />

      <FacultyPopup
        open={showPopup}
        onClose={handlePopupClose}
        selectedFaculty={formData.facultyID ? [formData.facultyID] : []}
        handleFacultyChange={(selectedFaculty) => handleChange({ target: { name: 'facultyID', value: selectedFaculty[0] } })}
        handlePopupSubmit={(selectedFaculty) => {
          handleChange({ target: { name: 'facultyID', value: selectedFaculty[0] } });
          handlePopupClose();
        }}
        filteredFacultyList={filteredFacultyList}
      />
    </>
  );
};

TextFields.propTypes = {
  formData: PropTypes.shape({
    facultyName: PropTypes.string.isRequired,
    facultyID: PropTypes.string.isRequired,
    frs: PropTypes.string.isRequired,
    reasonTitle: PropTypes.string.isRequired,
    reason: PropTypes.string.isRequired,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  handlePopupSubmit: PropTypes.func.isRequired,
  handleFacultyChange: PropTypes.func.isRequired,
  handleDropdownOpen: PropTypes.func, // Ensure it is defined in parent
  handleIdDropdownOpen: PropTypes.func, // Ensure it is defined in parent
  showPopup: PropTypes.bool.isRequired,
  showDropdown: PropTypes.bool.isRequired,
  showIdDropdown: PropTypes.bool.isRequired,
  filteredFacultyList: PropTypes.array.isRequired,
  filteredIdList: PropTypes.array.isRequired,
};

export default TextFields;
