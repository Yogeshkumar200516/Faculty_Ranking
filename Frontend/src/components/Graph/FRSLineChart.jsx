
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function FRSLineChart({ data }) {
  // Determine the current semester
  const currentMonth = new Date().getMonth() + 1; // +1 because getMonth() returns 0-11
  const isEvenSemester = currentMonth <= 6;

  // Filter data for the current semester
  const filteredData = data.filter(item => {
    const month = parseInt(item.month.split('-')[1], 10);
    return isEvenSemester ? month <= 6 : month > 6;
  });

  const chartData = {
    labels: filteredData.map(d => format(new Date(`${d.month}-01`), 'MMMM')), // Format month to full month name
    datasets: [{
      label: 'FRS Points',
      data: filteredData.map(d => d.score),
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly FRS Score',
        font: {
          size: 22,
          weight: 'bold',
        },
        color: '#333',
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `Score: ${tooltipItem.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Score'
        }
      }
    }
  };

  return (
    <Line data={chartData} options={options} />
  );
}

FRSLineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired
    })
  ).isRequired
};

export default FRSLineChart;
