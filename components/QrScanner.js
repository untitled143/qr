import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QrScanner = ({ onScanSuccess, onScanError }) => {
  const [scanResult, setScanResult] = useState(null);
  const [message, setMessage] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const html5QrcodeScannerRef = useRef(null);
  const scannerInitialized = useRef(false);

  useEffect(() => {
    // Initialize the QR code scanner only once
    if (!scannerInitialized.current) {
      html5QrcodeScannerRef.current = new Html5QrcodeScanner(
        "reader",
        {
          qrCodeUserMedia: { facingMode: "environment" }, // Prefer rear camera
          fps: 10, // Frames per second to scan
          qrbox: { width: 250, height: 250 }, // Size of the QR scanning box
        },
        /* verbose= */ false
      );

      // Define scan success handler
      const onScanSuccessLocal = async (decodedText, decodedResult) => {
        console.log(`Code matched = ${decodedText}`, decodedResult);
        html5QrcodeScannerRef.current.clear(); // Stop scanning after a successful scan
        const decodedId=decodedText.slice(0,decodedText.length-1);
        console.log(decodedId)
        setScanResult(decodedId);
        setMessage('Processing scanned QR code...');

        try {
          // Send scanned QR code to the API route
          const response = await fetch('/api/scan-qr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ qrCode: decodedId }),
          });

          const result = await response.json();

          if (response.ok) {
            setScannedData(result.qrInfo);
            setMessage(`QR code found! Name: ${result.qrInfo.name}, Admission No: ${result.qrInfo.admissionNumber}`);
            onScanSuccess(result.qrInfo); // Notify parent component of successful scan
          } else {
            setMessage(`Error: ${result.error || 'Unknown error'}`);
            setScannedData(null);
            onScanError(result.error || 'Unknown error');
          }
        } catch (error) {
          setMessage(`Error processing scan: ${error.message}`);
          console.error('Error processing QR scan:', error);
          onScanError(error.message);
        } finally {
          // Re-render scanner after a short delay to allow user to see message
          setTimeout(() => {
            if (html5QrcodeScannerRef.current && !scannerInitialized.current) { // Check if it's still not initialized
              html5QrcodeScannerRef.current.render(onScanSuccessLocal, onScanErrorLocal);
              scannerInitialized.current = true;
            }
          }, 2000); // 2-second delay
        }
      };

      // Define scan error handler
      const onScanErrorLocal = (errorMessage) => {
        // console.warn(`QR Scan Error: ${errorMessage}`); // Too verbose for console
        // setMessage(`Scan error: ${errorMessage}`); // Only show error if critical
      };

      // Render the scanner
      html5QrcodeScannerRef.current.render(onScanSuccessLocal, onScanErrorLocal);
      scannerInitialized.current = true;
    }

    // Cleanup function to stop the scanner when the component unmounts
    return () => {
      if (html5QrcodeScannerRef.current && scannerInitialized.current) {
        try {
          html5QrcodeScannerRef.current.clear();
          console.log("QR scanner cleared.");
          scannerInitialized.current = false; // Reset flag on clear
        } catch (error) {
          console.warn("Failed to clear QR scanner:", error);
        }
      }
    };
  }, [onScanSuccess, onScanError]); // Dependencies for useEffect

  // Function to copy admission number to clipboard
  const copyAdmissionNumber = () => {
    if (scannedData && scannedData.admissionNumber) {
      try {
        // Use document.execCommand('copy') for better compatibility in iframes
        const textarea = document.createElement('textarea');
        textarea.value = scannedData.admissionNumber;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setMessage('Admission number copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy text: ', err);
        setMessage('Failed to copy admission number. Please try manually.');
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mb-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Scan QR Code</h2>
      <div id="reader" className="w-full h-auto min-h-[250px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        {/* The QR code scanner will render here */}
      </div>
      {message && (
        <p className={`mt-4 text-center ${message.includes('Error') || message.includes('not found') || message.includes('already been scanned') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
      {scannedData && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="font-semibold text-lg text-blue-800">Name: {scannedData.name}</p>
          <p className="font-semibold text-lg text-blue-800">Admission No: {scannedData.admissionNumber}</p>
          <button
            onClick={copyAdmissionNumber}
            className="mt-3 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg
                       shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Copy Admission Number
          </button>
        </div>
      )}
    </div>
  );
};

export default QrScanner;