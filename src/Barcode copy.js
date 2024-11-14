import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DrugScannerApp = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [drugInfo, setDrugInfo] = useState(null);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState('');

  // GS1 Application Identifier definitions
  const GS1_AIS = {
    '00': { name: 'SSCC', length: 18 },
    '01': { name: 'GTIN', length: 14 },
    '10': { name: 'BATCH/LOT', lengthType: 'variable', maxLength: 20 },
    '11': { name: 'PROD_DATE', length: 6 },
    '17': { name: 'EXP_DATE', length: 6 },
    '21': { name: 'SERIAL', lengthType: 'variable', maxLength: 20 },
    '30': { name: 'VAR_COUNT', lengthType: 'variable', maxLength: 8 },
    '310': { name: 'NET_WEIGHT_KG', length: 6 },
    '400': { name: 'ORDER_NUMBER', lengthType: 'variable', maxLength: 30 },
    '415': { name: 'GLN_PAY_TO', length: 13 }
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
        throw new Error('Invalid date');
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }
  };

  // Enhanced function to parse GS1 data matrix code
  const parseDataMatrix = (data) => {
    const parsedData = {
      gtin: '',
      serial: '',
      lot: '',
      expiry: '',
      productionDate: '',
      additionalData: {},
      raw: data
    };

    try {
      // Handle different separator characters
      const separators = ['\u001D', '\u001E', '\u001F', '\u0004'];
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
        const value = foundAI.lengthType === 'variable'
          ? segment.substring(aiLength).split(/[\u001D\u001E\u001F\u0004]/)[0]
          : segment.substring(aiLength, aiLength + foundAI.length);

        // Validate and store the value
        switch (foundAI.ai) {
          case '01': // GTIN
            if (!validateGTINCheckDigit(value)) {
              throw new Error('Invalid GTIN check digit');
            }
            parsedData.gtin = value;
            break;
            
          case '21': // Serial
            if (value.length > 20) {
              throw new Error('Serial number too long');
            }
            parsedData.serial = value;
            break;
            
          case '10': // Lot/Batch
            if (value.length > 20) {
              throw new Error('Lot number too long');
            }
            parsedData.lot = value;
            break;
            
          case '17': // Expiry
            parsedData.expiry = parseGS1Date(value);
            break;
            
          case '11': // Production Date
            parsedData.productionDate = parseGS1Date(value);
            break;
            
          default:
            // Store other values in additionalData
            parsedData.additionalData[foundAI.name] = value;
        }
      }

      // Validate required fields
      if (!parsedData.gtin) {
        throw new Error('GTIN is required but not found');
      }

      return parsedData;
    } catch (error) {
      throw new Error(`Data matrix parsing error: ${error.message}`);
    }
  };

  // Convert GTIN to NDC with format validation
  const gtinToNDC = (gtin) => {
    try {
      // Remove the first 3 digits (packaging level) and check digit
      const ndcPart = gtin.substring(3, 13);
      
      // Validate numeric
      if (!/^\d{10}$/.test(ndcPart)) {
        throw new Error('Invalid NDC format');
      }
      
      // Try different NDC formats (5-4-1, 5-3-2, 4-4-2)
      const formats = [
        { parts: [5, 4, 1] },
        { parts: [5, 3, 2] },
        { parts: [4, 4, 2] }
      ];
      
      for (const format of formats) {
        let position = 0;
        const parts = [];
        
        for (const length of format.parts) {
          parts.push(ndcPart.substring(position, position + length));
          position += length;
        }
        
        // Return first valid format
        const ndc = parts.join('-');
        if (position === 10) {
          return ndc;
        }
      }
      
      throw new Error('Could not determine NDC format');
    } catch (error) {
      throw new Error(`NDC conversion error: ${error.message}`);
    }
  };

  // Fetch drug info from OpenFDA with enhanced error handling
  const fetchDrugInfo = async (ndc) => {
    try {
      const response = await fetch(
        `https://api.fda.gov/drug/ndc.json?search=product_ndc:"${ndc}"&limit=1`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        throw new Error('Drug not found in OpenFDA database');
      }
      
      return data.results[0];
    } catch (error) {
      if (error.message.includes('API request failed')) {
        throw new Error('OpenFDA API error: ' + error.message);
      }
      throw new Error('Failed to fetch drug information: ' + error.message);
    }
  };

  // Handle camera scan
  const handleScan = async () => {
    try {
      setScanning(true);
      setError(null);
      
      // Simulated scan result - in real implementation, 
      // you would integrate with a barcode scanning library
      const mockScanData = "01123456789012340921123456\u001D17240531\u001D10ABC123\u001D11240125";
      setRawData(mockScanData);
      
      const parsedData = parseDataMatrix(mockScanData);
      const ndc = gtinToNDC(parsedData.gtin);
      const drugData = await fetchDrugInfo(ndc);
      
      setScanResult(parsedData);
      setDrugInfo(drugData);
    } catch (error) {
      setError(error.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Drug Scanner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleScan}
            disabled={scanning}
            className="w-full"
          >
            <Camera className="mr-2 h-4 w-4" />
            {scanning ? 'Scanning...' : 'Start Scan'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {scanResult && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Scan Result:</h3>
              <div className="grid grid-cols-2 gap-2">
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
                {scanResult.productionDate && (
                  <>
                    <div>Production Date:</div>
                    <div>{scanResult.productionDate}</div>
                  </>
                )}
                {Object.entries(scanResult.additionalData).map(([key, value]) => (
                  <>
                    <div>{key}:</div>
                    <div>{value}</div>
                  </>
                ))}
              </div>
            </div>
          )}

          {drugInfo && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Drug Information:</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>Brand Name:</div>
                <div>{drugInfo.brand_name}</div>
                <div>Generic Name:</div>
                <div>{drugInfo.generic_name}</div>
                <div>Manufacturer:</div>
                <div>{drugInfo.labeler_name}</div>
                <div>Dosage Form:</div>
                <div>{drugInfo.dosage_form}</div>
                <div>Route:</div>
                <div>{drugInfo.route?.join(', ')}</div>
                <div>Product Type:</div>
                <div>{drugInfo.product_type}</div>
                <div>Marketing Status:</div>
                <div>{drugInfo.marketing_status}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DrugScannerApp;