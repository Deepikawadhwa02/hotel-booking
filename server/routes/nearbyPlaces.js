const express = require('express');
const router = express.Router();
const NearbyPlace = require('../models/NearbyPlace');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route to add a new nearby place
router.post('/add', upload.array('photos', 5), async (req, res) => {
  try {
    const { 
      listingId, 
      name, 
      type, 
      description, 
      address, 
      distance, 
      rating 
    } = req.body;

    // Process uploaded photos
    const photoPaths = req.files.map(file => 
      `public/uploads/${file.filename}`
    );

    // Create new nearby place
    const newNearbyPlace = new NearbyPlace({
      listingId,
      name,
      type,
      description,
      address,
      distance: parseFloat(distance),
      rating: parseFloat(rating),
      photos: photoPaths
    });

    await newNearbyPlace.save();

    res.status(201).json(newNearbyPlace);
  } catch (error) {
    console.error('Error adding nearby place:', error);
    res.status(500).json({ message: 'Failed to add nearby place', error: error.message });
  }
});

// Route to fetch nearby places for a specific listing
router.get('/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const nearbyPlaces = await NearbyPlace.find({ listingId });

    // Organize places by type
    const places = {
      tourist_spots: nearbyPlaces.filter(place => place.type === 'tourist_spot'),
      cafes: nearbyPlaces.filter(place => place.type === 'cafe')
    };

    res.json(places);
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    res.status(500).json({ message: 'Failed to fetch nearby places', error: error.message });
  }
});

module.exports = router;