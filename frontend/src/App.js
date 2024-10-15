import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import Reservations from './views/Reservations';
import EditProfile from './views/EditProfile';


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' Component={Home} />
        <Route path='/login' Component={Login} />
        <Route path='/register' Component={Register} />
        <Route path='/reservations' Component={Reservations} />
        <Route path='/edit-profile' Component={EditProfile} />
      </Routes>
    </Router>
  )
}

export default App;
