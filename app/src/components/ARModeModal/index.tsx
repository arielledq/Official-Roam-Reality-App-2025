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
import {AR_MODES_MENU, MODES, ARModeMenuType} from "constants";

import {AppButton} from "components";
import Icon from "components/Icon";

import ARModeMenu from "./ARModeMenu.tsx";
import ARModeSiteList from "./ARModeSiteList.tsx";

interface ARModeModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDestination: any;
  onStartChallenge: () => void;
}

const ARModeModal = ({
  isVisible = false,
  onClose,
  selectedDestination = [],
  onStartChallenge,
}: ARModeModalProps) => {
  const [selectedMode, setSelectedMode] = useState<ARModeMenuType | null>(null);
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
          {selectedMode?.id ? (
            <ARModeSiteList
              selectedMode={selectedMode}
              onClose={closeModalHandler}
              onStartChallenge={onStartChallenge}
            />
          ) : (
            <ARModeMenu
              options={AR_MODES_MENU}
              onPress={(mode: ARModeMenuType) => setSelectedMode(mode)}
            />
          )}
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
