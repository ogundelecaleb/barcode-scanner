import React, { useState } from 'react';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { Camera, Loader2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';

const DataMatrixScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [drugDetails, setDrugDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Convert Data Matrix GS1 format to NDC
  const convertToNDC = (dataMatrix) => {
    try {
      // Extract the GTIN from GS1 Data Matrix
      const gtin = dataMatrix.substring(4, 18);
      
      // Convert GTIN to NDC by removing the first 3 digits
      const ndc = gtin.substring(3);
      
      // Format as 5-4-2 NDC
      return `${ndc.substring(0, 5)}-${ndc.substring(5, 9)}-${ndc.substring(9, 11)}`;
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
        throw new Error('Drug not found in FDA database');
      }
      
      const data = await response.json();
      return data.results[0];
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch drug details');
    }
  };

  // Handle successful scan
  const handleScan = async (err, result) => {
    if (result) {
      setLoading(true);
      setError(null);
      
      try {
        const ndc = convertToNDC(result.text);
        const details = await fetchDrugDetails(ndc);
        setDrugDetails(details);
        setScanning(false);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (err) {
      setError('Failed to scan code. Please try again.');
    }
  };

  const resetScanner = () => {
    setScanning(false);
    setDrugDetails(null);
    setError(null);
  };
  const DetailRow = ({ label, value }) => (
    <div className="grid grid-cols-2 gap-2">
      <span className="font-medium text-gray-600">{label}:</span>
      <span className="text-gray-900">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* <Card>
        <CardHeader> */}
                      <Link to="/" className="px-2 py-1 rounded-lg border absolute top-2 right-1"> Scan barcode</Link>

          <div className="flex justify-between items-center">
            Drug Scanner
            {scanning && (
              <button 
                variant="ghost" 
                size="sm" 
                onClick={resetScanner}
                className="text-red-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          {/* </CardTitle>
        </CardHeader>
        <CardContent> */}
          <div className="space-y-4">
            {/* Scanner Controls */}
            {!scanning && !drugDetails && (
              <div className="flex justify-center">
                <button
                  onClick={() => setScanning(true)}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Start Scanning
                </button>
              </div>
            )}

            {/* Scanner */}
            {scanning && (
              <div className="relative aspect-video bg-gray-100 rounded overflow-hidden">
                <BarcodeScannerComponent
                  width="100%"
                  height="100%"
                  onUpdate={handleScan}
                  torch={false}
                  stopStream={!scanning}
                />
                <div className="absolute inset-0 border-2 border-blue-500 opacity-50 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-red-500"></div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}

            {/* Error Message */}
            {/* {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )} */}
            <p>{drugDetails}</p>
            <p>{error}</p>

            {/* Drug Details */}
            {drugDetails && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Drug Information</h3>
                <div className="grid gap-3 p-4 bg-gray-50 rounded-lg">
                  <DetailRow label="Brand Name" value={drugDetails.brand_name} />
                  <DetailRow label="Generic Name" value={drugDetails.generic_name} />
                  <DetailRow label="Manufacturer" value={drugDetails.labeler_name} />
                  <DetailRow label="Product Type" value={drugDetails.product_type} />
                  <DetailRow label="Route" value={drugDetails.route?.[0]} />
                  <DetailRow label="Dosage Form" value={drugDetails.dosage_form} />
                  <DetailRow 
                    label="Strength" 
                    value={drugDetails.active_ingredients?.[0]?.strength} 
                  />
                  <DetailRow label="NDC" value={drugDetails.product_ndc} />
                </div>
                <button 
                  onClick={resetScanner}
                  className="w-full"
                >
                  Scan Another Drug
                </button>
              </div>
            )}
          </div>
          </div>
        {/* </CardContent>
      </Card> */}
    </div>
  );
};

// Helper component for displaying drug details


export default DataMatrixScanner;