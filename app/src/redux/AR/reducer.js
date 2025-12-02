import {createSlice} from "@reduxjs/toolkit";

const initialState = {
  arProfile: {},
  arSettings: {},
  selectedDestination: {},
  anywhereChallenges: {},
  selectedGeoSite: {},
  selectedGeoARSiteStars: [],
  destinationFactsAll: [],
  destinationVisited: [],

  destinationData: [],
  starSitesCount: {},

  sponsors: [],
  hideBottomBar: false,
};

export const sliceAR = createSlice({
  name: "ar",
  initialState,
  reducers: {
    resetState: () => initialState,
    updateARUserData: (state, action) => {
      state.arProfile = action.payload;
    },
    updateARSettings: (state, action) => {
      state.arSettings = action.payload;
    },
    updateSelectedDestination: (state, action) => {
      state.selectedDestination = action.payload;
    },
    updateSelectedDestinationBandLocation: (state, action) => {
      state.selectedDestination = {
        ...state.selectedDestination,
        ar_event_sites: state.selectedDestination?.ar_event_sites?.map(site => {
          const selectedSiteId = action.payload?.id;

          let updatedCoordinates = site?.lat_long?.coordinates;
          if (site.id === selectedSiteId) {
            updatedCoordinates = [action.payload?.long, action.payload?.lat];
          }

          return {
            ...site,
            lat_long: {
              ...site?.lat_long,
              coordinates: updatedCoordinates,
            },
          };
        }),
      };
    },
    updateAnyWhereChallenges: (state, action) => {
      state.anywhereChallenges = action.payload;
    },
    updateSelectedSites: (state, action) => {
      state.selectedGeoSite = action.payload;
    },
    updateSelectedGeoARSiteStars: (state, action) => {
      state.selectedGeoARSiteStars = action.payload;
    },
    updateDestinationFactsAll: (state, action) => {
      state.destinationFactsAll = action.payload;
    },
    updateDestinationVisited: (state, action) => {
      state.destinationVisited.push(action.payload);
    },
    updateDestinationData: (state, action) => {
      state.destinationData = action.payload;
    },
    updateStarSitesCount: (state, action) => {
      state.starSitesCount = {
        ...state.starSitesCount,
        ...action.payload,
      };
    },
    updateSponsors: (state, action) => {
      state.sponsors = action.payload;
    },
    setHideBottomBar: (state, action) => {
      state.hideBottomBar = action.payload;
    },
  },
});

export const {
  resetState,
  updateARUserData,
  updateARSettings,
  updateSelectedDestination,
  updateAnyWhereChallenges,
  updateSelectedSites,
  updateSelectedGeoARSiteStars,
  updateDestinationFactsAll,
  updateDestinationVisited,
  updateSelectedDestinationBandLocation,

  updateDestinationData,
  updateStarSitesCount,
  updateSponsors,
  setHideBottomBar,
} = sliceAR.actions;
