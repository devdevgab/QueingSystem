// src/App.js
import React from "react";
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import NavigationBar from "./components/NavigationBar";
import Home from "./components/Home";
import Login from "./components/Login";
import DisplayTransactionPage from './components/DisplayTransactionPage';
import MyTransactionPage from './components/MyTransactionPage';
import ComputerOperatorPage from './components/ComputerOperatorPage';
import AccessibilityMenu from './components/AccessibilityMenu';
// import About from "./pages/About";
// import Contact from "./pages/Contact";
import './css/global.css';

const App = () => {
  return (
    <ThemeProvider>
      <div className="app">
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/transactions" element={<DisplayTransactionPage />} />
          <Route path="/mytransactions" element={<MyTransactionPage />} />
          <Route path="/computer-operator" element={<ComputerOperatorPage />} />
          {/* <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} /> */}
        </Routes>
        <AccessibilityMenu />
      </div>
    </ThemeProvider>
  );
};

export default App;
