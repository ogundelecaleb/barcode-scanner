import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./App.css";

function App() {
  const [barcodeData, setBarcodeData] = useState("");
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const [drugInfo, setDrugInfo] = useState("");
  const [fdaInfo, setFdaInfo] = useState("");

  const formatNdcForOpenFda = (ndcCode) => {
    // Remove any existing hyphens
    const strippedNdc = ndcCode.replace(/-/g, "");
    const numStr = strippedNdc.toString();

    let trimmedNumStr = "";

    if (numStr.length === 13) {
      // Remove first 2 characters and last character
      trimmedNumStr = numStr.slice(2, -1);
    } else if (numStr.length === 12) {
      // Remove first and last character
      trimmedNumStr = numStr.slice(1, -1);
    }
    let formattedNdc = "";

    if (trimmedNumStr.length === 10) {
      // 10-digit format to 11-digit (5-4-2)
      formattedNdc = `${trimmedNumStr.slice(0, 4)}-${trimmedNumStr.slice(
        4,
        8
      )}-${trimmedNumStr.slice(8)}`;
    } else if (trimmedNumStr.length === 11) {
      // Already in the correct 11-digit format
      formattedNdc = `${strippedNdc.slice(0, 5)}-${strippedNdc.slice(
        5,
        9
      )}-${strippedNdc.slice(9)}`;
    } else {
      throw new Error("Invalid NDC code length.");
    }

    setDrugInfo(formattedNdc);
    console.log(formattedNdc)

    return formattedNdc;
  };

  const handleScanner = () => {
    console.log(scannerRef.current);
    if (!scannerRef.current) {
      const html5QrcodeScanner = new Html5Qrcode("reader");

      // Start the scanner
      html5QrcodeScanner
        .start(
          { facingMode: "environment" }, // Rear camera
          {
            fps: 10, // Frames per second
            qrbox: { width: 250, height: 250 }, // Scan box size
          },
          (decodedText) => {
            setBarcodeData(decodedText);
            setError(null); // Clear any previous errors
            fetchDrugInfo(decodedText);
            //html5QrcodeScanner.stop(); // Stop scanning after successful scan
          },
          (err) => {
            setError(
              "Scanning error or barcode not detected. Please try again."
            );
            console.log(err);
          }
        )
        .catch((err) => {
          setError("Failed to initialize scanner.");
          // console.error(err);
        });

      scannerRef.current = html5QrcodeScanner; // Store the scanner instance
    }
  };
  const fetchDrugInfo = async (ndcCode) => {
    try {
      const response = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.package_ndc:${formatNdcForOpenFda(
          ndcCode
        )}`
      );
      // const response = await fetch(
      //   `https://api.fda.gov/drug/ndc.json?search=product_ndc:0023-1145-01"`
      // );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setDrugInfo(JSON.stringify(data.results[0]));
        if (scannerRef.current) {
          scannerRef.current.stop();
          scannerRef.current = null;
        }
      } else {
        setFdaInfo(
          `No drug information found for this code.${formatNdcForOpenFda(
            ndcCode
          )}`
        );
      }
    } catch (error) {
      setFdaInfo("Error fetching drug information.");
      // console.error(error);
    }
  };

  useEffect(() => {
    handleScanner();
    //formatNdcForOpenFda("372960020283")
    // // Cleanup on unmount
    // return () => {
    //   if (scannerRef.current) {
    //     scannerRef.current
    //       .stop()
    //       .catch((err) => console.error("Failed to stop scanner", err));
    //   }
    // };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Barcode Scanner</h1>
      <p>Point your camera at a barcode to scan it.</p>

      <div id="reader" style={{ width: "300px", margin: "auto" }}></div>

      {barcodeData && (
        <p>
          Scanned Barcode: <strong>{barcodeData}</strong>
        </p>
      )}
      {drugInfo && (
        <button className="border" onClick={handleScanner}>
          Scan Again
        </button>
      )}

      {error && !drugInfo && <p style={{ color: "red" }}>{error}</p>}
      {fdaInfo && <p style={{ color: "blue" }}>{fdaInfo}</p>}
      {drugInfo && <p style={{ color: "green" }}>{drugInfo}</p>}
    </div>
  );
}

export default App;
