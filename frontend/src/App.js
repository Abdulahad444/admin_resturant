import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';  // AdminPanel Component
import CreateUser from './components/UserComponent';  // CreateUser Component
import ViewUser from './components/ViewUser'
import DeleteUser from './components/DeleteUser';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminPanel />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/view-user" element={<ViewUser />} />
        <Route path="/delete-user" element={<DeleteUser />} />
      </Routes>
    </Router>
  );
};

export default App;
