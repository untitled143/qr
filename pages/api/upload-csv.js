import connectToDatabase from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await connectToDatabase();
      const qrDataCollection = db.collection('qr_data'); // Collection for uploaded QR data

      const data = req.body; // Array of objects from CSV

      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ error: 'Invalid data format or empty data.' });
      }

      // Clear existing data in the collection before inserting new data
      await qrDataCollection.deleteMany({});
      console.log('Cleared existing QR data in MongoDB.');

      // Filter out rows with missing essential data
      // --- UPDATED: Filtering based on new CSV column mappings ---
      const validData = data.filter(row => row.qrCode && row.name && row.admissionNumber);

      if (validData.length === 0) {
        return res.status(400).json({ error: 'No valid records found in the uploaded CSV after filtering.' });
      }

      // Insert new data
      const result = await qrDataCollection.insertMany(validData);
      console.log(`Inserted ${result.insertedCount} records into MongoDB.`);

      res.status(200).json({ message: 'CSV data uploaded successfully', insertedCount: result.insertedCount });
    } catch (error) {
      console.error('API Error /api/upload-csv:', error);
      res.status(500).json({ error: 'Failed to upload CSV data', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}