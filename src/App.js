import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./App.css";
import {
  Routes,
  Route,
  BrowserRouter as Router,
  Navigate,
} from "react-router-dom";
import Barcode from "./sreens/Barcode";
import DataMatrixScanner from "./sreens/DataMetrics";
import DataMatrix from "./sreens/DataMetrics";
import DataMatrix2 from "./DataMetrics copy 2";
import LoginPage from "./login_page";
import DrugLookup from "./sreens/DrugLookup";
import { SnackbarProvider } from "notistack";


function App() {

  return (
    <div className="">
       <SnackbarProvider
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<Barcode />} />
          <Route path="/data-matrix" element={<DataMatrix />} />
          <Route path="/matrix2" element={<DataMatrix2 />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/drug-lookup" element={<DrugLookup />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
