import theme from "assets/theme";
import React, {useState, useEffect, useRef} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons";
import {FontSizes} from "util/FontUtils";

const {width: screenWidth} = Dimensions.get("window");

const UnityHeader = ({
  title = "Choose your AR MODE",
  onBackPress,
  selectedMode = "Live",
  onModeChange,
}) => {
  const modes = ["Map", "Live", "List"];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const intervalRef = useRef(null);
  const flatListRef = useRef(null);

  // Determine if title is array or string
  const isArrayTitle = Array.isArray(title);
  const messages = isArrayTitle ? title : [];
  // Calculate carousel width based on available space (total width - buttons - margins)
  const carouselWidth =
    screenWidth * 0.9 - widthPercentageToDP("6%") * 2 - widthPercentageToDP("6%");

  // Reset message index when messages array changes (mode switching)
  useEffect(() => {
    if (isArrayTitle && messages.length > 0) {
      // Reset to first message when switching modes or if current index is out of bounds
      if (currentMessageIndex >= messages.length) {
        setCurrentMessageIndex(0);
        // Also scroll to the first item if FlatList is available
        if (flatListRef.current) {
          setTimeout(() => {
            flatListRef.current.scrollToIndex({
              index: 0,
              animated: false, // No animation for reset
            });
          }, 100);
        }
      }
    } else if (!isArrayTitle) {
      // Reset index when switching to non-array title
      setCurrentMessageIndex(0);
    }
  }, [messages, isArrayTitle, currentMessageIndex]);

  // Auto-scroll functionality for array titles
  useEffect(() => {
    if (isArrayTitle && messages.length > 1) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set new interval for auto-scroll every 10 seconds
      intervalRef.current = setInterval(() => {
        if (messages.length > 0) {
          const nextIndex =
            currentMessageIndex === messages.length - 1 ? 0 : currentMessageIndex + 1;
          scrollToIndex(nextIndex);
        }
      }, 10000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isArrayTitle, messages.length, currentMessageIndex]);

  const scrollToIndex = index => {
    if (flatListRef.current && isArrayTitle && messages.length > 0) {
      // Safety check: ensure index is within bounds
      const safeIndex = Math.max(0, Math.min(index, messages.length - 1));
      try {
        flatListRef.current.scrollToIndex({
          index: safeIndex,
          animated: true,
        });
        setCurrentMessageIndex(safeIndex);
      } catch (error) {
        console.warn("ScrollToIndex error:", error);
        // Fallback: reset to first item
        setCurrentMessageIndex(0);
      }
    }
  };

  const goToPrevious = () => {
    if (messages.length === 0) return;
    const newIndex = currentMessageIndex === 0 ? messages.length - 1 : currentMessageIndex - 1;
    scrollToIndex(newIndex);
  };

  const goToNext = () => {
    if (messages.length === 0) return;
    const newIndex = currentMessageIndex === messages.length - 1 ? 0 : currentMessageIndex + 1;
    scrollToIndex(newIndex);
  };

  const onScrollEnd = event => {
    if (messages.length === 0) return;

    const slideSize = carouselWidth;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    // Safety check: ensure index is within bounds
    const safeIndex = Math.max(0, Math.min(index, messages.length - 1));

    if (safeIndex !== currentMessageIndex) {
      setCurrentMessageIndex(safeIndex);
    }
  };

  const renderMessageItem = ({item, index}) => (
    <View style={[styles.messageSlide, {width: carouselWidth}]}>
      <Text style={styles.titleText} numberOfLines={2} adjustsFontSizeToFit>
        {item.message}
      </Text>
    </View>
  );

  const renderModeButton = mode => {
    const isSelected = selectedMode === mode;

    return (
      <TouchableOpacity key={mode} onPress={() => onModeChange(mode)}>
        <LinearGradient
          style={[styles.modeButton]}
          colors={
            isSelected
              ? ["#7a00cf", "#5532ff"]
              : [theme.lightColors?.grey5, theme.lightColors?.grey5]
          }
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
        >
          <Text style={[styles.modeButtonText, isSelected && styles.selectedModeButtonText]}>
            {mode}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Icon name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.modesContainer}>{modes.map(renderModeButton)}</View>
      </View>

      <View style={styles.titleContainer}>
        {isArrayTitle && messages.length > 1 ? (
          <View style={styles.carouselContainer}>
            <TouchableOpacity style={styles.carouselButton} onPress={goToPrevious}>
              <Icon name="chevron-back" size={16} color="#ffffff" />
            </TouchableOpacity>

            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={item => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              onMomentumScrollEnd={onScrollEnd}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={carouselWidth}
              snapToAlignment="center"
              contentContainerStyle={styles.flatListContainer}
              style={styles.flatListStyle}
              getItemLayout={(data, index) => ({
                length: carouselWidth,
                offset: carouselWidth * index,
                index,
              })}
              bounces={false}
              overScrollMode="never"
            />

            <TouchableOpacity style={styles.carouselButton} onPress={goToNext}>
              <Icon name="chevron-forward" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.titleText}>
            {typeof title === "string"
              ? title
              : isArrayTitle && messages[0]
              ? messages[0].message
              : "Choose your AR MODE"}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: heightPercentageToDP("5%"),
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#000000", // More solid background like in screenshot
    paddingVertical: "4%",
    paddingHorizontal: "4%",
    marginHorizontal: "3.5%",
    borderRadius: 12,

    alignSelf: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: "2%",
    gap: widthPercentageToDP("4%"),
  },
  backButton: {
    width: widthPercentageToDP("12%"),
    height: widthPercentageToDP("10%"),
    backgroundColor: theme.lightColors?.grey5,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginTop: "2%",
  },
  titleText: {
    color: theme.lightColors?.white,
    fontSize: FontSizes.S14,
    fontWeight: "600",
    textAlign: "center",
  },
  modesContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
  },
  modeButton: {
    width: widthPercentageToDP("20%"),
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    height: widthPercentageToDP("10%"),
  },
  selectedModeButton: {},
  modeButtonText: {
    color: theme.lightColors?.white,
    fontSize: FontSizes.S16,
    fontWeight: "600",
    textAlign: "center",
  },
  selectedModeButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  carouselContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: widthPercentageToDP("10%"),
  },
  carouselButton: {
    width: widthPercentageToDP("8%"),
    height: widthPercentageToDP("8%"),
    backgroundColor: theme.lightColors?.grey5,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  messageContainer: {
    flex: 1,
    marginHorizontal: widthPercentageToDP("2%"),
    alignItems: "center",
  },
  flatListContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  flatListStyle: {
    flex: 1,
    maxHeight: widthPercentageToDP("10%"),
  },
  messageSlide: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: widthPercentageToDP("1%"),
    height: widthPercentageToDP("10%"),
  },
});

export default UnityHeader;
