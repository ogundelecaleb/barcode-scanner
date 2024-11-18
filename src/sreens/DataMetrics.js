import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";
import { ClipLoader } from "react-spinners";
import NormalInputField from "../components/NormalInputField";
import NormalSelectInputField from "../components/NormalSelectInputField";
import { enqueueSnackbar } from "notistack";
import api from "../api";
import Header from "../components/Header";
import Footer from "../components/Footer";

const DataMatrix = () => {
  const [barcodeData, setBarcodeData] = useState("");
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const [drugInfo, setDrugInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBarcode, setIsBarcode] = useState(true);
  const [ndc, setNdc] = useState("");
  const [po, setPo] = useState("");
  const [lot, setLot] = useState("");
  const [expiration, setExpiration] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [numOfContainers, setNumOfContainers] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [coaAdjustment, setCoaAdjustment] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [gtin, setGtin] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("")


  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const [rawData, setRawData] = useState("");

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
        //console.log(`Code scanned = ${decodedText}`, decodedResult);

        setBarcodeData(decodedText);
        handleScan(decodedResult?.decodedText);
      }
      scannerRef.current = html5QrcodeScanner; // Store the scanner instance
    }
  };

  const GS1_AIS = {
    "00": { name: "SSCC", length: 18 },
    "01": { name: "GTIN", length: 14 },
    10: { name: "BATCH/LOT", lengthType: "variable", maxLength: 20 },
    11: { name: "PROD_DATE", length: 6 },
    17: { name: "EXP_DATE", length: 6 },
    21: { name: "SERIAL", lengthType: "variable", maxLength: 20 },
    30: { name: "VAR_COUNT", lengthType: "variable", maxLength: 8 },
    310: { name: "NET_WEIGHT_KG", length: 6 },
    400: { name: "ORDER_NUMBER", lengthType: "variable", maxLength: 30 },
    415: { name: "GLN_PAY_TO", length: 13 },
  };

  // Function to validate check digit for GTIN
  const validateGTINCheckDigit = (gtin) => {
    if (gtin.length !== 14) return false;

    let sum = 0;
    const checkDigit = parseInt(gtin[13]);

    for (let i = 0; i < 13; i++) {
      const digit = parseInt(gtin[i]);
      sum += digit * (i % 2 === 0 ? 3 : 1);
    }

    const calculatedCheck = (10 - (sum % 10)) % 10;
    return calculatedCheck === checkDigit;
  };

  // Function to parse and validate date
  const parseGS1Date = (dateStr) => {
    try {
      const year = parseInt(dateStr.substring(0, 2));
      const month = parseInt(dateStr.substring(2, 4));
      const day = parseInt(dateStr.substring(4, 6));

      // Determine century (assume 20xx for years 00-49, 19xx for 50-99)
      const fullYear = year + (year < 50 ? 2000 : 1900);

      // Validate date
      const date = new Date(fullYear, month - 1, day);
      if (
        date.getFullYear() !== fullYear ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        //console.log("Invalid date");
      }

      return date.toISOString().split("T")[0];
    } catch (error) {
      //console.log(`Invalid date format: ${dateStr}`);
    }
  };

  const parseDataMatrix = (data) => {
    const parsedData = {
      gtin: "",
      serial: "",
      lot: "",
      expiry: "",
      productionDate: "",
      additionalData: {},
      raw: data,
    };

    try {
      // Handle different separator characters
      const separators = ["\u001D", "\u001E", "\u001F", "\u0004"];
      let segments = [data];

      for (const separator of separators) {
        if (data.includes(separator)) {
          segments = data.split(separator);
          break;
        }
      }

      // Process each segment
      for (let segment of segments) {
        // Skip empty segments
        if (!segment) continue;

        // Find matching AI
        let foundAI = null;
        let aiLength = 2;

        // Try 2-digit and 3-digit AIs
        for (const [ai, info] of Object.entries(GS1_AIS)) {
          if (segment.startsWith(ai)) {
            foundAI = { ai, ...info };
            aiLength = ai.length;
            break;
          }
        }

        if (!foundAI) {
          continue;
        }

        // Extract value based on AI definition
        const value =
          foundAI.lengthType === "variable"
            ? segment.substring(aiLength).split(/[\u001D\u001E\u001F\u0004]/)[0]
            : segment.substring(aiLength, aiLength + foundAI.length);

        // Validate and store the value
        switch (foundAI.ai) {
          case "01": // GTIN
            if (!validateGTINCheckDigit(value)) {
              //console.log("Invalid GTIN check digit");
            }
            parsedData.gtin = value;
            break;

          case 21: // Serial
            if (value.length > 20) {
              //console.log("Serial number too long");
            }
            parsedData.serial = value;
            break;

          case "10": // Lot/Batch
            if (value.length > 20) {
              //console.log("Lot number too long");
            }
            parsedData.lot = value;
            break;

          case "17": // Expiry
            parsedData.expiry = parseGS1Date(value);
            break;

          case "11": // Production Date
            parsedData.productionDate = parseGS1Date(value);
            break;

          default:
            // Store other values in additionalData
            parsedData.additionalData[foundAI.name] = value;
        }
      }

      // Validate required fields
      if (!parsedData.gtin) {
        //console.log("GTIN is required but not found");
      }

      return parsedData;
    } catch (error) {
      //console.log(`Data matrix parsing error: ${error.message}`);
    }
  };

  // Convert GTIN to NDC with format validation
  const gtinToNDC = (gtin) => {
    try {
      // Remove the first 3 digits (packaging level) and check digit
      const ndcPart = gtin.substring(3, 13);

      // Validate numeric
      if (!/^\d{10}$/.test(ndcPart)) {
        //console.log("Invalid NDC format");
      }

      // Try different NDC formats (5-4-1, 5-3-2, 4-4-2)
      const formats = [
        { parts: [4, 4, 2] },
        { parts: [5, 4, 1] },
        { parts: [5, 3, 2] },
      ];

      for (const format of formats) {
        let position = 0;
        const parts = [];

        for (const length of format.parts) {
          parts.push(ndcPart.substring(position, position + length));
          position += length;
        }

        // Return first valid format
        const ndc = parts.join("-");
        if (position === 10) {
          return ndc;
        }
      }

      //console.log("Could not determine NDC format");
    } catch (error) {
      //console.log(`NDC conversion error: ${error.message}`);
    }
  };

  // Fetch drug info from OpenFDA with enhanced error handling
  const fetchDrugInfo = async (ndc) => {
    try {
      const response = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.package_ndc:${ndc}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        //console.log(errorData.error?.message || "API request failed");
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        //console.log("Drug not found in OpenFDA database");
      }
      if (data.results || data.results.length > 0) {
        // if (scannerRef.current) {
        //   scannerRef.current.stop();
        //   scannerRef.current = null;
        // }
        setName(data.results[0]?.openfda?.brand_name[0]);
      }

      return data.results[0];
    } catch (error) {
      if (error.message.includes("API request failed")) {
        //console.log("OpenFDA API error: " + error.message);
      }
      //console.log("Failed to fetch drug information: " + error.message);
    }
  };

  // Handle camera scan
  const handleScan = async (ScanData) => {
    setScanning(true);

    try {
      //ScanData = "01123456789012340921123456\u001D17240531\u001D10ABC123\u001D11240125";
      setRawData(ScanData);

      const parsedData = parseDataMatrix(ScanData);
      setExpiration(parsedData.expiry);
      setLot(parsedData.lot);
      setGtin(parsedData.gtin);
      setSerialNumber(parsedData.serial);
      setScanResult(parsedData);

      const ndcc = gtinToNDC(parsedData.gtin);
      setNdc(ndcc);

      const drugData = await fetchDrugInfo(ndcc);
      //console.log("=====>>>", drugData);

      setDrugInfo(drugData);
    } catch (error) {
      setError(error.message);
    } finally {
      setScanning(false);
    }
  };

  async function handleCreateDrug(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.createMedication({
        name,
        gtin,
        ndc,
        unit,
        lot,
        coaAdjustment,
        expiration,
        serialNumber,
        numOfContainers,
        po,
        quantity,
        price
      });

      enqueueSnackbar(response.message, { variant: "success" });
      setIsLoading(false);
    } catch (e) {
      enqueueSnackbar(e.message, { variant: "error" });
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 relative  bg-[#fefefe] space-y-6">
      <Header />

      <div className="mt-8">
        <div className=" space-y-6">
          <h1 className="mt-[48px] text-[28px] md:text-[34px] text-center font-semibold ">
            Data Matrix Scanner
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
              <p className="text-md leading-[17px]">
                Scanned Barcode: <strong>{barcodeData}</strong>
              </p>
              <p className="text-md leading-[17px]">{`NDC Number: ${ndc}`}</p>
            </>
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
                <div className="break-all">{rawData}</div>
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
      <form
        onSubmit={handleCreateDrug}
        className="px-3 md:px-5 py-3 text-[14px] space-y-4 mt-4"
      >
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          <NormalInputField
            title="Medication Name"
            isRequired={true}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <NormalSelectInputField
            title="Grade"
            values={["USP", "FCC", "NF", "BP", "EP", "JP"]}
            value={gtin}
            onChange={(e) => setGtin(e.target.value)}
            isRequired={true}
          />
          <NormalInputField
            title="NDC"
            isRequired={true}
            type="text"
            value={ndc}
            onChange={(e) => setNdc(e.target.value)}
          />
          <NormalInputField
            title="LOT"
            isRequired={true}
            type="text"
            value={lot}
            onChange={(e) => setLot(e.target.value)}
          />
          <NormalInputField
            title="PO"
            isRequired={true}
            type="text"
            value={po}
            onChange={(e) => setPo(e.target.value)}
          />
          <NormalInputField
            title="Serial Number"
            isRequired={true}
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
          <NormalInputField
            title="Expiration Date"
            isRequired={true}
            type="date"
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
          />
          <NormalInputField
            title="Quantity"
            isRequired={true}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <NormalInputField
            title="Number of containers"
            isRequired={true}
            type="number"
            value={numOfContainers}
            onChange={(e) => setNumOfContainers(e.target.value)}
          />
           <NormalInputField
            title="Price"
            isRequired={true}
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <NormalSelectInputField
            onChange={(e) => setUnit(e.target.value)}
            title="Select unit"
            isRequired={true}
            value={unit}
            values={["GM", "MG", "MCG", "ML"]}
          />
          <NormalInputField
            title="CoA Adjustment %"
            isRequired={true}
            type="number"
            value={coaAdjustment}
            onChange={(e) => setCoaAdjustment(e.target.value)}
          />

          <NormalInputField
            title="CoA Document"
            isRequired={false}
            type="file"
            onChange={(e) => setCoaAdjustment(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <div className="text-[14px] font-semibold py-1 text-red-500">
            {error}
          </div>

          <button
            className="bg-[#00B0AD] py-3 px-3 disabled:cursor-not-allowed disabled:bg-primary-light disabled:text-primary shadow-md font-semibold flex items-center justify-center text-white rounded-[8px] text-[14px]"
            type={"submit"}
            // disabled={isLoading}
          >
            {isLoading ? (
              <ClipLoader color="white" size={16} />
            ) : (
              "Add Medication +"
            )}
          </button>
        </div>
      </form>
      <Footer/>
    </div>
  );
};

export default DataMatrix;
