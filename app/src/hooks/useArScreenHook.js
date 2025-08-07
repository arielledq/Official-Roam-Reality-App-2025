import {useState} from "react";
import {getARSites as getSitesApi, getNextStar as getNextStarApi} from "../network";

const useArScreenHook = () => {
  const [sites, setSites] = useState();

  const getSites = async payload => {
    const response = await getSitesApi({
      lat: `${payload.lat}`,
      lon: `${payload.lon}`,
      site_type: payload?.site_type,
      sponsor: payload?.sponsor,
    });
    const updatedResponse = response?.data || [];
    setSites(updatedResponse);
  };

  const getNextStar = async (geoSiteId, lat, lon) => {
    let huntChallenge = {};
    try {
      const params = {
        geo_site_id: geoSiteId,
        lat: lat,
        lon: lon,
      };
      const nextStarRsp = await getNextStar(params);
      if (nextStarRsp?.star?.id) {
        huntChallenge = {
          ...nextStarRsp.star,
          attempt_number: nextStarRsp.attempt_number,
        };
      } else {
        Toast.show({
          type: "info",
          text1: "Hunt Challenge Info",
          text2: "You have collected all the stars in this hunt challenge",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error retrieving the challenge",
        text2: error?.message || "There was an unexpected error. Please try again later.",
      });
    }
    return huntChallenge;
  };

  return {getSites, sites, getNextStar};
};

export default useArScreenHook;
