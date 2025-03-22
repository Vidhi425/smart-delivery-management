import axios from "axios";

const geocodeAddress = async (area: string) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: area,
          format: "json",
          limit: 1,
        },
      }
    );

    if (response.data.length === 0) {
      console.error(`No geocode results found for: ${area}`);
      return { lat: null, lng: null }; // Handle missing results
    }

    const { lat, lon } = response.data[0];
    return { lat: parseFloat(lat), lng: parseFloat(lon) };
  } catch (error) {
    console.error(`Geocoding failed for ${area}:`, error);
    return { lat: null, lng: null };
  }
};

export default geocodeAddress;
