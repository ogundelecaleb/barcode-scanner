import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { Link } from "react-router-dom";
import axios from "axios"
const DataMatrix2 = () => {
  const [barcodeData, setBarcodeData] = useState("");
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const [drugInfo, setDrugInfo] = useState(null);
  const [scanResult, setScanResult] = useState(null);


  useEffect(() => {
    handleScanner();
  }, []);

  const handleScanner = async () => {
    if (!scannerRef.current) {
      let html5QrcodeScanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: 250,
      });
      html5QrcodeScanner.render(onScanSuccess);

      // Start the scanner

      function onScanSuccess(decodedText, decodedResult) {
        console.log(`Code scanned = ${decodedText}`, decodedResult);

        setBarcodeData(decodedText);
        handleDataMatrixScan(decodedText);
      }
      scannerRef.current = html5QrcodeScanner; // Store the scanner instance
    }
  };

  // Function to parse GTIN and extract NDC, serial, lot, expiry date
  const parseDatamatrix = (barcodeData) => {
    // Initialize variables
    let gtin = "";
    let ndc = "";
    let lot = "";
    let serial = "";
    
    // Remove any FNC1 characters if present (]d2)
    if (barcodeData.startsWith("]d2")) {
      barcodeData = barcodeData.slice(3);
    }
    
    // Parse GTIN (AI=01)
    if (barcodeData.includes("01")) {
      gtin = barcodeData.slice(
        barcodeData.indexOf("01") + 2,
        barcodeData.indexOf("01") + 16
      );
      // Extract NDC from GTIN (positions 4-13)
      ndc = gtin.slice(3, 12);
    }
    
    // Parse Serial Number (AI=21)
    if (barcodeData.includes("21")) {
      const startIdx = barcodeData.indexOf("21") + 2;
      // Find next AI position or end of string
      const nextAiPos = [
        barcodeData.indexOf("01", startIdx),
        barcodeData.indexOf("17", startIdx)
      ].filter(pos => pos !== -1);
      const endIdx = nextAiPos.length ? Math.min(...nextAiPos) : barcodeData.length;
      serial = barcodeData.slice(startIdx, endIdx);
    }
    
    // Parse Lot Number (AI=17)
    if (barcodeData.includes("17")) {
      const startIdx = barcodeData.indexOf("17") + 2;
      // Find next AI position or end of string
      const nextAiPos = [
        barcodeData.indexOf("01", startIdx),
        barcodeData.indexOf("21", startIdx)
      ].filter(pos => pos !== -1);
      const endIdx = nextAiPos.length ? Math.min(...nextAiPos) : barcodeData.length;
      lot = barcodeData.slice(startIdx, endIdx);
    }
    
    return {
      gtin,
      ndc,
      lot,
      serial
    };
  };
  // Convert GTIN-based NDC to a 10-digit format (5-4-1 or other applicable patterns)
  const formatNdc = (ndc) => {
    return `${ndc.slice(0, 5)}-${ndc.slice(5, 9)}-${ndc.slice(9)}`;
  };

  // Fetch drug info from OpenFDA API
  const fetchDrugDetails = async (ndc) => {
    try {
      const response = await axios.get(
        `https://api.fda.gov/drug/ndc.json?search=product_ndc:${ndc}`
      );
      setDrugInfo(response.data.results[0]);
      setError(null);
    } catch (err) {
      setError('Drug information not found.');
      setDrugInfo(null);
    }
  };

  // Handle the data matrix scan and retrieval process
  const handleDataMatrixScan = (gtinData) => {
    try {
      const ans = parseDatamatrix(gtinData);
      console.log("=============++++++++", ans)
      const { gtin, lot, expiry, serial, ndc } = parseDatamatrix(gtinData);

      console.log(`GTIN: ${ans?.gtin}`);
      console.log(`Serial: ${serial}`);
      console.log(`Lot: ${lot}`);
      console.log(`Expiry: ${expiry}`);
      // console.log(`NDC (formatted): ${formattedNdc}`);
      setScanResult({gtin, lot, expiry, serial, ndc })

      // Format the NDC for OpenFDA query
      const formattedNdc = formatNdc(ndc).replace(/-/g, '');

      // Fetch drug information from OpenFDA
      fetchDrugDetails(formattedNdc);

      // Displaying GTIN, Serial, Lot, Expiry
    
    } catch (err) {
      setError("Failed to parse data matrix code.");
    }
  };

 

  return (
    <div className="max-w-2xl mx-auto p-4 relative  bg-[#fefefe] space-y-4">
      <img src="./logo.png" alt="logo" className="h-[40px] md:h-[60px]" />

      <div>
        <div className="space-y-4">
          <Link
            // to="/data-metrix"
            to="/"
           // onClick={() => setIsBarcode(!isBarcode)}
            className="px-2 py-1 rounded-lg border text-[13px] absolute top-5 right-2 hover:bg-[#f4f3f3]"
          >
            Scan Barcode{" "}
            {/* {isBarcode ? "Scan DataMatrix" : "Scan Barcode"} */}
          </Link>

          
          <p className="text-center text-md text-gray-500 mt-1 ">
            {" "}
            Point your camera at a Data Matrix to scan
          </p>

          <div
            id="reader"
            style={{ width: "340px", margin: "auto" }}
            className="p-2 border rounded-lg border-gray-300"
          ></div>

          {barcodeData && (
            <>
              <p>
                Scanned Barcode: <strong>{barcodeData}</strong>
              </p>
              {/* <p>{`NDC nUMBER: ${ndc}`}</p> */}
            </>
          )}
          {drugInfo && (
            <button className="border" onClick={handleScanner}>
              Scan Again
            </button>
          )}

          {error && (
            <p className="text-red-500 text-[14px] leading-3 text-center">
              {error}
            </p>
          )}

       

          {scanResult && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Scan Result:</h3>
              <div className="grid grid-cols-2 gap-1 text-[14px] leading-[14px]">
                <div>Raw Data:</div>
                <div className="break-all">{barcodeData}</div>
                <div>GTIN:</div>
                <div>{scanResult.gtin}</div>
                <div>Serial:</div>
                <div>{scanResult.serial}</div>
                <div>Lot:</div>
                <div>{scanResult.lot}</div>
                <div>Expiry:</div>
                <div>{scanResult.expiry}</div>
                
               
              </div>
            </div>
          )}

          {drugInfo && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Drug Information:</h3>
              <div className="grid grid-cols-2 gap-1 text-[14px] leading-[14px]">
                <div>Brand Name:</div>
                <div>{drugInfo?.openfda?.brand_name[0]}</div>
                <div>Generic Name:</div>
                <div>{drugInfo?.openfda?.generic_name[0]}</div>
                {/* <div>Manufacturer:</div>
                <div>{drugInfo?.openfda?.labeler_name[0]}</div> */}
                {/* <div>Dosage Form:</div>
                <div>{drugInfo?.openfda?.dosage_form[0]}</div> */}
                <div>Route:</div>
                <div>{drugInfo?.openfda?.route[0]}</div>
                <div>Product Type:</div>
                <div>{drugInfo?.openfda?.product_type[0]}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataMatrix2;
