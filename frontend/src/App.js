import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import ReservationsClient from './ReservationsClients';
import ReservationsEmploy from './ReservationsEmploy';
import EditProfile from './EditProfile';


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' Component={Home} />
        <Route path='/login' Component={Login} />
        <Route path='/register' Component={Register} />
        <Route path='/reservations-clients' Component={ReservationsClient} />
        <Route path='/reservations-employ' Component={ReservationsEmploy} />
        <Route path='/edit-profile' Component={EditProfile} />
      </Routes>
    </Router>
  )
}

export default App;
