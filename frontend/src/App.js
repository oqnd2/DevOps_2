import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import ReservationsClient from './ReservationsClients';
import ReservationsEmploy from './ReservationsEmploy';


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' Component={Home} />
        <Route path='/login' Component={Login} />
        <Route path='/reservations-clients' Component={ReservationsClient} />
        <Route path='/reservations-employ' Component={ReservationsEmploy} />
      </Routes>
    </Router>
  )
}

export default App;
