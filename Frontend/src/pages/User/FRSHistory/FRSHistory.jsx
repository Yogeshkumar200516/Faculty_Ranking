import React, { useState, useEffect, useMemo } from 'react';
import './FRSHistory.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faSearch, faChevronRight, faChevronLeft, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// Function to parse date
function parseDate(dateString) {
  const [day, month, year] = dateString.split('-');
  return new Date(year, month - 1, day);
}

// Function for descending comparator
function descendingComparator(a, b, orderBy) {
  if (orderBy === 'date') {
    return parseDate(b.date) - parseDate(a.date);
  }
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

// Function to get comparator
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Function for stable sort
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// Table header cells
const headCells = [
  { id: 'id', numeric: true, label: 'S.No', className: 'sno' },
  { id: 'date', numeric: false, label: 'Date' },
  { id: 'verticalName', numeric: false, label: 'Vertical Name', className: 'vertical-name' },
  { id: 'reason', numeric: false, label: 'Reason', className: 'reason' },
  { id: 'frsUpdate', numeric: false, label: 'FRS Update' },
  { id: 'action', numeric: false, label: 'Action' },
];

const FRSHistory = ({ user }) => {
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [verticalFilter, setVerticalFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRow, setSelectedRow] = useState(null);
  const [rows, setRows] = useState([]);

  const navigate = useNavigate();

  // Fetch data from backend
  useEffect(() => {
    const facultyId = user.id;
    const token = localStorage.getItem('jwt');
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:4000/frshistory/${facultyId}`,{
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        const data = await response.json();
        setRows(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user.id]);

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle vertical filter change
  const handleVerticalFilterChange = (option) => {
    setVerticalFilter(option.value);
    setPage(0);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => setPage(newPage);

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate('/dashboard');
  };

  // Handle view button click
  const handleViewClick = (row) => {
    setSelectedRow(row);
  };

  // Handle popup close
  const handleClosePopup = () => {
    setSelectedRow(null);
  };

  // Filter and sort rows
  const filteredRows = rows.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).filter(row => {
    if (verticalFilter === 'All') return true;
    return row.verticalName === verticalFilter;
  });

  const visibleRows = useMemo(
    () => stableSort(filteredRows, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, order, orderBy, page, rowsPerPage]
  );

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredRows.length - page * rowsPerPage);

  return (
    <div className="container">
      <div className="toolbar">
        <div className="toolbar-title">
          <FontAwesomeIcon icon={faHistory} className="history-icon" />
          FRS History
        </div>
        <div className="toolbar-actions">
          <div className="search-bar-container">
            <FontAwesomeIcon icon={faSearch} className="search-bar-icon" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-bar"
            />
          </div>
          {/* 
          <Dropdown
            options={verticalOptions}
            onChange={handleVerticalFilterChange}
            value={verticalFilter}
            className="dropdown"
            controlClassName="dropdown-control"
            menuClassName="dropdown-menu"
            arrowClassName="dropdown-arrow"
            placeholder={<FontAwesomeIcon icon={faFilter} className="filter-icon" />}
            arrowClosed={<span className="arrow-closed"></span>}
            arrowOpen={<span className="arrow-open"></span>}
          /> 
          */}
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            {headCells.map((headCell) => (
              <th
                key={headCell.id}
                onClick={() => handleRequestSort(headCell.id)}
                className={headCell.className || ''}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className={order === 'desc' ? 'sorted desc' : 'sorted asc'}></span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, index) => {
            // Calculate the serial number: page index * rowsPerPage + index + 1
            const serialNumber = page * rowsPerPage + index + 1;
            
            return (
              <tr key={row.id}>
                <td className="sno">{serialNumber}</td> {/* Display Serial Number */}
                <td>{row.date}</td>
                <td className="vertical-name">{row.verticalName}</td>
                <td className="reason">{row.reason_info}</td>
                <td className={row.frsUpdate >= 0 ? 'positive' : 'negative'}>{row.frsUpdate}</td>
                <td>
                  <button className="view-button" onClick={() => handleViewClick(row)}>View</button>
                </td>
              </tr>
            );
          })}
          {emptyRows > 0 && (
            <tr style={{ height: 53 * emptyRows }}>
              <td colSpan={6} />
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination">
        <div className="rows-per-page">
          <label>Rows per page:</label>
          <select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
            {[5, 10, 25].map((rowsOption) => (
              <option key={rowsOption} value={rowsOption}>{rowsOption}</option>
            ))}
          </select>
        </div>
        <div className="pagination-controls">
          <button onClick={(event) => handleChangePage(event, page - 1)} disabled={page === 0}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span>{page + 1} of {Math.ceil(filteredRows.length / rowsPerPage)}</span>
          <button onClick={(event) => handleChangePage(event, page + 1)} disabled={page >= Math.ceil(filteredRows.length / rowsPerPage) - 1}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        
      </div>
      <button className="back-button" onClick={handleBackClick}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>

      {selectedRow && (
        <div className="popup-overlay" onClick={handleClosePopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Update Summary</h2>
              <button className="close-button" onClick={handleClosePopup}>x</button>
            </div>
            <div className="popup-content">
              <div className="content">
                <p><strong>Date:</strong></p>
                <p>{selectedRow.date}</p>
              </div>
              <div className="content">
                <p><strong>Vertical Name:</strong></p>
                <p>{selectedRow.verticalName}</p>
              </div>
              <div className="content">
                <p><strong>Reason:</strong></p>
                <p>{selectedRow.reason_info}</p>
              </div>
              <div className="content">
                <p><strong>Reason Info:</strong></p>
                <p>{selectedRow.reason}</p>
              </div>
              <div className="content">
                <p><strong>FRS Update:</strong></p>
                <p className={selectedRow.frsUpdate >= 0 ? 'positive' : 'negative'}>{selectedRow.frsUpdate}</p>
              </div>
              <div className="popup-footer">
                <button className="ok-button" onClick={handleClosePopup}>OK</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

FRSHistory.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default FRSHistory;
