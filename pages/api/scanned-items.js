import connectToDatabase from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const db = await connectToDatabase();
      const scannedItemsCollection = db.collection('scanned_items');

      // Fetch all scanned items. Sorting will be done on the client side.
      const items = await scannedItemsCollection.find({}).toArray();

      res.status(200).json({ items: items });
    } catch (error) {
      console.error('API Error /api/scanned-items:', error);
      res.status(500).json({ error: 'Failed to fetch scanned items', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
