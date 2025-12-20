# Image Processing Application Setup

## Prerequisites

1. Node.js installed
2. MongoDB installed and running (or MongoDB Atlas account)

## Installation Steps

1. Install dependencies (already done):
```bash
npm install
```

2. Set up MongoDB:
   - If using local MongoDB, make sure it's running on `mongodb://localhost:27017`
   - If using MongoDB Atlas, get your connection string from the Atlas dashboard

3. Create `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/imageprocessing
```
   Or for MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/imageprocessing
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- **Upload Images**: Click the upload button or drag and drop images
- **Image Processing Functions**:
  - Negative Image
  - Contrast Stretching
  - Histogram Equalization
  - Log Transform
  - Power Law (Gamma Correction)
  - Bit Plane Slicing
  - Smoothing (Blur)
  - Sharpening
  - Edge Detection (Sobel)
  - Thresholding

- **Database Storage**: All uploaded and processed images are saved to MongoDB
- **Split View**: Original image on left, processed image on right

## UI Features

- Classic blue theme with gradient background
- Blurry hover effects on buttons
- Responsive design
- Drag and drop file upload

