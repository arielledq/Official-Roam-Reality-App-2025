import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
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
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import {FontSizes} from "util/FontUtils";
import {Dropdown} from "react-native-element-dropdown";

interface ARModeSiteListProps {
  selectedMode: any;
  onStartChallenge: (site: any) => void;
  onClose: () => void;
}
async function checkHuntGate(starId: number) {
  try {
    const rsp = await checkHuntCoolDownAPI(starId);

    if (rsp?.status === 1) {
      return {ok: true, reason: rsp?.message || "OK"};
    }

    if (rsp?.status >= 200 && rsp?.status < 300) {
      return {ok: true, reason: rsp?.message || "OK"};
    }

    if (rsp?.errorStatus) {
      const msg = rsp?.message?.message || rsp?.message;
      const first = rsp?.errorStatus === 404 && /None does not exist/i.test(String(msg || ""));
      if (first) return {ok: true, reason: "FIRST_ATTEMPT"};
      return {ok: false, reason: msg || `HTTP ${rsp.errorStatus}`};
    }

    return {ok: true, reason: rsp?.message || "OK"};
  } catch (e: any) {
    const status = e?.response?.status || e?.errorStatus || "n/a";
    const msg = e?.response?.data?.message || e?.message?.message || e?.message || "Blocked";

    return {ok: false, reason: `${msg} (status ${status})`};
  }
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
  const [filteredSites, setFilteredSites] = useState<any>([]);

  const startChallengeHandler = async (site: any) => {
    let updatedSiteData = {
      ...site,
      selectedMode,
    };
    switch (selectedMode?.mode) {
      case AR_MODES.HUNT_MODE: {
        const starId = Number(site?.ar_star?.id);
        const geoSiteId = site?.id;

        if (!geoSiteId || !starId) {
          Toast.show({
            type: "error",
            text1: "Hunt Challenge",
            text2: "Missing ar_star.id from the site.",
          });
          onClose();
          return;
        }

        const gate = await checkHuntGate(starId);

        if (!gate.ok) {
          Toast.show({
            type: "info",
            text1: "Hunt Cooldown",
            text2: String(gate.reason || "Cooldown active. Please try again later."),
          });
          onClose();
          return;
        }

        let {latitude: lat, longitude: lon} = initialUserLocation || {};
        const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          await wait(300);
          ({latitude: lat, longitude: lon} = initialUserLocation || {});
        }
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          Toast.show({
            type: "info",
            text1: "Location",
            text2: "No location found yet. Please try again.",
          });
          onClose();
          return;
        }

        let hasNextStar = false;
        try {
          const huntChallenge = await getNextStar(geoSiteId, lat as number, lon as number);
          if (huntChallenge?.id) {
            hasNextStar = true;
            updatedSiteData = {...updatedSiteData, huntChallenge: {...huntChallenge}};
          }
        } catch (error: any) {
          Toast.show({
            type: "error",
            text1: "Hunt Challenge",
            text2: error?.message || "The next star could not be obtained.",
          });
        }

        if (!hasNextStar) {
          Toast.show({
            type: "success",
            text1: "Complete Hunt",
            text2: gate?.reason || "You have collected all the stars.",
          });
          getSitesHandler(selectedSponsor?.value?.toString() || "");
          onClose();
          return;
        }

        onStartChallenge(updatedSiteData);
        onClose();
        break;
      }

      case AR_MODES.SCAN_MODE: {
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

  function formatCooldownTime(cooldown: string): number {
    if (!cooldown) return 0;

    const [hourStr] = cooldown.split(":");
    const hours = parseInt(hourStr, 10);

    return isNaN(hours) ? 0 : hours;
  }
  function getCooldownTotalMinutes(cooldown: string): number {
    if (!cooldown || typeof cooldown !== "string") return 0;

    const parts = cooldown.split(":");

    // Esperar al menos "hh:mm"
    if (parts.length < 2) return 0;

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) return 0;

    return hours * 60 + minutes;
  }

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        paddingTop: heightPercentageToDP("20%"),
        paddingHorizontal: widthPercentageToDP("4%"),
      }}
    >
      <LinearGradient
        colors={["#7a00cf", "#5532ff"]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={{
          flexDirection: "row",
          height: heightPercentageToDP("7%"),
          alignItems: "center",
          borderRadius: 8,
          marginVertical: heightPercentageToDP(2),
        }}
      >
        <View
          style={{
            width: "20%",
            height: "100%",

            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={!selectedSponsor?.value ? Images.AppLogo : {uri: selectedSponsor?.image}}
            style={{
              height: "70%",
              width: "70%",
              borderRadius: 10,
            }}
            resizeMode="contain"
          />
        </View>

        <Dropdown
          style={{
            width: "75%",
            height: "100%",
            backgroundColor: "transparent",
          }}
          data={sponsorData}
          containerStyle={{
            borderWidth: 0,
            backgroundColor: theme.lightColors?.inputBG || "#222",
          }}
          maxHeight={500}
          labelField="label"
          valueField="value"
          selectedTextStyle={{
            ...fontGroup.nunitoBold,
            fontWeight: "bold",
            color: theme.lightColors?.white,
            fontSize: FontSizes.S16,
          }}
          itemTextStyle={{
            ...fontGroup.nunitoBold,
            textTransform: "uppercase",
            fontWeight: "bold",
            color: theme.lightColors?.white,
            fontSize: 14,
          }}
          placeholder={"Filter AR by brand"}
          placeholderStyle={{
            ...fontGroup.nunitoBold,
            fontSize: FontSizes.S16,
            fontWeight: "bold",
            color: theme.lightColors?.white,
          }}
          renderRightIcon={() => (
            <Icon name="chevron-down" family="ionicon" size={25} color={theme.lightColors?.white} />
          )}
          activeColor={theme.lightColors?.inputBG}
          value={selectedSponsor?.value?.toString().toUpperCase() || ""}
          onChange={item => {
            setSelectedSponsor(item);
          }}
        />
      </LinearGradient>

      {/* <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 25,
        }}
      >
        <Text style={{fontSize: FontSizes.S18, fontWeight: "bold", color: "white", flex: 1}}>
          Ar available at this time
        </Text>
        <View style={{width: widthPercentageToDP("35%")}}>
          <AppButton
            // @ts-ignore
            customColors={[theme.lightColors?.grey4, theme.lightColors?.grey4]}
            containerStyle={{
              paddingVertical: 0,
              borderRadius: 4,
              // minHeight: heightPercentageToDP("6%"),
            }}
            iconContainerStyle={{
              padding: 0,
            }}
            titleStyle={{
              fontSize: FontSizes.S18,
              color: "#7e8493",
              fontWeight: "bold",
              paddingRight: widthPercentageToDP(2),
              marginTop: heightPercentageToDP(0.5),
            }}
            onPress={() => getSitesHandler()}
            title="Refresh"
            iconPosition="right"
            icon={<RefreshIcon width={widthPercentageToDP(20)} height={widthPercentageToDP(20)} />}
          />
        </View>
      </View> */}

      <FlatList
        style={{marginTop: 10}}
        data={
          filteredSites?.reduce((allChallenges: any[], site: any) => {
            if (!site?.name) return allChallenges;

            let challenges = [];
            switch (selectedMode?.mode) {
              case AR_MODES.GEO_TAG_MODE:
                challenges = [site?.pin_challenge];
                break;
              case AR_MODES.SCAN_MODE:
                challenges = site?.scan_pictures || [];
                break;
              case AR_MODES.HUNT_MODE:
                challenges = [site?.huntChallenge];
                break;
            }

            // Add site reference to each challenge
            const challengesWithSite = challenges.map((challenge: any, index: number) => ({
              ...challenge,
              site: site,
              uniqueId: `${site?.id || site?.name}-${challenge?.id || challenge?.name || index}`,
            }));

            return [...allChallenges, ...challengesWithSite];
          }, []) || []
        }
        keyExtractor={(item: any) => item?.uniqueId || item?.id || Math.random().toString()}
        renderItem={({item}: {item: any}) => {
          const site = item?.site;
          let challengeTitle = "";
          let attemptsDetails = "";
          let sponsorImage = "";
          const points = item?.points || 0;
          let coolDownHours = 0;
          let totalAttempts = 0;
          let currentAttempts = 0;
          let coolDownMin = 0;
          let isDisabled = false;
          let onPressHandler = () => startChallengeHandler(site);

          switch (selectedMode?.mode) {
            case AR_MODES.GEO_TAG_MODE:
              challengeTitle = item?.name;
              attemptsDetails = `${site?.user_attempts || 0}/${
                site?.challenge_attempt || 0
              } Check-Ins`;
              sponsorImage = site?.sponsor?.image;
              coolDownHours = formatCooldownTime(site?.checkin_cooldown) || 0;
              coolDownMin = getCooldownTotalMinutes(site?.checkin_cooldown) || 0;
              isDisabled = coolDownMin > 0;
              break;
            case AR_MODES.SCAN_MODE:
              challengeTitle = item?.name;
              attemptsDetails = `${item?.user_attempts || 0}/${item?.attempts || 0}`;
              totalAttempts = item?.attempts || 0;
              currentAttempts = item?.user_attempts || 0;
              sponsorImage = item?.sponsor?.image;
              coolDownHours = formatCooldownTime(item.cooldown) || 0;
              coolDownMin = getCooldownTotalMinutes(item.cooldown) || 0;
              isDisabled = coolDownMin > 0;
              const updatedSite = {
                ...site,
                scan_pictures: null,
                scanChallenge: {
                  ...item,
                },
              };
              onPressHandler = () => startChallengeHandler(updatedSite);
              break;
            case AR_MODES.HUNT_MODE:
              challengeTitle = site?.ar_star?.name;
              attemptsDetails = `${site?.ar_star?.user_attempts || 0}/${
                site?.ar_star?.attempts || 0
              }`;
              totalAttempts = site?.ar_star?.attempts || 0;
              currentAttempts = site?.ar_star?.user_attempts || 0;
              sponsorImage = site?.ar_star?.sponsored?.[0]?.image;
              coolDownHours = formatCooldownTime(site?.hunt_cooldownn) || 0;
              coolDownMin = getCooldownTotalMinutes(site?.hunt_cooldown) || 0;
              isDisabled = coolDownMin > 0;

              break;
          }

          return (
            <View style={{marginBottom: 10}}>
              <ARChallengeItem
                title={challengeTitle}
                points={points}
                attemptsDetails={attemptsDetails}
                totalAttempts={totalAttempts}
                currentAttempts={currentAttempts}
                coolDownHours={coolDownHours}
                sponsorImage={sponsorImage}
                onPress={onPressHandler}
                disabled={isDisabled}
              />
            </View>
          );
        }}
        ListEmptyComponent={() => (
          <View style={{alignItems: "center", justifyContent: "center", paddingVertical: 20}}>
            {!filteredSites || filteredSites.length === 0 ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={{color: "#fff", marginTop: 8}}>Loading Sites…</Text>
              </>
            ) : (
              <Text style={{color: "#7e8493"}}>No challenges available</Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default ARModeSiteList;
