import React, {useState, useRef} from "react";
import {FontLineHeights, FontSizes} from "../../../util/FontUtils";
import {
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {RootStackParamList, ScreenStackComponent} from "../../../constants/types";
import BackgroundWithImage from "../../../components/background";
import AppHeader from "../../../components/header";
import {useRoute} from "@react-navigation/native";
import Video from "react-native-video";
import {screenHorizontalPadding} from "../../../util/AppDimensions";

const {width} = Dimensions.get("window");

const ChallengeExamples: ScreenStackComponent<RootStackParamList, "ChallengeExamples"> = ({}) => {
  const route = useRoute();

  const examples = route?.params?.examples;
  const hasImages = !!examples?.images?.length;
  const hasVideos = !!examples?.videos?.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isImageTab, setIsImageTab] = useState(true); // toggle between images and videos
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: string]: boolean}>({});
  const [videoLoadingStates, setVideoLoadingStates] = useState<{[key: string]: boolean}>({});
  const flatListRef = useRef(null);

  const onNext = () => {
    if (activeIndex < (isImageTab ? examples?.images.length - 1 : examples?.videos.length - 1)) {
      const newIndex = activeIndex + 1;
      setActiveIndex(newIndex);
      flatListRef?.current?.scrollToIndex({index: newIndex});
    }
  };

  const onPrev = () => {
    if (activeIndex > 0) {
      const newIndex = activeIndex - 1;
      setActiveIndex(newIndex);
      flatListRef?.current?.scrollToIndex({index: newIndex});
    }
  };

  const renderItem = ({item}: {item: any}) => {
    const isImageLoading = isImageTab ? imageLoadingStates[item?.id] !== false : false;
    const isVideoLoading = !isImageTab ? videoLoadingStates[item?.id] !== false : false;

    return (
      <View style={styles.mediaContainer}>
        {isImageTab ? (
          <>
            {isImageLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e3deedff" />
              </View>
            )}
            <Image
              source={{uri: item?.image}}
              style={styles.media}
              resizeMode="cover"
              resizeMethod="auto"
              onLoadStart={() => {
                setImageLoadingStates(prev => ({...prev, [item?.id]: true}));
              }}
              onLoad={() => {
                setImageLoadingStates(prev => ({...prev, [item?.id]: false}));
              }}
              onError={() => {
                setImageLoadingStates(prev => ({...prev, [item?.id]: false}));
              }}
            />
          </>
        ) : (
          <>
            {isVideoLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9c9c9cff" />
              </View>
            )}
            <Video
              source={{uri: item?.video_file}}
              style={styles.media}
              resizeMode="cover"
              controls
              onLoadStart={() => {
                setVideoLoadingStates(prev => ({...prev, [item?.id]: true}));
              }}
              onLoad={() => {
                setVideoLoadingStates(prev => ({...prev, [item?.id]: false}));
              }}
              onError={() => {
                setVideoLoadingStates(prev => ({...prev, [item?.id]: false}));
              }}
            />
          </>
        )}
      </View>
    );
  };

  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: `Let's see an example`,
          numberOfLines: 2,
          style: [styles.heading],
        }}
        backgroundColor="transparent"
      />

      <View style={styles.container}>
        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          {hasImages && (
            <TouchableOpacity
              style={{flex: 1}}
              onPress={() => {
                setIsImageTab(true);
                setActiveIndex(0);
                flatListRef.current.scrollToIndex({index: 0});
              }}
            >
              <Text style={[styles.toggleButton, isImageTab && styles.activeButton]}>Images</Text>
            </TouchableOpacity>
          )}
          {hasVideos && (
            <TouchableOpacity
              style={{flex: 1}}
              onPress={() => {
                setIsImageTab(false);
                setActiveIndex(0);
                flatListRef.current.scrollToIndex({index: 0});
              }}
            >
              <Text style={[styles.toggleButton, !isImageTab && styles.activeButton]}>Videos</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Media Slider */}
        <View style={{height: (width - 40) / (100 / 143), width: width - 40}}>
          <FlatList
            ref={flatListRef}
            data={isImageTab ? examples?.images : examples?.videos}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            onScroll={e => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(index);
            }}
          />
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navButtons}>
          <TouchableOpacity onPress={onPrev} style={styles.navButton}>
            <Text style={styles.navText}>{"<"}</Text>
          </TouchableOpacity>
          {/* Dot Indicators */}
          <View style={styles.dotContainer}>
            {(isImageTab ? examples?.images : examples?.videos).map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === activeIndex ? styles.activeDot : styles.inactiveDot]}
              />
            ))}
          </View>
          <TouchableOpacity onPress={onNext} style={styles.navButton}>
            <Text style={styles.navText}>{">"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BackgroundWithImage>
  );
};

export default ChallengeExamples;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: screenHorizontalPadding,
  },
  heading: {
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH25,
    fontWeight: "700",
    color: "#FFF",
    marginTop: 5,
    textAlign: "center",
  },
  container: {
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleContainer: {
    marginBottom: 24,
    width: "100%",
    height: 35,
    gap: 4,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButton: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 6,

    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: 14,
    backgroundColor: "#77777750",
    borderColor: "#6B7280",
    borderRadius: 2,
    borderWidth: 1,
  },
  activeButton: {
    backgroundColor: "#B816E050",
    borderColor: "#B816E0",
  },
  mediaContainer: {
    position: "relative",
    width: width - 40,
    height: (width - 40) / (100 / 143),
  },
  media: {
    width: width - 40,
    height: (width - 40) / (100 / 143),
    borderRadius: 16,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 16,
    zIndex: 1,
  },
  navButtons: {
    marginTop: 24,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    backgroundColor: "#CCC",
    padding: 10,
    borderRadius: 12,
    width: 40,
  },
  navText: {
    color: "#000",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  dotContainer: {
    flexDirection: "row",
    marginTop: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#6C3BD9",
  },
  inactiveDot: {
    backgroundColor: "#CCC",
  },
});
