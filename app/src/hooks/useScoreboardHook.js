import {useEffect, useState} from "react";
import {getSponsors as getSponsorsApi} from "../network";
import {updateSponsors} from "../redux/AR";
import {useDispatch, useSelector} from "react-redux";

const useScoreboardHook = () => {
  const dispatch = useDispatch();
  const [loadingSponsors, setLoadingSponsors] = useState(false);
  const {sponsors} = useSelector(state => state.ar);

  const getSponsors = async () => {
    setLoadingSponsors(true);
    const response = await getSponsorsApi();
    const defaultSponsor = {
      id: 0,
      name: "Global",
      image: "",
      description: "",
      tags: "",
      created_at: "",
    };
    dispatch(updateSponsors([defaultSponsor, ...response?.data]));
    setLoadingSponsors(false);
  };

  useEffect(() => {
    if (!sponsors.length) getSponsors();
  }, []);

  return {getSponsors, sponsors, loadingSponsors};
};

export default useScoreboardHook;
