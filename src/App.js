import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./App.css";
import {
  Routes,
  Route,
  BrowserRouter as Router,
  Navigate,
} from "react-router-dom";
import Barcode from "./Barcode";
import DataMatrixScanner from "./DataMetrics";

function App() {
  return (
    <div className="">
      <Router>
        <Routes>
          <Route path="/" element={<Barcode />} />
          <Route path="/data-metrics" element={<DataMatrixScanner />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
