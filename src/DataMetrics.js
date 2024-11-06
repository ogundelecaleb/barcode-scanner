import React, { useState } from 'react';
import  BarcodeReader  from 'react-barcode-reader';
import { Camera, Loader2 } from 'lucide-react';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DataMatrixScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [drugDetails, setDrugDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Convert Data Matrix GS1 format to NDC
  const convertToNDC = (dataMatrix) => {
    try {
      // Extract the GTIN (Global Trade Item Number) from GS1 Data Matrix
      // Typical format: ]d2010123456789012345
      const gtin = dataMatrix.substring(4, 18);
      
      // Convert GTIN to NDC
      // Remove the first 3 digits (usually '003')
      // and handle different NDC formats (4-4-2, 5-3-2, 5-4-1)
      const ndc = gtin.substring(3);
      
      // Format as 5-4-2 NDC
      const formattedNDC = `${ndc.substring(0, 5)}-${ndc.substring(5, 9)}-${ndc.substring(9, 11)}`;
      
      return formattedNDC;
    } catch (err) {
      throw new Error('Invalid Data Matrix format');
    }
  };

  // Fetch drug details from FDA API
  const fetchDrugDetails = async (ndc) => {
    try {
      const response = await fetch(
        `https://api.fda.gov/drug/ndc.json?search=product_ndc:"${ndc}"&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Drug not found');
      }
      
      const data = await response.json();
      return data.results[0];
    } catch (err) {
      throw new Error('Failed to fetch drug details');
    }
  };

  // Handle successful scan
  const handleScan = async (data) => {
    if (data) {
      setLoading(true);
      setError(null);
      

      try {
        const ndc = convertToNDC(data);
        const details = await fetchDrugDetails(ndc);
        setDrugDetails(details);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setScanning(false);
      }
    }
  };

  // Handle scan error
  const handleError = (err) => {
    setError('Failed to scan code. Please try again.');
    setScanning(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* <Card>
        <CardHeader>
          <CardTitle>Drug Scanner</CardTitle>
        </CardHeader>
        <CardContent> */}
          <div className="space-y-4">
            {/* Scanner Controls */}
            <div className="flex justify-center">
              {!scanning ? (
                <button
                  onClick={() => setScanning(true)}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  <Camera size={20} />
                  Start Scanning
                </button>
              ) : (
                <button
                  onClick={() => setScanning(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Stop Scanning
                </button>
              )}
            </div>

            {/* Scanner */}
            {scanning && (
              <div className="relative aspect-video bg-gray-100 rounded overflow-hidden">
                <BarcodeReader
                  onScan={handleScan}
                  onError={handleError}
                  facingMode="environment"
                />
              </div>
            )}



            {/* Loading State */}
            {loading && (
              <div className="flex justify-center">
                <Loader2 className="animate-spin" />
              </div>
            )}

            {/* Error Message */}
            {/* {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )} */}

            {/* Drug Details */}
            {drugDetails && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Drug Details:</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p><strong>Brand Name:</strong> {drugDetails.brand_name}</p>
                  <p><strong>Generic Name:</strong> {drugDetails.generic_name}</p>
                  <p><strong>Manufacturer:</strong> {drugDetails.labeler_name}</p>
                  <p><strong>Product Type:</strong> {drugDetails.product_type}</p>
                  <p><strong>Route:</strong> {drugDetails.route?.[0]}</p>
                  <p><strong>Dosage Form:</strong> {drugDetails.dosage_form}</p>
                  <p><strong>Strength:</strong> {drugDetails.active_ingredients?.[0]?.strength}</p>
                  <p><strong>NDC:</strong> {drugDetails.product_ndc}</p>
                </div>
              </div>
            )}
          </div>
        {/* </CardContent>
      </Card> */}
    </div>
  );
};

export default DataMatrixScanner;