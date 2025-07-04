import React, {useContext, useEffect} from "react";
import {View, Text, Image, TouchableOpacity, ScrollView, StyleSheet} from "react-native";

import AppDropdown from "components/Dropdown";
import {AppButton} from "components";
import RefreshIcon from "assets/svg/Refresh.tsx";
import Images from "assets/images";
import Icon from "components/Icon";
import {AR_MODES_TYPE_ID} from "constants";
import {GeolocationContext} from "GeolocationProvider";
import {getARSites as getSitesApi} from "network";

const GeoTagModeView = ({
  selectedSponsors,
  setSelectedSponsors,
  selectedDropdownValue,
  setSelectedDropdownValue,
  expandedSites,
  setExpandedSites,
  allSponsors,
  closeModalHandler,
  onPointsGranted,
  setSelectedChallengeData,
  setShowNotification,
  setNotificationMode,
}) => {
  const {userLocation} = useContext(GeolocationContext);

  const getSites = async () => {
    const payload = {
      lat: userLocation?.latitude,
      lon: userLocation?.longitude,
      site_type: AR_MODES_TYPE_ID.GEO_TAG_MODE,
      sponsor: selectedSponsors,
    };

    const response = await getSitesApi(payload);
    console.log("🚀 ~ getSites ~ response:", response);
  };

  useEffect(() => {
    console.log("🚀 ~ useEffect ~ selectedSponsors:", selectedSponsors);
    getSites();
  }, [selectedSponsors]);

  const SITE = [
    {label: "ALL GEO-TAGS", value: "ALL"},
    ...allSponsors.map(site => ({
      label: site.location,
      value: site.id,
    })),
  ];

  const selectAllSponsors = () => {
    const allIds = allSponsors.map(site => site.id);
    setSelectedSponsors(allIds);
  };

  const toggleSiteAccordion = siteId => {
    setExpandedSites(prev =>
      prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId]
    );
  };

  const filteredSponsors = selectedDropdownValue
    ? allSponsors.filter(site => site.id === selectedDropdownValue.toString())
    : selectedSponsors.length > 0
    ? allSponsors.filter(site => selectedSponsors.includes(site.id))
    : allSponsors;

  return (
    <View style={{width: "100%", maxHeight: "85%"}}>
      <View style={{flexDirection: "row", alignItems: "center", gap: 15}}>
        <Image source={Images.Home} style={{height: 60, width: 60, borderRadius: 110}} />
        <AppDropdown
          data={SITE}
          maxHeight={300}
          containerStyle={{flex: 1}}
          labelField="label"
          valueField="value"
          selectedTextStyle={{fontSize: 14}}
          placeholder="Select Sponsor"
          activeColor="#3D3E58"
          value={selectedDropdownValue}
          onChange={item => {
            if (item.value === "ALL") {
              selectAllSponsors();
              setSelectedDropdownValue(null);
            } else {
              setSelectedDropdownValue(item.value);
              setSelectedSponsors([item.value.toString()]);
            }
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
        <Text style={{fontSize: 18, fontWeight: "bold", color: "white"}}>Geo-Tags Available</Text>
        <AppButton
          customColors={["#222", "#222"]}
          buttonStyle={{paddingHorizontal: 10, borderRadius: 15}}
          titleStyle={{fontSize: 10, color: "#7e8493"}}
          onPress={selectAllSponsors}
          title="Refresh"
          icon={<RefreshIcon />}
        />
      </View>

      <ScrollView style={{marginTop: 15}}>
        {filteredSponsors.map(site => {
          const isExpanded = expandedSites.includes(site.id);
          return (
            <View key={site.id} style={{marginBottom: 15}}>
              <TouchableOpacity
                onPress={() => toggleSiteAccordion(site.id)}
                style={{
                  backgroundColor: "#2C2D3F",
                  borderRadius: 10,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Image
                  source={site.backgroundImage}
                  style={{width: 50, height: 50, borderRadius: 6, marginRight: 10}}
                />
                <View style={{flex: 1}}>
                  <Text style={{color: "white", fontSize: 16, fontWeight: "bold"}}>
                    {site.location}
                  </Text>
                  <View style={{flexDirection: "row", gap: 10}}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                      <Icon name="pinrosa" family="custom" size={20} />
                      <Text style={{color: "#C881F0", fontSize: 12}}> {site.hunts} Gems </Text>
                    </View>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                      <Icon name="walkingIcon" color="#C881F0" family="custom" size={20} />
                      <Text style={{color: "#C881F0", fontSize: 12}}>{site.miles} Miles</Text>
                    </View>
                  </View>
                </View>
                <Text style={{color: "white", fontSize: 18}}>{isExpanded ? "▲" : "▼"}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={{marginTop: 10}}>
                  {site.challenges.map(challenge => (
                    <TouchableOpacity
                      key={challenge.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        const challengeData = {
                          lat_long: challenge.lat_long,
                          challenge_requirement: challenge.pin_challenge?.challenge_requirement,
                          challenge_id: challenge.id,
                          model_file: challenge.pin_challenge?.model_file,
                          parameters: challenge.pin_challenge?.parameters,
                          points: challenge.pin_challenge?.points,
                        };

                        setSelectedChallengeData(challengeData);

                        // Cerrar primero el modal actual
                        closeModalHandler();
                        // onPointsGranted("scan", () => challengeData);

                        // Mostrar la notificación luego de un pequeño delay
                        setTimeout(() => {
                          setNotificationMode("scan");
                          setShowNotification(true);
                        }, 1000); // 300ms funciona bien visualmente
                      }}
                      style={{
                        backgroundColor: "#1E1F30",
                        borderRadius: 10,
                        flexDirection: "row",
                        alignItems: "center",
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
                          {challenge.points}
                        </Text>
                        <Text style={{color: "white", fontSize: 10}}>Points</Text>
                      </View>
                      <View style={{flex: 1, marginLeft: 10}}>
                        <Text style={{color: "white", fontSize: 14, fontWeight: "bold"}}>
                          {challenge.title}
                        </Text>
                        <View style={{flexDirection: "row", alignItems: "center", marginTop: 2}}>
                          <Text style={{color: "#C881F0", fontSize: 12}}>
                            {challenge.captures.current}/{challenge.captures.total} Captures
                          </Text>
                          <Text style={{color: "#C881F0", fontSize: 12, marginLeft: 10}}>
                            ⏱ {challenge.cooldownHours}Hrs Cooldown
                          </Text>
                        </View>
                      </View>
                      <Image
                        source={challenge.logo}
                        style={{width: 40, height: 40, borderRadius: 20}}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default GeoTagModeView;
