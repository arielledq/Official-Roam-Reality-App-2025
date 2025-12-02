import theme from "assets/theme";
import React, {useState, useRef, useEffect} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import {FontSizes} from "util/FontUtils";
import {useIsFocused} from "@react-navigation/native";

const {width: screenWidth} = Dimensions.get("window");

const UnityBottomBar = ({
  selectedMode = "Live", // "Live", "Map", or "List"
  onModeSelect, // Callback when a mode is selected from dropdown
  onMoreInfoPress, // Callback for More Info button (Live mode only)
  onResetARPress, // Callback for Reset AR button (Live mode only)
  onRefreshPress, // Callback for Refresh button (Map/List mode)
  modeLabel,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedModeLabel, setSelectedModeLabel] = useState("Mode"); // Default label
  const [modeButtonLayout, setModeButtonLayout] = useState(null);
  const isFocused = useIsFocused();
  const modeButtonRef = useRef(null);

  const isLiveMode = selectedMode === "Live";

  // Reset mode label when selectedMode changes (switching between Live/Map/List)
  useEffect(() => {
    if (modeLabel) {
      setSelectedModeLabel(modeLabel);
    } else {
      setSelectedModeLabel("Mode");
    }
  }, [modeLabel, isFocused]);

  // Dropdown options
  const modeOptions = [
    {id: "hunt", label: "Hunt Mode"},
    {id: "scan", label: "Scan Mode"},
  ];

  const handleModePress = () => {
    // Measure the mode button position to place dropdown above it
    if (modeButtonRef.current) {
      modeButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setModeButtonLayout({
          x: pageX,
          y: pageY,
          width: width,
          height: height,
        });
        setIsDropdownVisible(true);
      });
    }
  };

  const handleModeOptionSelect = option => {
    setIsDropdownVisible(false);
    setSelectedModeLabel(option.label); // Update button label
    if (onModeSelect) {
      onModeSelect(option);
    }
  };

  const handleCloseDropdown = () => {
    setIsDropdownVisible(false);
  };

  const renderDropdown = () => {
    if (!isDropdownVisible || !modeButtonLayout) return null;

    // Calculate dropdown position (above the button)
    const dropdownBottom = Dimensions.get("window").height - modeButtonLayout.y + 10; // 10px gap above button

    return (
      <Modal transparent visible={isDropdownVisible} onRequestClose={handleCloseDropdown}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseDropdown}
        >
          <View
            style={[
              styles.dropdownContainer,
              {
                position: "absolute",
                bottom: dropdownBottom,
                left: modeButtonLayout.x,
                width: modeButtonLayout.width,
              },
            ]}
          >
            {modeOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.dropdownItem,
                  index === modeOptions.length - 1 && styles.dropdownItemLast,
                ]}
                onPress={() => handleModeOptionSelect(option)}
              >
                <Text style={styles.dropdownItemText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <>
      <View style={styles.bottomBarContainer}>
        {isLiveMode ? (
          // Live Mode: More Info, Scan Mode, Reset AR
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.grayButton} onPress={onMoreInfoPress}>
              <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>
                More Info
              </Text>
            </TouchableOpacity>

            <TouchableOpacity ref={modeButtonRef} onPress={handleModePress}>
              <LinearGradient
                style={styles.grayButton}
                colors={["#7a00cf", "#5532ff"]}
                start={{x: 0, y: 1}}
                end={{x: 1, y: 1}}
              >
                <Text style={styles.buttonTextSelected} numberOfLines={1} adjustsFontSizeToFit>
                  {selectedModeLabel}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.grayButton} onPress={onResetARPress}>
              <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>
                Reset AR
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Map/List Mode: Mode, Refresh
          <View style={styles.buttonsRow}>
            <TouchableOpacity ref={modeButtonRef} onPress={handleModePress}>
              <LinearGradient
                style={{...styles.grayButton, width: widthPercentageToDP("35%")}}
                colors={["#7a00cf", "#5532ff"]}
                start={{x: 0, y: 1}}
                end={{x: 1, y: 1}}
              >
                <Text style={styles.buttonTextSelected} numberOfLines={1} adjustsFontSizeToFit>
                  {selectedModeLabel}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={{...styles.grayButton, width: widthPercentageToDP("35%")}}
              onPress={onRefreshPress}
            >
              <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {renderDropdown()}
    </>
  );
};

const styles = StyleSheet.create({
  bottomBarContainer: {
    width: "100%",
    backgroundColor: "#000000",
    paddingVertical: heightPercentageToDP("2%"),
    paddingHorizontal: widthPercentageToDP("5%"),

    zIndex: 100,
  },
  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: widthPercentageToDP("3%"),
  },
  singleButton: {
    width: widthPercentageToDP("25%"),
  },
  wideButton: {
    flex: 1,
  },
  grayButton: {
    backgroundColor: theme.lightColors?.grey5,
    borderRadius: 6,
    width: widthPercentageToDP("28%"),
    height: widthPercentageToDP("12%"),
    alignItems: "center",
    justifyContent: "center",
  },
  gradientButton: {
    borderRadius: 6,
    paddingVertical: heightPercentageToDP("1.5%"),
    paddingHorizontal: widthPercentageToDP("2%"),
    alignItems: "center",
    justifyContent: "center",
    minHeight: widthPercentageToDP("12%"),
  },
  buttonText: {
    color: theme.lightColors?.white,
    fontSize: FontSizes.S15,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonTextSelected: {
    color: "#ffffff",
    fontSize: FontSizes.S15,
    fontWeight: "700",
    textAlign: "center",
  },
  // Dropdown Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdownContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333333",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: heightPercentageToDP("2%"),
    paddingHorizontal: widthPercentageToDP("4%"),
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    color: theme.lightColors?.white,
    fontSize: FontSizes.S14,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default UnityBottomBar;
