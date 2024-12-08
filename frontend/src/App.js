import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Performance from "./components/performanceComponent";
import Notification from "./components/notificationComponent";
import Feedback from './components/feedbackComponent';
import Menu from './components/menuComponent';
import PaymentManagement from './components/paymentComponent';
import './index.css';
import Ai from "./components/aiComponent";
import Res from "./components/reservation";
import Nav from './components/navBar';

const App = () => {
  return (
    <Router>
      {/* Navbar will be displayed on all pages */}
      <Nav />

      {/* Define Routes for the pages */}
      <Routes>
        {/* Correcting the path */}
        <Route path="/Feedback" element={<Feedback />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/payment-management" element={<PaymentManagement />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/chatbot" element={<Ai />} />
        <Route path="/reservation" element={<Res />} />
        {/* Add any other routes here */}
      </Routes>
    </Router>
  );
};

export default App;
