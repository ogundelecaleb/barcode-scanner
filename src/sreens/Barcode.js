import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Camera, LogOut } from "lucide-react";
import api from "../api";
import NormalInputField from "../components/NormalInputField";
import NormalSelectInputField from "../components/NormalSelectInputField";
import { ClipLoader } from "react-spinners";
import { enqueueSnackbar } from "notistack";
import Header from "../components/Header";

const Barcode = () => {
  const [barcodeData, setBarcodeData] = useState("");
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const [drugInfo, setDrugInfo] = useState(null);
  const [fdaInfo, setFdaInfo] = useState("");
  const [isBarcode, setIsBarcode] = useState(true);
  const [ndc, setNdc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const navigate = useNavigate();

  useEffect(() => {
    handleScanner();
  }, []);
  let userData = localStorage.getItem("auth");
  console.log(userData);
  if (!userData) {
    return <Navigate to="/login" />;
  } else {
    console.log("Valid token");
  }

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

    //console.log("///////", formattedNdc);

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
        setName(data.results[0]?.openfda?.brand_name[0]);
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

  async function handleCreateDrug(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.createMedication({
        name,
        gtin,
        unit,
        ndc: formatNdcForOpenFda(barcodeData) || ndc,
        lot,
        coaAdjustment,
        expiration,
        serialNumber,
        numOfContainers,
        po,
        quantity,
      });

      enqueueSnackbar(response.message, { variant: "success" });
      setIsLoading(false);
    } catch (e) {
      enqueueSnackbar(e.message, { variant: "error" });
      console.error("Error updating applicant: ", e);
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 relative  bg-[#fefefe] space-y-4">
     <Header/>
      <div>
        <div className="space-y-4">
         

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
          {/* {drugInfo && (
            <button className="border" onClick={handleScanner}>
              Scan Again
            </button>
          )} */}

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
        className="px-5 py-3 text-[14px] space-y-4 mt-4"
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
            value={formatNdcForOpenFda(barcodeData) || ndc}
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
    </div>
  );
};

export default Barcode;
