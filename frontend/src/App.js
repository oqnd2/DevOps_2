import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MyNavbar from './components/myNavbar';


function App() {
  const [data, setData] = useState([]);

  useEffect(() => {

    // Obtener los datos de la base de datos
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/data');
        setData(response.data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <div>
        <MyNavbar />
          
      </div>
      <header className="App-header">
        
      </header>
      <body>
      <h2>Datos de MySQL:</h2>
        <ul>
          {data.map(item => (
            <li key={item.id}>{item.name} {item.last_name} {item.phone} {item.role}</li>
          ))}
        </ul>
      </body>
    </div>
  );
}

export default App;
