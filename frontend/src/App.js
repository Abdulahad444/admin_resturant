import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Performance from "./components/performanceComponent"
import Notification from "./components/notificationComponent"
import Feedback  from './components/feedbackComponent';
import Menu from './components/menuComponent'
import './index.css';
const App = () => {
  return (
<Menu />
  );
};

export default App;
