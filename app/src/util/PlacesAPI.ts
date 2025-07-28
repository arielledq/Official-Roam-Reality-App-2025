import Config from "../config";
import {searchUsers} from "../network";
import {LocationPoint} from "./LocationLib";

const PlacesAPIURL = (point: LocationPoint, radius: Number) => {
  return `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${point.latitude},${point.longitude}&radius=50&key=${Config.GEOCODER_API_KEY}`;
};

export const getNearbyPlaces = async (
  point: LocationPoint,
  radius: Number,
  callback: (places: any) => void
) => {
  const URL = PlacesAPIURL(point, radius);
  fetch(URL)
    .then(response => response.json())
    .then(responseJson => {
      if (responseJson.status === "OK") {
        const places = responseJson.results.map((rawPlace: any) => {
          return {
            id: rawPlace.place_id,
            title: rawPlace.name,
            lat: rawPlace.geometry.location.lat,
            lng: rawPlace.geometry.location.lng,
            icon: rawPlace.icon,
          };
        });
        callback(places);
      } else {
        console.warn(responseJson.status);
      }
    })
    .catch(error => {
      console.error(error);
    });
};

export const getMyRank = (userProfile: any, arProfile: any, callback: (rank: any) => void) => {
  const payload = {
    search: "",
  };
  searchUsers(payload).then(response => {
    if (response) {
      if (response?.data?.length > 0) {
        let arProfiles = response?.data.filter((a: any) => a.ar_user_profile_user);
        arProfiles = arProfiles.filter((a: any) => a.name);
        if (arProfile && userProfile) {
          userProfile.ar_user_profile_user = arProfile;
          arProfiles.push(userProfile);
        }
        const aa = arProfiles.sort(
          (a: any, b: any) => b?.ar_user_profile_user?.points - a?.ar_user_profile_user?.points
        );
        for (var i = 0; i < aa.length; i++) {
          aa[i].rank = i + 1;
          if (aa[i].id == userProfile.id) {
            callback(i + 1);
            break;
          }
        }
      }
    }
  });
};
