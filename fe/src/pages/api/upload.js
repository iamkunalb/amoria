import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { image } = req.body;
    
    // Remove header from base64 string
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    
    // Set the specific uploads directory path
    const uploadsDir = '/Users/kunalb/Documents/AI Matcher/uploads';
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)){
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create filename with timestamp
    const filename = `selfie_${Date.now()}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    // Write file
    fs.writeFileSync(filepath, base64Data, 'base64');

    res.status(200).json({ 
      message: 'File saved successfully', 
      filename,
      filepath 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error saving file', error: error.message });
  }
} 