import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);


  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/users/');
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>QuantumCommerce Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.full_name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;