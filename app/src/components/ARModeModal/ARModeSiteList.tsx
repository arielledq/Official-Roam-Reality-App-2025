import React, {useEffect, useCallback, useState} from "react";
import {View, Text, Image, TouchableOpacity, ScrollView} from "react-native";

import AppDropdown from "components/Dropdown";
import {AppButton} from "components";
import RefreshIcon from "assets/svg/Refresh.tsx";
import Images from "assets/images";
import Icon from "components/Icon";
// @ts-ignore
import {AR_MODES_TYPE_ID} from "constants";
import useArScreenHook from "hooks/useArScreenHook";
import fontGroup from "assets/fonts";
import userLocationHook from "screens/drawerContent/location.hook";

interface ARModeSiteListProps {
  selectedMode: any;
  onClose: () => void;
  setShowNotification: (value: boolean) => void;
  setNotificationMode: (value: string) => void;
}

const ARModeSiteList = ({
  selectedMode,
  onClose,
  setShowNotification,
  setNotificationMode,
}: ARModeSiteListProps) => {
  const DEFAULT_SPONSOR = {
    label: `ALL ${selectedMode?.listLabel?.toUpperCase()}`,
    value: 0,
    image: "",
    description: "",
    tags: "",
    created_at: "",
  };

  const {initialUserLocation, getLocation} = userLocationHook();
  const {getSites, sites, sponsors}: any = useArScreenHook();
  const [sponsorData, setSponsorData] = useState([DEFAULT_SPONSOR]);
  const [selectedSponsor, setSelectedSponsor] = useState(DEFAULT_SPONSOR);
  const [expandedSites, setExpandedSites] = useState<string[]>([]);

  const startChallengeHandler = (site: any) => {
    const challengeData = {
      lat_long: site.lat_long,
      challenge_requirement: site.pin_challenge?.challenge_requirement,
      challenge_id: site.pin_challenge?.id,
      model_file: site.pin_challenge?.model_file,
      parameters: site.pin_challenge?.parameters,
      points: site.pin_challenge?.points,
    };

    // setSelectedChallengeData(challengeData);

    // Cerrar primero el modal actual
    onClose();

    // Mostrar la notificación luego de un pequeño delay
    setTimeout(() => {
      setNotificationMode("scan");
      setShowNotification(true);
    }, 1000); // 300ms funciona bien visualmente
  };

  const getSitesHandler = useCallback(() => {
    if (
      typeof initialUserLocation?.latitude === "number" &&
      isFinite(initialUserLocation?.latitude) &&
      typeof initialUserLocation?.longitude === "number" &&
      isFinite(initialUserLocation?.longitude) &&
      !sites?.length
    ) {
      const payload = {
        lat: initialUserLocation?.latitude,
        lon: initialUserLocation?.longitude,
        site_type: selectedMode?.id,
        sponsor: selectedSponsor?.value || "",
      };
      getSites(payload);
    }
  }, [initialUserLocation, selectedSponsor, selectedMode]);

  useEffect(() => {
    if (!sponsors.length) return;

    const updatedSponsorsData = sponsors.map((sponsor: any) => ({
      label: sponsor.name === "ALL" ? DEFAULT_SPONSOR.label : sponsor.name,
      value: sponsor.id,
      ...sponsor,
    }));
    setSponsorData(updatedSponsorsData);
    setSelectedSponsor(updatedSponsorsData[0]);
  }, [sponsors]);

  useEffect(() => {
    getSitesHandler();
  }, [getSitesHandler]);

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <View style={{width: "100%", maxHeight: "85%"}}>
      <View style={{flexDirection: "row", alignItems: "center", gap: 15}}>
        <View
          style={{
            height: 75,
            width: 75,
            borderRadius: 110,
            backgroundColor: "#3D3E58",
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
          placeholder="Select Sponsor"
          activeColor="#3D3E58"
          value={selectedSponsor.value}
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
          customColors={["#222", "#222"]}
          buttonStyle={{paddingHorizontal: 10, borderRadius: 15}}
          titleStyle={{fontSize: 10, color: "#7e8493"}}
          onPress={getSitesHandler}
          title="Refresh"
          icon={<RefreshIcon />}
        />
      </View>

      <ScrollView style={{marginTop: 15}}>
        {sites?.length > 0 &&
          sites?.map((site: any) => {
            if (!site?.name) return;
            const isExpanded = expandedSites.includes(site.id);

            let challengeTitle = "";
            let attemptsDetails = "";
            let sponsorImage = "";
            switch (selectedMode?.id) {
              case AR_MODES_TYPE_ID.GEO_TAG_MODE:
                challengeTitle = site?.pin_challenge?.name;
                attemptsDetails = `${site?.user_attempts || 0}/${
                  site?.challenge_attempt || 0
                } Check-Ins`;
                sponsorImage = site?.sponsor?.image;
                break;
              case AR_MODES_TYPE_ID.SCAN_MODE:
                challengeTitle = site?.sponsored?.name;
                attemptsDetails = `${site?.user_attempts || 0}/${
                  site?.challenge_attempt || 0
                } Gems`;
                sponsorImage = site?.sponsored?.image;
                break;
              case AR_MODES_TYPE_ID.HUNT_MODE:
                challengeTitle = site?.pin_challenge?.name;
                attemptsDetails = `${site?.user_attempts || 0}/${
                  site?.challenge_attempt || 0
                } Captures`;
                sponsorImage = site?.sponsor?.image;
                break;
            }

            return (
              <View key={site.id} style={{marginBottom: 15}}>
                <TouchableOpacity
                  onPress={() =>
                    setExpandedSites(prev =>
                      prev.includes(site.id)
                        ? prev.filter(id => id !== site.id)
                        : [...prev, site.id]
                    )
                  }
                  style={{
                    backgroundColor: "#2C2D3F",
                    borderRadius: 10,
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{uri: site?.image}}
                    style={{width: 70, height: 50, borderRadius: 6, marginRight: 10}}
                  />
                  <View style={{flex: 1}}>
                    <Text style={{color: "white", fontSize: 16, fontWeight: "bold"}}>
                      {site?.name}
                    </Text>
                    <View style={{flexDirection: "row", gap: 10}}>
                      <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Icon name="pinrosa" family="custom" size={15} />
                        <Text style={{color: "#C881F0", fontSize: 10}}> 1</Text>
                      </View>
                      <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Icon name="walkingIcon" color="#C881F0" family="custom" size={15} />
                        <Text style={{color: "#C881F0", fontSize: 10}}>
                          {/* TODO: API is missing the distance to the challenge it self */}
                          {site?.check_in_site_radius || 0} Miles
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={{color: "white", fontSize: 18}}>{isExpanded ? "▲" : "▼"}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{marginTop: 10, marginLeft: 10}}>
                    <TouchableOpacity
                      key={site.pin_challenge?.id}
                      activeOpacity={0.8}
                      onPress={() => startChallengeHandler(site)}
                      style={{
                        backgroundColor: "#1E1F30",
                        borderRadius: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 12,
                        marginBottom: 10,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#7A32F4",
                          borderRadius: 5,
                          padding: 6,
                          alignItems: "center",
                          justifyContent: "center",
                          width: 50,
                        }}
                      >
                        <Text style={{color: "white", fontSize: 14, fontWeight: "bold"}}>
                          {site?.pin_challenge?.points || 0}
                        </Text>
                        <Text style={{color: "white", fontSize: 10}}>Points</Text>
                      </View>
                      <View style={{flex: 1, marginLeft: 10}}>
                        <Text style={{color: "white", fontSize: 12, fontWeight: "bold"}}>
                          {challengeTitle}
                        </Text>
                        <View style={{flexDirection: "row", alignItems: "center", marginTop: 2}}>
                          <Text style={{color: "#C881F0", fontSize: 10}}>{attemptsDetails}</Text>
                          <Text style={{color: "#C881F0", fontSize: 10, marginLeft: 10}}>
                            ⏱ {site?.pin_challenge?.cooldownHours || 0} Hrs Cooldown
                          </Text>
                        </View>
                      </View>
                      <Image
                        source={{uri: sponsorImage}}
                        style={{width: 40, height: 40, borderRadius: 20}}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
};

export default ARModeSiteList;
