// Debido a la longitud y estructura del código, lo dividiré en dos partes:
// 1. Archivo principal del modal (`ARModeModal.tsx`)
// 2. Componentes separados para cada modo (`ARModeView`, `ScanModeView`, `HuntModeView`)

// Comenzamos creando el archivo principal con uso de ModeRenderer

import React, { useState, useEffect, useContext } from "react";
import {View, Text, StyleSheet, Touchable} from "react-native";
import ReactNativeModal from "react-native-modal";
import { FontSizes } from "util/FontUtils";
import FullScreenLoadingSpinner from "components/FullScreenLoadingSpinner.tsx";
import {AppButton} from "components";
import theme from "assets/theme";
import { MODES, ModeType } from "../../constants";
import { getNextStar as getNextStarApi } from "network";
import { GeolocationContext } from "GeolocationProvider";
import ARModeView from "./ARModeView.tsx"
import ScanModeView from "./ScanModeView.tsx";
import HuntModeView from './HuntModeView.tsx';
import {useSelector} from "react-redux";
import Icon from "components/Icon";

const ARModeModal = ({
                         isVisible = false,
                         onClose,
                         onPointsGranted,
                         sponsor,
                         selectedDestination = [],
                         setShowNotification,
                         setNotificationMode,
                     }) => {
    const [mode, setMode] = useState<ModeType>(MODES.AR);
    const [loading, setLoading] = useState(false);
    const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
    const [selectedDropdownValue, setSelectedDropdownValue] = useState<number | null>(null);
    const [expandedSites, setExpandedSites] = useState<string[]>([]);
    const [selectedChallengeData, setSelectedChallengeData] = useState(null);
    const [updatedSponsorsData, setUpdatedSponsorsData] = useState([]);
    const selectedDestinations = useSelector(state => state);
    const { userLocation } = useContext(GeolocationContext);
    console.log(selectedDestinations)
    useEffect(() => {
        if (isVisible) {
            setMode(MODES.AR);
        }
    }, [isVisible]);

    useEffect(() => {
        const fetchNextStarData = async () => {
            if (mode === MODES.HUNT && userLocation) {
                const mapped = mapAllDestinationsToSponsors(selectedDestination);
                const updated = await Promise.all(
                    mapped.map(async (sponsor) => {
                        const siteWithUpdates = await Promise.all(
                            sponsor.challenges.map(async (challenge) => {
                                try {
                                    const response = await getNextStarApi({
                                        geo_site_id: 772,
                                        lat: userLocation.latitude,
                                        lon: userLocation.longitude,
                                    });
                                    if (response?.id) return { ...challenge, starData: response };
                                } catch (e) {
                                    console.error("Error en getNextStar", e);
                                }
                                return challenge;
                            })
                        );
                        return { ...sponsor, challenges: siteWithUpdates };
                    })
                );
                console.log("⭐ Updated sponsors with stars:", updated);
                setUpdatedSponsorsData(updated);
            }
        };

        fetchNextStarData();
    }, [mode]);

    const mapAllDestinationsToSponsors = (destinations = []) => {
        return destinations.map((destination) => ({
            id: destination?.id?.toString(),
            location: destination?.name,
            backgroundImage: { uri: destination?.image },
            hunts: 5,
            miles: 100,
            challenges: (destination?.star_ar_sites || [])
                .filter((site) => site?.pin_challenge && site?.pin_challenge?.sponsored)
                .map((site) => ({
                    ...site,
                    id: site?.id?.toString(),
                    title: site?.name,
                    points: site?.pin_challenge?.points || 0,
                    captures: { current: 0, total: 100 },
                    cooldownHours: 0,
                    logo: { uri: site?.pin_challenge?.sponsored?.image || "" },
                })),
        }));
    };

    const MODE_TITLES: Record<ModeType, string> = {
        ar: "AR MODE",
        scan: "SCAN MODE",
        hunt: "HUNT MODE",
        checkin: "CHECK-IN MODE",
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
            onClose,
            onPointsGranted,
            allSponsors: mode === MODES.HUNT ? updatedSponsorsData : mapAllDestinationsToSponsors(selectedDestination),
            setShowNotification,
            setNotificationMode,
        };

        switch (mode) {
            case MODES.SCAN:
                return <ScanModeView {...props} />;
            case MODES.CHECKIN:
                return <ScanModeView {...props} />;
            case MODES.HUNT:
                return <HuntModeView {...props} />;
            default:
                return <ARModeView setMode={setMode} onClose={onClose} />;
        }
    };

    if (!isVisible) return null;

    return (
        <View style={{ flex: 1, position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
            <ReactNativeModal isVisible={isVisible} onDismiss={onClose} onBackdropPress={onClose}>
                <View style={[styles.modalContent, { backgroundColor: theme.lightColors?.boxStatBG, height: mode === 'ar' ? 270 : 'auto'}]}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", position: "absolute", right: 10, top:10,}}>
                      <AppButton onPress={onClose} customColors={["transparent", "transparent"]} icon={<Icon name="closes" color="#C881F0" family="custom" size={30} />}></AppButton>
                  </View>
                    <Text style={{ fontSize: FontSizes.S20, fontWeight: "bold", color: "#fff" }}>{MODE_TITLES[mode]}</Text>
                    {renderModeComponent()}
                    <FullScreenLoadingSpinner isLoading={loading} />
                </View>
            </ReactNativeModal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: 'transparent',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 24,
        alignItems: "center",
        gap: 16,
        maxHeight: '80%',

    },
});

export default ARModeModal;
