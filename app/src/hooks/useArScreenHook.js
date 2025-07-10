import {useState} from "react";
import {getARSites as getSitesApi} from "../network";

const useArScreenHook = () => {
  const [sites, setSites] = useState();

  const getSites = async payload => {
    const response = await getSitesApi({
      lat: `${payload.lat}`,
      lon: `${payload.lon}`,
      site_type: payload.site_type,
      sponsor: payload.sponsor,
    });
    setSites(response?.data);
  };

  return {getSites, sites};
};

export default useArScreenHook;
