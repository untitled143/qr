import React, { useState, useEffect } from 'react';

const ScannedList = ({ refreshKey }) => {
  const [scannedItems, setScannedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // In a multi-user app, you'd typically get the userId from an auth context.
  // For this example, we'll use a placeholder or derive it if needed from a global state.
  const [userId, setUserId] = useState('user-id-placeholder'); // Placeholder for userId

  useEffect(() => {
    const fetchScannedItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/scanned-items');
        const result = await response.json();

        if (response.ok) {
          // Sort items by scannedAt timestamp in memory (assuming scannedAt is a Date string or ISO string)
          const sortedItems = result.items.sort((a, b) =>
            new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
          );
          setScannedItems(sortedItems);
        } else {
          setError(`Failed to load scanned items: ${result.error || 'Unknown error'}`);
          console.error('API fetch error:', result.error);
        }
      } catch (err) {
        console.error("Error fetching scanned items:", err);
        setError(`Failed to load scanned items: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchScannedItems();
  }, [refreshKey]); // Re-run effect when refreshKey changes (e.g., after CSV upload or new scan)

  // Function to download scanned items as CSV
  const downloadCsv = () => {
    if (scannedItems.length === 0) {
      // Using a custom modal/message box instead of alert()
      // For simplicity, a console log is used here, but in a real app,
      // you'd render a temporary message on screen.
      console.log('No data to download.');
      return;
    }

    // Define CSV headers
    const headers = ['Name', 'Admission Number', 'QR Code', 'Scanned At'];
    // Map data to CSV format
    const csvRows = scannedItems.map(item => [
      item.name || '',
      item.admissionNumber || '',
      item.qrCode || '',
      item.scannedAt ? new Date(item.scannedAt).toLocaleString() : '' // Convert ISO string back to Date for display
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')) // Handle commas and quotes, ensure field is string
    ].join('\n');

    // Create a Blob and download it
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'scanned_qr_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Scanned List</h2>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Your User ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm break-all">{userId}</span>
      </p>
      {loading && <p className="text-center text-gray-600">Loading scanned items...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      {!loading && !error && scannedItems.length === 0 && (
        <p className="text-center text-gray-600">No QR codes have been scanned yet.</p>
      )}

      {!loading && !error && scannedItems.length > 0 && (
        <>
          <div className="flex justify-center mb-4">
            <button
              onClick={downloadCsv}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg
                         shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              Download Scanned List (CSV)
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scanned At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scannedItems.map((item) => (
                  <tr key={item._id}> {/* Use MongoDB's _id */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.admissionNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.qrCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.scannedAt ? new Date(item.scannedAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ScannedList;