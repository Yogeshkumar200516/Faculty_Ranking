import React, { useEffect, useState } from 'react';
import api from '../api';

const SecureComponent = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await api.get('/secure-endpoint');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>Secure Data</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
};

export default SecureComponent;
