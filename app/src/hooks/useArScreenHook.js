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
