import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {  useNavigate } from "react-router-dom";
import api from "../api";
import NormalInputField from "../components/NormalInputField";
import NormalSelectInputField from "../components/NormalSelectInputField";
import { ClipLoader } from "react-spinners";
import { enqueueSnackbar } from "notistack";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Barcode = () => {
  const [barcodeData, setBarcodeData] = useState("");
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const [drugInfo, setDrugInfo] = useState(null);
  const [fdaInfo, setFdaInfo] = useState("");
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
  const [price, setPrice] = useState("");
  const [isDrugLoading, setIsDrugLoading] = useState(false)
    const [inventoryType, setInventoryType] = useState("Medication")

  const navigate = useNavigate();

  let userData = localStorage.getItem("auth");

  useEffect(() => {
    if (!userData) {
      navigate("/login");
    } else {
      handleScanner();
    }
  }, []);


  function clearForm(){
    setBarcodeData("");
    setError(null);
    setDrugInfo(null);
    setFdaInfo("");
    setNdc("");
    setPo("");
    setLot("");
    setExpiration("");
    setManufacturer("");
    setNumOfContainers("");
    setSerialNumber("");
    setCoaAdjustment("");
    setName("");
    setQuantity("");
    setGtin("");
    setUnit("");
    setPrice("");
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

    ////console.log("///////", formattedNdc);

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
        //console.log("Invalid NDC code length.");
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
        //console.log(`Code scanned = ${decodedText}`, decodedResult);

        setBarcodeData(decodedText);
        fetchBarcodeDrugInfo(decodedResult?.decodedText);
      }
      scannerRef.current = html5QrcodeScanner; // Store the scanner instance
    }
  };

  const fetchBarcodeDrugInfo = async (ndcCode) => {
    setIsDrugLoading(true)
    try {
      //console.log("llll==>>>", ndcCode);
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
          scannerRef.current.clear();
          scannerRef.current = null;
        }
        setIsDrugLoading(false)
      } else {
        setFdaInfo(
          `No drug information found for this code.${formatNdcForOpenFda(
            ndcCode
          )}`
        );
        setIsDrugLoading(false)
      }
    } catch (error) {
      setFdaInfo("Error fetching drug information.");
      setIsDrugLoading(false)
      // //console.error(error);
    }
  };
   const isButtonNotActive =
    !name ||
    // !gtin ||
    !ndc ||
    !lot ||
    // !coaAdjustment ||
    !expiration ||
    !serialNumber ||
    !quantity ||
    // !unit ||
    !numOfContainers ||
    !price ||
    !po || 
    !inventoryType;

  async function handleCreateDrug(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.createMedication(
          {
          name,
          gtin: !gtin ? "NA" : gtin,
        ndc: formatNdcForOpenFda(barcodeData) || ndc,
          lot,
          coaAdjustment: !coaAdjustment ? "NA" : coaAdjustment,
          expiration,
          serialNumber,
          quantity,
          unit: !unit ? "NA" : unit,
          numOfContainers,
          po,
          price,
          type: inventoryType
        },
        
      );

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
        <div className=" space-y-">
          <h1 className="mt-[48px] text-[28px] md:text-[38px] text-center font-semibold ">
            {"Barcode Scanner"}
          </h1>
          <p className="text-center text-md text-gray-500 mt-1 ">
            {" "}
            Point your camera at a Data Matrix to scan
          </p>
          {drugInfo && !scannerRef.current && (
            <div className="flex justify-center w-full mb-2">
              <button
                className="border px-3 py-1 text-md mx-auto rounded-lg"
                onClick={() => {
                  handleScanner();
                  clearForm();
                }}
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

          {barcodeData && (
            <>
              <p className="text-[14px] mt-3">
                Scanned Barcode: <strong>{barcodeData}</strong>
              </p>
              <p className="mt-1 mb-2 text-[14px]">{`NDC Number: ${formatNdcForOpenFda(barcodeData)}`}</p>
            </>
          )}

          {error && (
            <p className="text-red-500 text-[14px] leading-3 text-center">
              {error}
            </p>
          )}

          {isDrugLoading && (
            <div className="flex justify-center items-center gap-2"><ClipLoader color="#00B0AD" size={16} /><p className="text-[#00B0AD] text-[14px] ">Fetching Drug Info...</p></div>
                          

          )}

          {drugInfo && (
            <div className="space-y-2 mt-4">
              <h3 className="text-base font-semibold">Drug Information:</h3>
              <div className="grid grid-cols-2 gap-1 text-[14px] leading-[14px]">
                <div>Brand Name:</div>
                <div>{drugInfo?.openfda?.brand_name[0]}</div>
                <div>Generic Name:</div>
                <div>{drugInfo?.openfda?.generic_name[0]}</div>
                
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
           <NormalSelectInputField 
              title="Inventory type"
              values={["Medication", "Item"]}
              onChange={(e) => setInventoryType(e.target.value)}
              isRequired={true}
              value={inventoryType}
            />

            <NormalInputField
              title={`${inventoryType} Name`}
              isRequired={true}
              type="text"
              onChange={(e) => setName(e.target.value)}
            />
         

         {
              inventoryType === "Item" ? null :
              <NormalSelectInputField 
                title="Grade"
                values={["USP", "FCC", "NF", "BP", "EP", "JP"]}
                onChange={(e) => setGtin(e.target.value)}
                isRequired={true}
              />
            }
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
          <NormalInputField
            title="Price"
            isRequired={true}
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        {
              inventoryType === "Item" ? null :
              <NormalSelectInputField 
                onChange={(e) => setUnit(e.target.value)}
                title="Select unit"
                isRequired={true}
                values={[
                  "GM",
                  "MG",
                  "MCG",
                  "ML"
                ]}
              />
            }

           {
              inventoryType === "Item" ? null :
              <>
                <NormalInputField
                  title="CoA Adjustment %"
                  isRequired={true}
                  type="text"
                  onChange={(e) => setCoaAdjustment(e.target.value)}
                />

                <NormalInputField
                  title="CoA Document"
                  isRequired={false}
                  type="file"
                // onChange={(e) => setCoaAdjustmer(e.target.value)}
                />
              </>
            }
        </div>
        <div className="mt-4">
          <div className="text-[14px] font-semibold py-1 text-red-500">
            {error}
          </div>

          <button
            className="bg-[#00B0AD] py-3 px-3 disabled:cursor-not-allowed disabled:bg-primary-light disabled:text-primary shadow-md font-semibold flex items-center justify-center text-white rounded-[8px] text-[14px]"
            type={"submit"}
          disabled={isLoading || isButtonNotActive}
          >
            {isLoading ? (
              <ClipLoader color="white" size={16} />
            ) : (
              "Add Medication +"
            )}
          </button>
        </div>
      </form>
      <Footer />
    </div>
  );
};

export default Barcode;
