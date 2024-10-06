import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import ReservationsClient from './views/ReservationsClients';
import ReservationsEmploy from './views/ReservationsEmploy';
import EditProfile from './views/EditProfile';


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
