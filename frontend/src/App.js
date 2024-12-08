import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Performance from "./components/performanceComponent"
import Notification from "./components/notificationComponent"
import Feedback  from './components/feedbackComponent';
import Menu from './components/menuComponent'
import PaymentManagement from './components/paymentComponent';
import './index.css';
import Ai from "./components/aiComponent"
import Res from "./components/reservation"
const App = () => {
  return (
<PaymentManagement/>
  );
};

export default App;
