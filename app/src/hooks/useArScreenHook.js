import {useState, useEffect} from "react";
import {getSponsors as getSponsorsApi, getARSites as getSitesApi} from "../network";
import {useDispatch} from "react-redux";
import {updateSponsors} from "../redux/AR";
import {useSelector} from "react-redux";

const useArScreenHook = () => {
  const [sites, setSites] = useState();

  const dispatch = useDispatch();

  const sponsors = useSelector(state => state.ar.sponsors);

  const getSponsors = async () => {
    const response = await getSponsorsApi();
    const defaultSponsor = {
      id: 0,
      name: "ALL",
      image: "",
      description: "",
      tags: "",
      created_at: "",
    };
    dispatch(updateSponsors([defaultSponsor, ...response?.data]));
  };

  const getSites = async payload => {
    const response = await getSitesApi({
      lat: `${payload.lat}`,
      lon: `${payload.lon}`,
      site_type: payload.site_type,
      sponsor: payload.sponsor,
    });
    setSites(response?.data);
  };

  useEffect(() => {
    if (!sponsors.length) getSponsors();
  }, []);

  return {getSponsors, getSites, sponsors, sites};
};

export default useArScreenHook;
