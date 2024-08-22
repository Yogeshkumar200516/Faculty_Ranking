import React, { useState } from 'react';
import Modal from 'react-modal';
import './EventDetails.css';

// For accessibility
Modal.setAppElement('#root');

function EventDetails() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const events = [
    { name: 'Question Paper Set', id: 1, vertical: 'Academics', createdDate: '2024-01-15', info: 'Important event for paper setting.', deadline: '2024-02-15', faculties: 5 },
    { name: 'Skill Training', id: 2, vertical: 'Skill and Special Lab', createdDate: '2024-02-01', info: 'Training for skill development.', deadline: '2024-03-01', faculties: 10 },
    { name: 'Question Paper Set', id: 1, vertical: 'Academics', createdDate: '2024-01-15', info: 'Important event for paper setting.', deadline: '2024-02-15', faculties: 5 },
    { name: 'Skill Training', id: 2, vertical: 'Skill and Special Lab', createdDate: '2024-02-01', info: 'Training for skill development.', deadline: '2024-03-01', faculties: 10 },
    { name: 'Question Paper Set', id: 1, vertical: 'Academics', createdDate: '2024-01-15', info: 'Important event for paper setting.', deadline: '2024-02-15', faculties: 5 },
    { name: 'Skill Training', id: 2, vertical: 'Skill and Special Lab', createdDate: '2024-02-01', info: 'Training for skill development.', deadline: '2024-03-01', faculties: 10 },
    // Add more events as needed
  ];

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="new-grid2">
      <div className="recent">Tasks and Events</div>

      <div className="table-container2">
        {events.length > 0 ? (
          <table className="table2">
            <thead>
              <tr>
                <th style={{ width: '70%' }}>Event Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>
                    <button className="button5" onClick={() => handleViewDetails(event)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-message">
            No Tasks and Events Currently
          </div>
        )}
      </div>

      {/* Modal for Event Details */}
      {selectedEvent && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="modal-content">
            <h2 className="modal-title">Event Details</h2>
            <div className="modal-body">
              <p><strong>Event Name:</strong> {selectedEvent.name}</p>
              <p><strong>Event ID:</strong> {selectedEvent.id}</p>
              <p><strong>Vertical Name:</strong> {selectedEvent.vertical}</p>
              <p><strong>Event Created Date:</strong> {selectedEvent.createdDate}</p>
              <p><strong>Event Info:</strong> {selectedEvent.info}</p>
              <p><strong>Deadline Date:</strong> {selectedEvent.deadline}</p>
              <p><strong>No. of Faculties:</strong> {selectedEvent.faculties}</p>
            </div>
            <button className="modal-close-button" onClick={closeModal}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default EventDetails;
