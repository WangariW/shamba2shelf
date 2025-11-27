import axios from "axios";

export async function geocodeAddress(address) {
  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      address
    )}&key=${import.meta.env.VITE_OPENCAGE_KEY}`;

    const res = await axios.get(url);

    if (
      res.data &&
      res.data.results &&
      res.data.results.length > 0 &&
      res.data.results[0].geometry
    ) {
      return {
        lat: res.data.results[0].geometry.lat,
        lng: res.data.results[0].geometry.lng,
      };
    }

    return null;
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}
