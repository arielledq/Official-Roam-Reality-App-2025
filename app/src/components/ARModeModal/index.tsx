// Debido a la longitud y estructura del código, lo dividiré en dos partes:
// 1. Archivo principal del modal (`ARModeModal.tsx`)
// 2. Componentes separados para cada modo (`ARModeView`, `ScanModeView`, `HuntModeView`)

// Comenzamos creando el archivo principal con uso de ModeRenderer

import React, {useState, useEffect, useContext} from "react";
import {View, Text, StyleSheet} from "react-native";
import ReactNativeModal from "react-native-modal";
import {GeolocationContext} from "GeolocationProvider";
import {useSelector} from "react-redux";

import {getNextStar as getNextStarApi} from "network";
import {FontSizes} from "util/FontUtils";
import theme from "assets/theme";
import {AR_MODES, AR_MODES_MENU, ARModeType, MODES, ModeType} from "constants";

import {AppButton} from "components";
import FullScreenLoadingSpinner from "components/FullScreenLoadingSpinner.tsx";
import Icon from "components/Icon";

import ARModeMenu from "./ARModeMenu.tsx";
import ScanModeView from "./ARModes/ScanModeView.tsx";
import HuntModeView from "./ARModes/HuntModeView.tsx";
import GeoTagModeView from "./ARModes/GeoTagModeView.tsx";

interface Option {
  id: string;
  name: string;
}

interface ARModeModalProps {
  isVisible: boolean;
  onClose: () => void;
  // onPointsGranted: () => void;
  // sponsor: any;
  selectedDestination: any;
  // setShowNotification: () => void;
  // setNotificationMode: () => void;
}

const ARModeModal = ({
  isVisible = false,
  onClose,
  // onPointsGranted,
  // sponsor,
  selectedDestination = [],
}: // setShowNotification,
// setNotificationMode,
ARModeModalProps) => {
  const [selectedMode, setSelectedMode] = useState<Option | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
  const [selectedDropdownValue, setSelectedDropdownValue] = useState<number | null>(null);
  const [expandedSites, setExpandedSites] = useState<string[]>([]);
  const [selectedChallengeData, setSelectedChallengeData] = useState(null);
  const [updatedSponsorsData, setUpdatedSponsorsData] = useState([]);
  const selectedDestinations = useSelector(state => state);
  const {userLocation} = useContext(GeolocationContext);

  // console.log(selectedDestinations);

  useEffect(() => {
    if (isVisible) {
      setSelectedMode(null);
    }
  }, [isVisible]);

  useEffect(() => {
    const fetchNextStarData = async () => {
      if (selectedMode === MODES.HUNT && userLocation) {
        const mapped = mapAllDestinationsToSponsors(selectedDestination);
        const updated = await Promise.all(
          mapped.map(async sponsor => {
            const siteWithUpdates = await Promise.all(
              sponsor.challenges.map(async challenge => {
                try {
                  const response = await getNextStarApi({
                    geo_site_id: 772,
                    lat: userLocation.latitude,
                    lon: userLocation.longitude,
                  });
                  if (response?.id) return {...challenge, starData: response};
                } catch (e) {
                  console.error("Error en getNextStar", e);
                }
                return challenge;
              })
            );
            return {...sponsor, challenges: siteWithUpdates};
          })
        );
        console.log("⭐ Updated sponsors with stars:", updated);
        setUpdatedSponsorsData(updated);
      }
    };

    fetchNextStarData();
  }, [selectedMode]);

  const mapAllDestinationsToSponsors = (destinations = []) => {
    return destinations.map(destination => ({
      id: destination?.id?.toString(),
      location: destination?.name,
      backgroundImage: {uri: destination?.image},
      hunts: 5,
      miles: 100,
      challenges: (destination?.star_ar_sites || [])
        .filter(site => site?.pin_challenge && site?.pin_challenge?.sponsored)
        .map(site => ({
          ...site,
          id: site?.id?.toString(),
          title: site?.name,
          points: site?.pin_challenge?.points || 0,
          captures: {current: 0, total: 100},
          cooldownHours: 0,
          logo: {uri: site?.pin_challenge?.sponsored?.image || ""},
        })),
    }));
  };

  const closeModalHandler = () => {
    setSelectedMode(null);
    onClose();
  };

  const renderModeComponent = () => {
    const props = {
      selectedSponsors,
      setSelectedSponsors,
      selectedDropdownValue,
      setSelectedDropdownValue,
      expandedSites,
      setExpandedSites,
      selectedChallengeData,
      setSelectedChallengeData,
      closeModalHandler,
      // onPointsGranted,
      allSponsors:
        selectedMode === MODES.HUNT
          ? updatedSponsorsData
          : mapAllDestinationsToSponsors(selectedDestination),
      // setShowNotification,
      // setNotificationMode,
    };

    switch (selectedMode?.id) {
      case AR_MODES.GEO_TAG_MODE:
        return <GeoTagModeView {...props} />;
      case AR_MODES.SCAN_MODE:
        return <ScanModeView {...props} />;
      case AR_MODES.HUNT_MODE:
        return <HuntModeView {...props} />;
      default:
        return (
          <ARModeMenu options={AR_MODES_MENU} onPress={(mode: Option) => setSelectedMode(mode)} />
        );
    }
  };

  if (!isVisible) return null;

  return (
    <View style={{flex: 1, position: "absolute", top: 0, bottom: 0, left: 0, right: 0}}>
      <ReactNativeModal
        isVisible={isVisible}
        onDismiss={closeModalHandler}
        onBackdropPress={closeModalHandler}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.lightColors?.boxStatBG,
              height: selectedMode === "ar" ? 270 : "auto",
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              position: "absolute",
              right: 10,
              top: 10,
            }}
          >
            <AppButton
              onPress={closeModalHandler}
              customColors={["transparent", "transparent"]}
              icon={<Icon name="closes" color="#C881F0" family="custom" size={30} />}
            ></AppButton>
          </View>
          <Text style={{fontSize: FontSizes.S20, fontWeight: "bold", color: "#fff"}}>
            {selectedMode?.name || "AR MODE"}
          </Text>
          {renderModeComponent()}
          <FullScreenLoadingSpinner isLoading={loading} />
        </View>
      </ReactNativeModal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
    gap: 16,
    maxHeight: "80%",
  },
});

export default ARModeModal;
