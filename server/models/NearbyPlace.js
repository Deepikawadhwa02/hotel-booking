const mongoose = require("mongoose");

const NearbyPlaceSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['tourist_spot', 'cafe'],
    required: true
  },
  description: String,
  address: String,
  distance: Number,
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  photos: [{ type: String }]
}, { timestamps: true });

const NearbyPlace = mongoose.model("NearbyPlace", NearbyPlaceSchema);
module.exports = NearbyPlace;