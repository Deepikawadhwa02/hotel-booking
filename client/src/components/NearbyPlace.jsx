import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NearbyPlaces = ({ listingId }) => {
  const [places, setPlaces] = useState({ tourist_spots: [], cafes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/nearby/${listingId}`);
        setPlaces(response.data);
      } catch (err) {
        setError('Failed to load nearby places');
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchNearbyPlaces();
    }
  }, [listingId]);

  const PlaceCard = ({ place, type }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <div className="relative group transform transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-xl overflow-hidden">
        {place.photos?.[0] && (
          <div 
            className={`relative w-full h-48 overflow-hidden transition-opacity duration-500 ${
              !imageLoaded ? 'bg-gray-200 animate-pulse' : ''
            }`}
          >
            <img
              src={`http://localhost:3001/${place.photos[0].replace("public", "")}`}
              alt={place.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        )}
        <div className="p-4 bg-white space-y-2">
          <h4 className="font-bold text-lg truncate">{place.name}</h4>
          <p className="text-gray-600 text-sm line-clamp-2">{place.description}</p>
          <div className="flex items-center text-sm text-gray-500 space-x-2">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {place.distance}km away
            </span>
            <span className="text-yellow-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {place.rating}/5
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="text-center py-4 animate-pulse">
      Loading nearby places...
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center py-4">
      {error}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Nearby Attractions</h2>
      
      {places.tourist_spots.length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-gray-700">Popular Places to Visit</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.tourist_spots.map((spot) => (
              <PlaceCard key={spot._id} place={spot} type="tourist_spot" />
            ))}
          </div>
        </div>
      )}
      
      {places.cafes.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-6 text-gray-700">Popular Cafes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.cafes.map((cafe) => (
              <PlaceCard key={cafe._id} place={cafe} type="cafe" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyPlaces;