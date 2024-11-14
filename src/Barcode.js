import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";

const Barcode = () => {
  const [barcodeData, setBarcodeData] = useState("");
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const [drugInfo, setDrugInfo] = useState(null);
  const [fdaInfo, setFdaInfo] = useState("");
  const [isBarcode, setIsBarcode] = useState(true);
  const [ndc, setNdc] = useState("");

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
    }

    console.log("///////", formattedNdc);

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
        console.log("Invalid NDC code length.");
      }
      return formattedNdc;
      // Extract characters from index 6 to 15 (7th to 16th characters)
    } else {
      return "Text is too short to extract the desired range.";
    }
  }

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
        fetchBarcodeDrugInfo(decodedResult?.decodedText);

        // if (isBarcode) {
        //   fetchBarcodeDrugInfo(decodedResult?.decodedText);
        // } else {
        //   handleScan(decodedResult?.decodedText);
        // }
      }
      scannerRef.current = html5QrcodeScanner; // Store the scanner instance
    }
  };

  const fetchBarcodeDrugInfo = async (ndcCode) => {
    try {
      console.log("llll==>>>", ndcCode);
      const response = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.package_ndc:${formatNdcForOpenFda(
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

  // const fetchDataMatrixDrugInfo = async (ndcCode) => {
  //   console.log("fetchhiinggggg======>>>>>");
  //   try {
  //     const response = await fetch(
  //       `https://api.fda.gov/drug/label.json?search=openfda.package_ndc:${extractCharacters(
  //         ndcCode
  //       )}`
  //     );

  //     const data = await response.json();

  //     if (data.results && data.results.length > 0) {
  //       setDrugInfo(data.results[0]);
  //       if (scannerRef.current) {
  //         scannerRef.current.stop();
  //         scannerRef.current = null;
  //       }
  //     } else {
  //       setFdaInfo(
  //         `No drug information found for this code.${extractCharacters(
  //           ndcCode
  //         )}`
  //       );
  //     }
  //   } catch (error) {
  //     setFdaInfo("Error fetching drug information.");
  //     // console.error(error);
  //   }
  // };

  useEffect(() => {
    handleScanner();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 relative  bg-[#fefefe] space-y-4">
      <img src="./logo.png" alt="logo" className="h-[40px] md:h-[60px]" />

      {/* <Link
        to="/matrix2"
        onClick={() => setIsBarcode(!isBarcode)}
        className="px-2 py-1 rounded-lg border text-[13px] absolute top-5 right-[160px] hover:bg-[#f4f3f3]"
      >
        Scan DataMatrix2{" "}
      </Link> */}
      <div>
        <div className="space-y-4">
          <Link
            to="/data-metrix"
            onClick={() => setIsBarcode(!isBarcode)}
            className="px-2 py-1 rounded-lg border text-[13px] absolute top-5 right-2 hover:bg-[#f4f3f3]"
          >
            Scan DataMatrix{" "}
            {/* {isBarcode ? "Scan DataMatrix" : "Scan Barcode"} */}
          </Link>

          <h1 className="text-[28px] md:text-[38px] text-center font-semibold ">
            {isBarcode ? "Barcode Scanner" : "Data Matrix Scanner"}
          </h1>
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
              <p>{`NDC nUMBER: ${formatNdcForOpenFda(barcodeData)}`}</p>
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
        <div className="w-full flex justify-center mt-10">
          {" "}
          {drugInfo && (
            <button className="px-2 py-1 rounded-lg border text-[13px]   mx-auto hover:bg-[#f4f3f3]">
              Save Drug Information
              {/* {isBarcode ? "Scan DataMatrix" : "Scan Barcode"} */}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Barcode;
