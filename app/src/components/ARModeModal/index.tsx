// Debido a la longitud y estructura del código, lo dividiré en dos partes:
// 1. Archivo principal del modal (`ARModeModal.tsx`)
// 2. Componentes separados para cada modo (`ARModeView`, `ScanModeView`, `HuntModeView`)

// Comenzamos creando el archivo principal con uso de ModeRenderer

import React, {useState, useEffect, useContext} from "react";
import {View, Text, StyleSheet} from "react-native";
import ReactNativeModal from "react-native-modal";
import {GeolocationContext} from "GeolocationProvider";

import {getNextStar as getNextStarApi} from "network";
import {FontSizes} from "util/FontUtils";
import theme from "assets/theme";
// @ts-ignore
import {AR_MODES_MENU, MODES} from "constants";

import {AppButton} from "components";
import FullScreenLoadingSpinner from "components/FullScreenLoadingSpinner.tsx";
import Icon from "components/Icon";

import ARModeMenu from "./ARModeMenu.tsx";
// import ScanModeView from "./ARModes/ScanModeView.tsx";
// import HuntModeView from "./ARModes/HuntModeView.tsx";
// import GeoTagModeView from "./ARModes/ARModeView.tsx";
import ARModeSiteList from "./ARModeSiteList.tsx";

interface Option {
  id: string;
  name: string;
}

interface ARModeModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDestination: any;
  setShowNotification: () => void;
  setNotificationMode: () => void;
}

const ARModeModal = ({
  isVisible = false,
  onClose,
  // onPointsGranted,
  // sponsor,
  setShowNotification,
  setNotificationMode,
  selectedDestination = [],
}: ARModeModalProps) => {
  const [selectedMode, setSelectedMode] = useState<Option | null>(null);
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  // const [selectedChallengeData, setSelectedChallengeData] = useState(null);
  const [updatedSponsorsData, setUpdatedSponsorsData] = useState<any>([]);
  const {userLocation} = useContext(GeolocationContext);

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
              sponsor.challenges.map(async (challenge: any) => {
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
    return destinations.map((destination: any) => ({
      id: destination?.id?.toString(),
      location: destination?.name,
      backgroundImage: {uri: destination?.image},
      hunts: 5,
      miles: 100,
      challenges: (destination?.star_ar_sites || [])
        .filter((site: any) => site?.pin_challenge && site?.pin_challenge?.sponsored)
        .map((site: any) => ({
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
    if (selectedMode?.id) {
      return (
        <ARModeSiteList
          selectedMode={selectedMode}
          onClose={closeModalHandler}
          setShowNotification={setShowNotification}
          setNotificationMode={setNotificationMode}
        />
      );
    } else {
      return (
        <ARModeMenu options={AR_MODES_MENU} onPress={(mode: Option) => setSelectedMode(mode)} />
      );
    }
    // switch (selectedMode?.id) {
    //   case AR_MODES.GEO_TAG_MODE:

    //   case AR_MODES.SCAN_MODE:
    //     return <ScanModeView {...props} />;
    //   case AR_MODES.HUNT_MODE:
    //     return <HuntModeView {...props} />;
    //   default:

    // }
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
              height: selectedMode === null ? 270 : "auto",
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
