import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Link } from "react-router-dom";

const Barcode = () => {
  const [barcodeData, setBarcodeData] = useState("");
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const [drugInfo, setDrugInfo] = useState(null);
  const [fdaInfo, setFdaInfo] = useState("");
  const [isBarcode, setIsBarcode] = useState(true);

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
    console.log(formattedNdc);

    return formattedNdc;
  };
  function extractCharacters(text) {
    if (text.length >= 16) {
      const trimmedNumStr = text.slice(6, 16);
      let formattedNdc = "";

      if (trimmedNumStr.length === 10) {
        // 10-digit format to 11-digit (5-4-2)
        formattedNdc = `${trimmedNumStr.slice(0, 4)}-${trimmedNumStr.slice(
          4,
          8
        )}-${trimmedNumStr.slice(8)}`;
      } else if (trimmedNumStr.length === 11) {
        // Already in the correct 11-digit format
        formattedNdc = `${trimmedNumStr.slice(0, 5)}-${trimmedNumStr.slice(
          5,
          9
        )}-${trimmedNumStr.slice(9)}`;
      } else {
        throw new Error("Invalid NDC code length.");
      }
      return formattedNdc;
      // Extract characters from index 6 to 15 (7th to 16th characters)
    } else {
      return "Text is too short to extract the desired range.";
    }
  }

  const handleScanner = async () => {
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
            console.log("fetching data atrix", decodedText);

            setError(null); // Clear any previous errors

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

  const fetchDataMatrixDrugInfo = async (ndcCode) => {
    console.log("fetchhiinggggg======>>>>>");
    try {
      const response = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.package_ndc:${extractCharacters(
          ndcCode
        )}`
      );

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setDrugInfo(data.results[0]);
        if (scannerRef.current) {
          scannerRef.current.stop();
          scannerRef.current = null;
        }
      } else {
        setFdaInfo(
          `No drug information found for this code.${extractCharacters(
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
  }, []);

  useEffect(() => {
    console.log("fetching data atrix", barcodeData);

    if (isBarcode) {
      fetchDrugInfo(barcodeData);
    } else {
      console.log("fetching data atrix", barcodeData);
      fetchDataMatrixDrugInfo(barcodeData);
    }
  }, [barcodeData]);

  return (
    <div className=" p-4 md:p-7 relative min-h-screen bg-[#fefefe]">
      <img src="./logo.png" alt="logo" className="h-[40px] md:h-[60px]" />
      {/* <Link
        to="/data-metrics"
        className="px-2 py-1 rounded-lg border absolute top-2 right-1"
      >
        {" "}
        Scan DataMatrix
      </Link> */}

      <button
        // to="/data-metrics"
        onClick={() => setIsBarcode(!isBarcode)}
        className="px-2 py-1 rounded-lg border absolute top-2 right-1"
      >
        {" "}
        {isBarcode ? "Scan DataMatrix" : "Scan Barcode"}
      </button>

      <h1 className="text-[28px] md:text-[38px] text-center font-semibold ">
        Barcode Scanner
      </h1>
      <p className="text-center text-md text-gray-500 mt-1 ">
        {" "}
        Point your camera at a barcode to scan ooh{" "}
      </p>

      <div
        id="reader"
        style={{ width: "300px", margin: "auto" }}
        className="p-2 border rounded-lg border-gray-300"
      ></div>

      {barcodeData && (
        <>
          <p>
            Scanned Barcode: <strong>{barcodeData}</strong>
          </p>
          <p>{`NDC nUMBER: ${extractCharacters(barcodeData)}`}</p>
        </>
      )}
      {drugInfo && (
        <button className="border" onClick={handleScanner}>
          Scan Again
        </button>
      )}

      {error && !drugInfo && (
        <p className="text-center " style={{ color: "red" }}>
          {error}
        </p>
      )}
      {fdaInfo && (
        <p style={{ color: "blue" }}>
          {fdaInfo?.results?.openfda?.brand_name}
        </p>
      )}
      {drugInfo && (<>
        <p style={{ color: "green" }}>Brand Name: {drugInfo?.openfda?.brand_name[0]}</p>
        <p style={{ color: "green" }}>Product NDC: {drugInfo?.openfda?.product_ndc[0]}</p>
        <p style={{ color: "green" }}>Manufacturer Name: {drugInfo?.openfda?.manufacturer_name[0]}</p>

        </> )}
    </div>
  );
};

export default Barcode;
