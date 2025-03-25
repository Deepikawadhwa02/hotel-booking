import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Camera, Star, Info } from 'lucide-react';

const AddNearbyPlaces = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [placeData, setPlaceData] = useState({
    name: '',
    type: 'tourist_spot',
    description: '',
    address: '',
    distance: '',
    rating: '',
    photos: []
  });

  const [photoPreview, setPhotoPreview] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlaceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => URL.createObjectURL(file));
    
    setPhotoPreview(previews);
    setPlaceData(prev => ({
      ...prev,
      photos: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('listingId', listingId);
    Object.keys(placeData).forEach(key => {
      if (key === 'photos') {
        placeData[key].forEach(file => {
          formData.append('photos', file);
        });
      } else {
        formData.append(key, placeData[key]);
      }
    });

    try {
      await axios.post(`http://localhost:3001/nearby/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Show success toast or modal
        navigate("/");
    } catch (error) {
      console.error('Error adding nearby place:', error);
      // Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h2 className="text-3xl font-extrabold text-white flex items-center">
            <MapPin className="mr-3 w-10 h-10" />
            Add Nearby Place
          </h2>
          <p className="text-blue-100 mt-2">Enhance your listing with local attractions</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Info className="mr-2 w-5 h-5 text-blue-500" />
                Place Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
                placeholder="Enter place name"
                value={placeData.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Place
              </label>
              <select
                name="type"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
                value={placeData.type}
                onChange={handleInputChange}
              >
                <option value="tourist_spot">Tourist Spot</option>
                <option value="cafe">Cafe</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
              placeholder="Tell us about this place"
              value={placeData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance (km)
              </label>
              <input
                type="number"
                name="distance"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
                placeholder="Distance"
                step="0.1"
                min="0"
                value={placeData.distance}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Star className="mr-2 w-5 h-5 text-yellow-500" />
                Rating
              </label>
              <input
                type="number"
                name="rating"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
                placeholder="Rating"
                min="0"
                max="5"
                step="0.1"
                value={placeData.rating}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
                placeholder="Full address"
                value={placeData.address}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Camera className="mr-2 w-5 h-5 text-green-500" />
              Photos
            </label>
            <div 
              onClick={() => fileInputRef.current.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition duration-300"
            >
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {photoPreview.length === 0 ? (
                <p className="text-gray-500">Click to upload photos</p>
              ) : (
                <div className="flex flex-wrap justify-center gap-4">
                  {photoPreview.map((preview, index) => (
                    <img 
                      key={index} 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition duration-300 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>Adding Place...</span>
              ) : (
                <span>Add Nearby Place</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNearbyPlaces;