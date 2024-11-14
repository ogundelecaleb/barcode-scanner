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
import DataMatrix from "./DataMetrics";
import DataMatrix2 from "./DataMetrics copy 2";

function App() {
  return (
    <div className="">
      <Router>
        <Routes>
          <Route path="/" element={<Barcode />} />
          <Route path="/data-metrix" element={<DataMatrix />} />
          <Route path="/matrix2" element={<DataMatrix2 />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
