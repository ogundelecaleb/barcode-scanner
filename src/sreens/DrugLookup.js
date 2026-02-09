import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ClipLoader } from "react-spinners";
import { enqueueSnackbar } from "notistack";
import Header from "../components/Header";
import Footer from "../components/Footer";

const DrugLookup = () => {
  const [scannedCode, setScannedCode] = useState("");
  const [drugDetails, setDrugDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem("auth");
    if (!userData) {
      navigate("/login");
    } else {
      handleScanner();
    }
  }, []);

  const handleScanner = () => {
    if (!scannerRef.current) {
      const html5QrcodeScanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: 250,
      });
      
      html5QrcodeScanner.render(onScanSuccess);
      scannerRef.current = html5QrcodeScanner;
    }
  };

  const onScanSuccess = (decodedText) => {
    setScannedCode(decodedText);
    fetchDrugDetails(decodedText);
  };

  const fetchDrugDetails = async (drugId) => {
    setIsLoading(true);
    try {
      const response = await api.getDrugDetails({ drugId });
      setDrugDetails(response[0]);
      enqueueSnackbar("Drug details fetched successfully", { variant: "success" });
      
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (error) {
      enqueueSnackbar(error.message || "Error fetching drug details", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanAgain = () => {
    setScannedCode("");
    setDrugDetails(null);
    handleScanner();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[#fefefe] space-y-6">
      <Header />
      <div className="mt-8">
        <h1 className="mt-[48px] text-[28px] md:text-[38px] text-center font-semibold">
          Drug Lookup Scanner
        </h1>
        <p className="text-center text-md text-gray-500 mt-1">
          Scan barcode to view drug details
        </p>

        {drugDetails && !scannerRef.current && (
          <div className="flex justify-center w-full mb-2">
            <button
              className="border px-3 py-1 text-md mx-auto rounded-lg"
              onClick={handleScanAgain}
            >
              Scan Again
            </button>
          </div>
        )}

        <div
          id="reader"
          style={{ width: "340px", margin: "auto" }}
          className="p-2 border rounded-lg border-gray-300"
        ></div>

        {scannedCode && (
          <p className="text-[14px] mt-3 text-center">
            Scanned Code: <strong>{scannedCode}</strong>
          </p>
        )}

        {isLoading && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <ClipLoader color="#00B0AD" size={16} />
            <p className="text-[#00B0AD] text-[14px]">Fetching Drug Details...</p>
          </div>
        )}

        {drugDetails && (
          <div className="mt-6 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">{drugDetails.name}</h3>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900">{drugDetails.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">NDC:</span>
                    <span className="font-medium text-gray-900">{drugDetails.ndc}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Lot:</span>
                    <span className="font-medium text-gray-900">{drugDetails.lot}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Serial Number:</span>
                    <span className="font-medium text-gray-900">{drugDetails.serial_number}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Inventory Details</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium text-gray-900">{drugDetails.quantity} {drugDetails.unit}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Original Qty:</span>
                    <span className="font-medium text-gray-900">{drugDetails.original_quantity} {drugDetails.unit}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Containers:</span>
                    <span className="font-medium text-gray-900">{drugDetails.num_of_containers}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Expiration:</span>
                    <span className="font-medium text-gray-900">{new Date(drugDetails.expiration).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Additional Information</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-[#00B0AD]">${(drugDetails.price / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">PO:</span>
                    <span className="font-medium text-gray-900">{drugDetails.po}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">GTIN:</span>
                    <span className="font-medium text-gray-900">{drugDetails.gtin}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">CoA Adjustment:</span>
                    <span className="font-medium text-gray-900">{drugDetails.coa_adjustment}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DrugLookup;
