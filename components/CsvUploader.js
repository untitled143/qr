import React, { useState } from 'react';
import Papa from 'papaparse';

const CsvUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handles file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setMessage('');
  };

  // Handles CSV upload and parsing, then sends to API route
  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a CSV file first.');
      return;
    }

    setLoading(true);
    setMessage('Uploading and processing CSV...');

    try {
      // Parse the CSV file on the client-side
      Papa.parse(file, {
        header: true, // Treat the first row as headers
        skipEmptyLines: true,
        complete: async (results) => {
          const data = results.data;
          console.log('Parsed CSV data:', data);

          if (!data || data.length === 0) {
            setMessage('CSV file is empty or could not be parsed.');
            setLoading(false);
            return;
          }

          // --- UPDATED: Required headers based on your console output (no spaces in 'RegistrationID' and 'QRLink') ---
          // const requiredHeaders = ['RegistrationID', 'QRLink', 'Name'];
          // const missingHeaders = requiredHeaders.filter(header => !data[0] || !Object.keys(data[0]).includes(header));

          // if (missingHeaders.length > 0) {
          //   setMessage(`Error: Missing required CSV headers: ${missingHeaders.join(', ')}. Please ensure your CSV has 'RegistrationID', 'QRLink', and 'Name' columns.`);
          //   setLoading(false);
          //   return;
          // }
        const data1 = JSON.stringify(data.map(row => ({
              // --- UPDATED: Mapping CSV columns to app fields (using parsed keys) ---
              qrCode: row['QRLink']?.trim(), // Use 'QRLink' as parsed
              name: row['Name']?.trim(),
              admissionNumber: row['RegistrationID']?.trim(), // Use 'RegistrationID' as parsed
              // You can add other fields from your CSV here if you want to store them:
              email: row['Email']?.trim(),
              phone: row['Phone']?.trim(),
              course: row['Course']?.trim(),
              status: row['Status']?.trim(),
              timestamp: new Date(), // Add a timestamp for tracking
            })))
            console.log("here it comes",data1)
          // Send data to the API route
          const response = await fetch('/api/upload-csv', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: data1
          });

          const result = await response.json();

          if (response.ok) {
            setMessage(`CSV uploaded and ${result.insertedCount} records processed successfully!`);
            onUploadSuccess(); // Notify parent component
          } else {
            setMessage(`Error uploading data: ${result.error || 'Unknown error'}`);
            console.error('API upload error:', result.error);
          }
        },
        error: (err) => {
          setMessage(`Error parsing CSV: ${err.message}`);
          console.error('CSV parsing error:', err);
        }
      });
    } catch (error) {
      setMessage(`Error sending data to API: ${error.message}`);
      console.error('Frontend fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mb-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Upload CSV Data</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100 mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg
                   shadow-md transition duration-300 ease-in-out transform hover:scale-105
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Upload & Process CSV'}
      </button>
      {message && (
        <p className={`mt-4 text-center ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default CsvUploader;