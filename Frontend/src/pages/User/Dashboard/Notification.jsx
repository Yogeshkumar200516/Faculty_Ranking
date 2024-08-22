// import React, { useState } from "react";
// import './Notification.css';
// import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// function Notification() {
//     // Sample tasks data
//     const tasks = [
//         { name: "Question Paper Set", info: "A set of Questions paper should be prepared", deadline: "16-08-2024" },
//         { name: "Skill Training", info: "Skill training should be given for 2nd tear students", deadline: "15-08-2024" },
//         // Add more tasks here if needed
//     ];

//     const [currentIndex, setCurrentIndex] = useState(0);

//     // Function to handle next task
//     const handleNextTask = () => {
//         setCurrentIndex((prevIndex) => (prevIndex + 1) % tasks.length);
//     };

//     // Function to handle previous task
//     const handlePreviousTask = () => {
//         setCurrentIndex((prevIndex) => (prevIndex - 1 + tasks.length) % tasks.length);
//     };

//     return (
//         <div className="notification-container">
//             {tasks.length > 0 ? (
//                 <div className="task-details">
//                     {tasks.length > 1 && <FaArrowLeft onClick={handlePreviousTask} className="arrow-icon" />}
//                     <div className="task-content">
//                         <h2>{tasks[currentIndex].name}</h2>
//                         <p>{tasks[currentIndex].info}</p>
//                         <p><strong>Deadline:</strong> {tasks[currentIndex].deadline}</p>
//                     </div>
//                     {tasks.length > 1 && <FaArrowRight onClick={handleNextTask} className="arrow-icon" />}
//                 </div>
//             ) : (
//                 <div className="no-tasks">
//                     <p>You have no tasks currently</p>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default Notification;
 import React from "react";
import './Notification.css';


function Notification() {


    return (
        <div className="notification-container">
            <div className="notification">
                All FRS updates from each vertical will be notified and further details will be circulated through Mail from the corresponding verticals.
            </div>
            {/* {tasks.length > 0 ? (
                <div className="task-details">
                    {tasks.length > 1 && <FaArrowLeft onClick={handlePreviousTask} className="arrow-icon" />}
                    <div className="task-content">
                        <h2>{tasks[currentIndex].name}</h2>
                        <p>{tasks[currentIndex].info}</p>
                        <p><strong>Deadline:</strong> {tasks[currentIndex].deadline}</p>
                    </div>
                    {tasks.length > 1 && <FaArrowRight onClick={handleNextTask} className="arrow-icon" />}
                </div>
            ) : (
                <div className="no-tasks">
                    <p>You have no tasks currently</p>
                </div>
            )} */}
        </div>
    );
}

export default Notification;
