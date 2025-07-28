import {useState} from "react";
import {getARSites as getSitesApi, getNextStar as getNextStarApi} from "../network";
import {AR_MODES_MENU, AR_MODES} from "constants";

const useArScreenHook = () => {
  const [sites, setSites] = useState();

  const getSites = async payload => {
    const response = await getSitesApi({
      lat: `${payload.lat}`,
      lon: `${payload.lon}`,
      site_type: payload?.site_type,
      sponsor: payload?.sponsor,
    });
    let updatedResponse = response?.data || [];
    if (payload?.site_type === AR_MODES_MENU.find(item => item.mode === AR_MODES.SCAN_MODE)?.id) {
      updatedResponse = [];
      for (const scan of response?.scans) {
        updatedResponse.push(scan);
      }

      const challengeSection = {
        id: "challenge-1",
        image: "",
        name: "AR Challenge",
        challenges: response?.challenges,
      };
      updatedResponse.push(challengeSection);
    }

    setSites(updatedResponse);
  };

  const getNextStar = async (geoSiteId, lat, lon) => {
    try {
      const params = {
        geo_site_id: geoSiteId,
        lat: lat,
        lon: lon,
      };
      const response = await getNextStarApi(params);
      if (response?.id) {
        return response;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {getSites, sites, getNextStar};
};

export default useArScreenHook;
