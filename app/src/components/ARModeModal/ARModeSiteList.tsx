import React, {useEffect, useState} from "react";
import {View, Text, Image, TouchableOpacity, ScrollView, FlatList} from "react-native";

import AppDropdown from "components/Dropdown";
import {AppButton} from "components";
import RefreshIcon from "assets/svg/Refresh.tsx";
import Images from "assets/images";
import Icon from "components/Icon";
import useArScreenHook from "hooks/useArScreenHook";
import fontGroup from "assets/fonts";
import userLocationHook from "screens/drawerContent/location.hook";
// @ts-ignore
import {AR_MODES} from "constants";
import ARChallengeItem from "./ARChallengeItem";

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
  const {getSites, sites, getNextStar: getNextStarApi}: any = useArScreenHook();
  const [sponsorData, setSponsorData] = useState<any>([]);
  const [selectedSponsor, setSelectedSponsor] = useState(DEFAULT_SPONSOR);
  const [expandedSites, setExpandedSites] = useState<string[]>([]);
  const [filteredSites, setFilteredSites] = useState<any>([]);

  const startChallengeHandler = async (site: any) => {
    let updatedSiteData = {
      ...site,
      selectedMode,
    };
    if (selectedMode?.mode === AR_MODES.HUNT_MODE) {
      const huntData = await getNextStarApi(
        site.id,
        initialUserLocation.latitude,
        initialUserLocation.longitude
      );
      if (huntData?.id) {
        updatedSiteData = {
          ...updatedSiteData,
          huntChallenge: huntData,
        };
        onClose();
      } else {
        console.log("ya no hay mas estrellas que colectar");
      }
    }
  };

  const getSitesHandler = (sponsorId: string = "") => {
    if (sponsorId) {
      let updatedSites = sites.filter(
        (site: any) => site?.pin_challenge?.sponsored?.id === Number(sponsorId)
      );
      if (selectedMode?.mode === AR_MODES.SCAN_MODE) {
        const ArFiltersChallenges = sites[sites.length - 1];
        const updatedChallenges = ArFiltersChallenges?.challenges?.filter(
          (challenge: any) => challenge?.sponsored?.id === Number(sponsorId)
        );
        setFilteredSites([
          ...updatedSites,
          {...ArFiltersChallenges, challenges: updatedChallenges},
        ]);
      } else {
        setFilteredSites(updatedSites);
      }
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
            backgroundColor: "#27273F",
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
          containerStyle={{flex: 1}}
          labelField="label"
          valueField="value"
          selectedTextStyle={{fontSize: 14, ...fontGroup.nunitoBold, fontWeight: "bold"}}
          itemTextStyle={{
            ...fontGroup.nunitoBold,
            textTransform: "uppercase",
            fontWeight: "bold",
            color: "#fff",
            fontSize: 14,
          }}
          placeholder={selectedSponsor?.label || ""}
          placeholderStyle={{
            ...fontGroup.nunitoBold,
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
          activeColor="#C881F0"
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
        <Text style={{fontSize: 18, fontWeight: "bold", color: "white"}}>
          {selectedMode?.listLabel} Available
        </Text>
        <AppButton
          customColors={["#27273F", "#27273F"]}
          containerStyle={{
            paddingHorizontal: 0,
            borderRadius: 8,
            paddingVertical: 0,
            paddingRight: 5,
            width: 90,
            minHeight: 35,
          }}
          iconContainerStyle={{
            padding: 0,
          }}
          titleStyle={{fontSize: 12, color: "#7e8493", fontWeight: "bold"}}
          onPress={() => getSitesHandler()}
          title="Refresh"
          icon={
            <View style={{paddingHorizontal: 5}}>
              <RefreshIcon />
            </View>
          }
        />
      </View>

      <ScrollView style={{marginTop: 15}}>
        {filteredSites?.length > 0 &&
          filteredSites?.map((site: any) => {
            if (!site?.name) return;
            const isExpanded = expandedSites.includes(site.id);
            const siteName = site?.name;
            let siteImage = {uri: site?.image};
            const siteId = site?.id;

            let challenges = [];
            switch (selectedMode?.mode) {
              case AR_MODES.GEO_TAG_MODE:
                challenges = [site?.pin_challenge];
                break;
              case AR_MODES.SCAN_MODE:
                siteImage = require("../../assets/images/AppSettingsIcon.png");
                challenges = site?.challenges || [];
                break;
              case AR_MODES.HUNT_MODE:
                challenges = [site?.pin_challenge];
                break;
            }

            return (
              <View key={siteId} style={{marginBottom: 15}}>
                <TouchableOpacity
                  onPress={() =>
                    setExpandedSites(prev =>
                      prev.includes(site.id)
                        ? prev.filter(id => id !== site.id)
                        : [...prev, site.id]
                    )
                  }
                  style={{
                    backgroundColor: "#27273F",
                    borderRadius: 10,
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
                    <View style={{flexDirection: "row", gap: 10}}>
                      <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Icon name="pinrosa" family="custom" size={15} />
                        <Text style={{color: "#C881F0", fontSize: 10}}> 1</Text>
                      </View>
                      <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Icon name="walkingIcon" color="#C881F0" family="custom" size={15} />
                        <Text style={{color: "#C881F0", fontSize: 10}}>0 Miles away</Text>
                      </View>
                    </View>
                  </View>
                  <View>
                    {isExpanded ? (
                      <Icon name="up" size={20} color="white" />
                    ) : (
                      <Icon name="down" size={20} color="white" />
                    )}
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <FlatList
                    data={challenges}
                    renderItem={({item}: {item: any}) => {
                      let challengeTitle = "";
                      let attemptsDetails = "";
                      let sponsorImage = "";
                      let onPressHandler = () => startChallengeHandler(site);

                      switch (selectedMode?.mode) {
                        case AR_MODES.GEO_TAG_MODE:
                          challengeTitle = item?.name;
                          attemptsDetails = `${site?.user_attempts || 0}/${
                            site?.challenge_attempt || 0
                          } Check-Ins`;
                          sponsorImage = site?.sponsor?.image;
                          break;
                        case AR_MODES.SCAN_MODE:
                          challengeTitle = item?.name;
                          attemptsDetails = `${item?.user_attempts || 0}/${
                            item?.challenge_attempt || 0
                          } Gems`;
                          sponsorImage = item?.sponsored?.image;
                          onPressHandler = () => startChallengeHandler(item);
                          break;
                        case AR_MODES.HUNT_MODE:
                          challengeTitle = site?.pin_challenge?.name;
                          attemptsDetails = `${site?.user_attempts || 0}/${
                            site?.challenge_attempt || 0
                          } Captures`;
                          sponsorImage = site?.sponsor?.image;
                          break;
                      }

                      return (
                        <ARChallengeItem
                          title={challengeTitle}
                          points={item?.points || 0}
                          attemptsDetails={attemptsDetails}
                          coolDownHours={item?.cooldownHours || 0}
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
