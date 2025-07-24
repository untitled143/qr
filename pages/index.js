import React, { useState } from 'react';
import CsvUploader from '../components/CsvUploader';
import QrScanner from '../components/QrScanner';
import ScannedList from '../components/ScannedList';

const HomePage = () => {
  // refreshKey is used to force a re-render/re-fetch of the ScannedList component
  const [scannedListRefreshKey, setScannedListRefreshKey] = useState(0);

  // Callback for when a CSV is successfully uploaded
  const handleCsvUploadSuccess = () => {
    // Increment the key to trigger a refresh of the ScannedList
    setScannedListRefreshKey(prevKey => prevKey + 1);
  };

  // Callback for when a QR code is successfully scanned
  const handleQrScanSuccess = (data) => {
    console.log("QR Scan successful:", data);
    // Increment the key to trigger a refresh of the ScannedList
    setScannedListRefreshKey(prevKey => prevKey + 1);
  };

  // Callback for QR scan errors
  const handleQrScanError = (error) => {
    console.error("QR Scan error:", error);
    // You might want to display a temporary error message on the main page here
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 font-sans text-gray-900">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-3">QR Code Validation App</h1>
        <p className="text-xl text-gray-600">Scan, Validate, and Track Admissions</p>
      </header>

      <main className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* CSV Uploader Section */}
          <CsvUploader onUploadSuccess={handleCsvUploadSuccess} />

          {/* QR Scanner Section */}
          <QrScanner
            onScanSuccess={handleQrScanSuccess}
            onScanError={handleQrScanError}
          />
        </div>

        {/* Scanned List Section */}
        <ScannedList refreshKey={scannedListRefreshKey} />
      </main>

      <footer className="mt-10 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} QR Code Validation App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;