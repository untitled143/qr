import connectToDatabase from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await connectToDatabase();
      const qrDataCollection = db.collection('qr_data');
      const scannedItemsCollection = db.collection('scanned_items');
      console.log(req.body);

      const { qrCode } = req.body;


      if (!qrCode) {
        return res.status(400).json({ error: 'QR code is required.' });
      }

      // 1. Check if QR code exists in uploaded data
      const qrInfo = await qrDataCollection.findOne({admissionNumber: qrCode });

      console.log("here the "+qrInfo)

      if (!qrInfo) {
        return res.status(404).json({ error: 'QR code not found in uploaded data.' });
      }

      // 2. Check for duplicate scans
      const duplicateScan = await scannedItemsCollection.findOne({ qrCode: qrCode });

      if (duplicateScan) {
        return res.status(409).json({ error: 'This QR code has already been scanned.', qrInfo: qrInfo });
      }

      // 3. Record the scan in MongoDB
      const scanRecord = {
        qrCode: qrCode,
        name: qrInfo.name,
        admissionNumber: qrInfo.admissionNumber,
        scannedAt: new Date().toISOString(), // Store as ISO string
        originalQrDataId: qrInfo._id, // Reference to the original QR data document's _id
      };
      await scannedItemsCollection.insertOne(scanRecord);

      res.status(200).json({ message: 'QR code scanned successfully', qrInfo: qrInfo });
    } catch (error) {
      console.error('API Error /api/scan-qr:', error);
      res.status(500).json({ error: 'Failed to process QR scan', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
