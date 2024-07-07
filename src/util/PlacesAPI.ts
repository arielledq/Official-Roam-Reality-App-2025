import Strings from "../constants/Strings";
import { LocationPoint } from "./LocationLib";

const PlacesAPIURL = (point: LocationPoint, radius: Number) => {
  return `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${point.latitude},${point.longitude}&radius=50&key=${Strings.GOOGLE_PLACE_API_KEY}`;
}

export const getNearbyPlaces = async (point: LocationPoint, radius: Number, callback: (places: any) => void) => {
  const URL = PlacesAPIURL(point, radius);
  fetch(URL)
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.status === 'OK') {
        const places = responseJson.results.map((rawPlace: any) => {
          return {
            id: rawPlace.place_id,
            title: rawPlace.name,
            lat: rawPlace.geometry.location.lat,
            lng: rawPlace.geometry.location.lng,
            icon: rawPlace.icon
          }
        });
        callback(places)
      }
      else {
        console.warn(responseJson.status)
      }
    })
    .catch((error) => {
      console.error(error)
    })
}