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
    screenWidth * 0.9 - widthPercentageToDP("8%") * 2 - widthPercentageToDP("8%");

  // Auto-scroll functionality for array titles
  useEffect(() => {
    if (isArrayTitle && messages.length > 1) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set new interval for auto-scroll every 10 seconds
      intervalRef.current = setInterval(() => {
        const nextIndex = currentMessageIndex === messages.length - 1 ? 0 : currentMessageIndex + 1;
        scrollToIndex(nextIndex);
      }, 10000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isArrayTitle, messages.length, currentMessageIndex]);

  const scrollToIndex = index => {
    if (flatListRef.current && isArrayTitle) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
      setCurrentMessageIndex(index);
    }
  };

  const goToPrevious = () => {
    const newIndex = currentMessageIndex === 0 ? messages.length - 1 : currentMessageIndex - 1;
    scrollToIndex(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentMessageIndex === messages.length - 1 ? 0 : currentMessageIndex + 1;
    scrollToIndex(newIndex);
  };

  const onScrollEnd = event => {
    const slideSize = carouselWidth;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== currentMessageIndex) {
      setCurrentMessageIndex(index);
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
              : [theme.lightColors?.grey4, theme.lightColors?.grey4]
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
    backgroundColor: "rgba(56, 55, 55, 0.95)", // More solid background like in screenshot
    paddingVertical: "4%",
    paddingHorizontal: "4%",
    marginHorizontal: "5%",
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
    backgroundColor: theme.lightColors?.grey4,
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
    fontSize: FontSizes.S16,
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
    backgroundColor: theme.lightColors?.grey4,
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
