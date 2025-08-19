import React, {useEffect, useState} from "react";
import {View, Text, Image, TouchableOpacity, ScrollView, FlatList, Platform} from "react-native";
import AppDropdown from "components/Dropdown";
import {AppButton} from "components";
import RefreshIcon from "assets/svg/Refresh.tsx";
import Images from "assets/images";
import Icon from "components/Icon";
import useArScreenHook from "../../hooks/useArScreenHook";
import fontGroup from "assets/fonts";
import userLocationHook from "screens/drawerContent/location.hook";
// @ts-ignore
import {AR_MODES} from "constants";
import ARChallengeItem from "./ARChallengeItem";
import Toast from "react-native-toast-message";
import theme from "assets/theme";
import {checkHuntCoolDownAPI, checkScansCoolDownAPI} from "network";

interface ARModeSiteListProps {
  selectedMode: any;
  onStartChallenge: (site: any) => void;
  onClose: () => void;
}

const ARModeSiteList = ({selectedMode, onStartChallenge, onClose}: ARModeSiteListProps) => {
  const DEFAULT_SPONSOR = {
    label: `ALL ${selectedMode?.listLabel?.toUpperCase()}`,
    value: 0,
    image: "",
    description: "",
    tags: "",
    created_at: "",
  };

  const {initialUserLocation, getLocation} = userLocationHook();
  const {getSites, sites, getNextStar}: any = useArScreenHook();
  const [sponsorData, setSponsorData] = useState<any>([]);
  const [selectedSponsor, setSelectedSponsor] = useState(DEFAULT_SPONSOR);
  const [expandedSites, setExpandedSites] = useState<string[]>([]);
  const [filteredSites, setFilteredSites] = useState<any>([]);

  const startChallengeHandler = async (site: any) => {
    let updatedSiteData = {
      ...site,
      selectedMode,
    };
    switch (selectedMode?.mode) {
      case AR_MODES.HUNT_MODE: {
        let hasNextStar = false;
        const params = {
          geo_site_id: site.id,
          lat: initialUserLocation.latitude,
          lon: initialUserLocation.longitude,
        };
        try {
          const huntChallenge = await getNextStar(params.geo_site_id, params.lat, params.lon);
          if (huntChallenge?.id) {
            hasNextStar = true;
            updatedSiteData = {
              ...updatedSiteData,
              huntChallenge: {...huntChallenge},
            };
          }
        } catch (error: any) {
          Toast.show({
            type: "error",
            text1: "Error retrieving the challenge",
            text2: error?.message || "There was an unexpected error. Please try again later.",
          });
        }

        // Validate cool down period && Start challenge
        if (hasNextStar) {
          // Validate cool down period
          const scanId = updatedSiteData?.huntChallenge?.geo_ar_star?.id;
          let isInCoolDownPeriod = false;
          try {
            await checkHuntCoolDownAPI(scanId);
            isInCoolDownPeriod = false;
          } catch (e: any) {
            isInCoolDownPeriod = true;
            Toast.show({
              type: "info",
              text1: "Scan Challenge Info",
              text2: e?.message?.message || "You are in cool down period. Please try again later.",
            });
          }

          // Start challenge
          if (!isInCoolDownPeriod) {
            onStartChallenge(updatedSiteData);
            onClose();
          } else {
            onClose();
          }
        } else {
          onClose();
        }

        break;
      }
      case AR_MODES.SCAN_MODE: {
        // Validate cool down period
        const scanId = updatedSiteData?.scanChallenge?.id;
        let isInCoolDownPeriod = false;
        try {
          const scanCoolDownRsp = await checkScansCoolDownAPI(scanId);
          const isFirstScan = "ScanPicture None does not exist.";
          if (scanCoolDownRsp?.status >= 200 && scanCoolDownRsp?.status < 300) {
            isInCoolDownPeriod = false;
          } else if (
            scanCoolDownRsp?.errorStatus === 404 &&
            scanCoolDownRsp?.message?.message === isFirstScan
          ) {
            isInCoolDownPeriod = false;
          } else {
            isInCoolDownPeriod = true;
            throw new Error(scanCoolDownRsp?.message);
          }
        } catch (e: any) {
          isInCoolDownPeriod = true;
          Toast.show({
            type: "error",
            text1: "Error verifying your cool down period",
            text2: e?.message?.message || "There was an unexpected error. Please try again later.",
          });
        }

        // Start challenge
        if (!isInCoolDownPeriod) {
          updatedSiteData = {
            ...updatedSiteData,
            memory_type: "SCAN_PHOTO",
          };
          onStartChallenge(updatedSiteData);
          onClose();
        } else {
          onClose();
        }

        break;
      }
      case AR_MODES.GEO_TAG_MODE:
        onStartChallenge(updatedSiteData);
        onClose();

        break;
    }
  };

  const getSitesHandler = (sponsorId: string = "") => {
    if (sponsorId) {
      let updatedSites;
      if (selectedMode?.mode === AR_MODES.SCAN_MODE) {
        updatedSites = sites.filter((site: any) => site?.sponsor?.id === Number(sponsorId));
      } else {
        updatedSites = sites.filter(
          (site: any) => site?.pin_challenge?.sponsored?.id === Number(sponsorId)
        );
      }
      setFilteredSites(updatedSites);
    } else if (
      typeof initialUserLocation?.latitude === "number" &&
      isFinite(initialUserLocation?.latitude) &&
      typeof initialUserLocation?.longitude === "number" &&
      isFinite(initialUserLocation?.longitude)
    ) {
      const payload = {
        lat: initialUserLocation?.latitude,
        lon: initialUserLocation?.longitude,
        site_type: selectedMode?.id,
        sponsor: "",
      };
      getSites(payload);

      if (sponsorId) {
        setSelectedSponsor(
          sponsorData.find((sponsor: any) => sponsor.value === Number(sponsorId)) || DEFAULT_SPONSOR
        );
      }
    }
  };

  // Obtiene la ubicación del usuario
  useEffect(() => {
    getLocation();
  }, []);

  // Traer los sites iniciales
  useEffect(() => {
    getSitesHandler();
  }, [initialUserLocation, selectedMode]);

  // Crear la lista de sponsors desde los sites
  useEffect(() => {
    if (!sites?.length) return;
    setFilteredSites(sites);

    if (sponsorData?.length) return;

    const defaultSponsor = {
      label: DEFAULT_SPONSOR.label,
      value: DEFAULT_SPONSOR.value,
    };
    let sponsorsData: any[] = [];

    if (selectedMode?.mode === AR_MODES.SCAN_MODE) {
      sites.forEach((site: any) => {
        site?.challenges?.length &&
          site?.challenges.forEach((challenge: any) => {
            sponsorsData.push({
              label: challenge?.sponsor?.name || challenge?.sponsored?.name,
              value: challenge?.sponsor?.id || challenge?.sponsored?.id,
              ...challenge?.sponsor,
              ...challenge?.sponsored,
            });
          });
      });
      sponsorsData = Array.from(new Set(sponsorsData.map(s => s.value))).map(id =>
        sponsorsData.find(s => s.value === id)
      );
    } else {
      sponsorsData = sites.map((site: any) => ({
        label: site?.sponsor?.name || site?.sponsored?.name,
        value: site?.sponsor?.id || site?.sponsored?.id,
        ...site?.sponsor,
        ...site?.sponsored,
      }));
    }
    const updatedSponsorsData = [defaultSponsor, ...sponsorsData];
    setSponsorData(updatedSponsorsData);
    setSelectedSponsor(updatedSponsorsData[0]);
  }, [sites]);

  // Cuando se selecciona un sponsor, filtrar sites por sponsor
  useEffect(() => {
    if (selectedSponsor?.value) {
      getSitesHandler(selectedSponsor?.value?.toString());
    } else {
      getSitesHandler();
    }
  }, [selectedSponsor]);

  return (
    <View style={{width: "100%", maxHeight: "85%"}}>
      <View style={{flexDirection: "row", alignItems: "center", gap: 15}}>
        <View
          style={{
            height: 75,
            width: 75,
            borderRadius: 110,
            backgroundColor: theme.lightColors?.grey4,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={!selectedSponsor?.value ? Images.AppIconLight : {uri: selectedSponsor?.image}}
            style={{height: 60, width: 60, borderRadius: 110}}
          />
        </View>
        <AppDropdown
          data={sponsorData}
          maxHeight={300}
          dropdownStyle={{zIndex:100}}
          containerStyle={{flex: 1, borderRadius: 0, marginLeft:3, marginTop: 0, backgroundColor: theme.lightColors?.black}}
          labelField="label"
          valueField="value"
          selectedTextStyle={{fontSize: 14, ...fontGroup.nunitoBold, fontWeight: "bold"}}
          itemTextStyle={{
            ...fontGroup.nunitoBold,
            textTransform: "uppercase",
            fontWeight: "bold",
            color: theme.lightColors?.white,
            fontSize: 14,
          }}
          placeholder={selectedSponsor?.label || ""}
          placeholderStyle={{
            ...fontGroup.nunitoBold,
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
          activeColor={theme.lightColors?.magenta}
          value={selectedSponsor?.value?.toString().toUpperCase() || ""}
          onChange={item => {
            setSelectedSponsor(item);
          }}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 25,
        }}
      >
        <Text style={{fontSize: 18, fontWeight: "bold", color: "white", flex: 1}}>
          {selectedMode?.listLabel} Available
        </Text>
        <View style={{width: 90, marginRight: 4}}>
          <AppButton
            // @ts-ignore
            customColors={[theme.lightColors?.grey4, theme.lightColors?.grey4]}
            containerStyle={{
              paddingVertical: 0,
              borderRadius: 4,
              minHeight: 35,
            }}
            iconContainerStyle={{
              padding: 0,
            }}
            titleStyle={{fontSize: 12, color: "#7e8493", fontWeight: "bold", paddingRight: 4}}
            onPress={() => getSitesHandler()}
            title="Refresh"
            icon={
              <View style={{paddingHorizontal: 5}}>
                <RefreshIcon />
              </View>
            }
          />
        </View>
      </View>

      <ScrollView style={{marginTop: 15}}>
        {filteredSites?.length > 0 &&
          filteredSites?.map((site: any, index: number) => {
            if (!site?.name) return;
            const siteId = site?.id || site?.name + index;
            const siteName = site?.name;
            let siteImage = {uri: site?.image};
            let challengesAvailable;
            const challengeDistance = "0 Miles away";
            let challenges = [];
            switch (selectedMode?.mode) {
              case AR_MODES.GEO_TAG_MODE:
                challengesAvailable = "1 Tag";
                challenges = [site?.pin_challenge];
                break;
              case AR_MODES.SCAN_MODE:
                const numberChallengesAvailable = site?.scan_pictures?.length || 1;
                challengesAvailable = `${numberChallengesAvailable} Gem${
                  numberChallengesAvailable === 1 ? "" : "s"
                }`;
                siteImage = site?.image
                  ? {uri: site.image}
                  : require("../../assets/images/AppSettingsIcon.png");
                challenges = site?.scan_pictures;
                break;
              case AR_MODES.HUNT_MODE:
                challengesAvailable = "1 Hunt";
                challenges = [site?.pin_challenge];
                break;
            }

            const isExpanded = expandedSites.includes(siteId);

            return (
              <View key={siteId} style={{marginBottom: 15}}>
                <TouchableOpacity
                  onPress={() =>
                    setExpandedSites(prev =>
                      prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId]
                    )
                  }
                  style={{
                    backgroundColor: theme.lightColors?.grey4,
                    borderRadius: 4,
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={siteImage}
                    style={{width: 70, height: 50, borderRadius: 6, marginRight: 10}}
                  />
                  <View style={{flex: 1}}>
                    <Text style={{color: "white", fontSize: 16, fontWeight: "bold"}}>
                      {siteName}
                    </Text>
                    <View style={{flexDirection: "row", gap: 8}}>
                      <View style={{flexDirection: "row", alignItems: "center", gap: 2}}>
                        <Icon name="pinrosa" family="custom" size={15} />
                        <Text style={{color: theme.lightColors?.grey0, fontSize: 10}}>
                          {challengesAvailable}
                        </Text>
                      </View>
                      <View style={{flexDirection: "row", alignItems: "center", gap: 2}}>
                        <Icon
                          name="walkingIcon"
                          color={theme.lightColors?.magenta}
                          family="custom"
                          size={15}
                        />
                        <Text style={{color: theme.lightColors?.grey0, fontSize: 10}}>
                          {challengeDistance}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View>
                    {isExpanded ? (
                      <Icon name="up" size={20} color={theme.lightColors?.grey0} />
                    ) : (
                      <Icon name="down" size={20} color={theme.lightColors?.grey0} />
                    )}
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <FlatList
                    data={challenges}
                    keyExtractor={(item: any, index: number) => item?.id || item?.name + index}
                    renderItem={({item}: {item: any}) => {
                      let challengeTitle = "";
                      let attemptsDetails = "";
                      let sponsorImage = "";
                      const points = item?.points || 0;
                      let coolDownHours = item?.cooldownHours || 0;
                      let onPressHandler = () => startChallengeHandler(site);

                      switch (selectedMode?.mode) {
                        case AR_MODES.GEO_TAG_MODE:
                          challengeTitle = item?.name;
                          attemptsDetails = `${site?.user_attempts || 0}/${
                            site?.challenge_attempt || 0
                          } Check-Ins`;
                          sponsorImage = site?.sponsor?.image;
                          coolDownHours = 0; // TODO: Missing cool down hours on the API response
                          break;
                        case AR_MODES.SCAN_MODE:
                          challengeTitle = item?.name;
                          attemptsDetails = `${item?.user_attempts || 0}/${
                            item?.attempts || 0
                          } Gems`;
                          sponsorImage = item?.sponsor?.image;
                          coolDownHours = item?.cooldown_hours || 0;
                          const updatedSite = {
                            ...site,
                            // Remove list of challenges
                            scan_pictures: null,
                            // Set the 'selected challenge'
                            scanChallenge: {
                              ...item,
                            },
                          };
                          onPressHandler = () => startChallengeHandler(updatedSite);
                          break;
                        case AR_MODES.HUNT_MODE:
                          challengeTitle = site?.pin_challenge?.name;
                          attemptsDetails = `${site?.user_attempts || 0}/${
                            site?.challenge_attempt || 0
                          } Captures`;
                          sponsorImage = site?.sponsor?.image;
                          coolDownHours = 0; // TODO: Missing cool down hours on the API response
                          break;
                      }

                      return (
                        <ARChallengeItem
                          title={challengeTitle}
                          points={points}
                          attemptsDetails={attemptsDetails}
                          coolDownHours={coolDownHours}
                          sponsorImage={sponsorImage}
                          onPress={onPressHandler}
                        />
                      );
                    }}
                  />
                )}
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
};

export default ARModeSiteList;
