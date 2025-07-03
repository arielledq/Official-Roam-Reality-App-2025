import React from "react";
import {getSponsors as getSponsorsApi, getSites as getSitesApi} from "../network";

const useArScreenHook = () => {
  const getSponsors = () => {
    getSponsorsApi();
  };

  const getSites = payload => {
    getSitesApi({
      lat: payload.lat,
      lon: payload.lon,
      site_type: payload.site_type,
      sponsor: payload.sponsor,
    });
  };

  return {getSponsors, getSites};
};

export default useArScreenHook;
