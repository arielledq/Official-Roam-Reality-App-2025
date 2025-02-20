import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, FlatList, Image, StyleSheet } from "react-native";

import { RootStackParamList, ScreenStackComponent } from "../../constants/types";
import { AR_TIPS_AUTO_SLIDE_PAUSE_SECONDS, AR_TIPS_AUTO_SLIDE_SECONDS } from "../../constants";

import ScreenContainer from "components/ScreenContainer";

import theme from "assets/theme";

const ARTipsImage1 = require("../../assets/arTips/1.png");
const ARTipsImage2 = require("../../assets/arTips/2.png");
const ARTipsImage3 = require("../../assets/arTips/3.png");
const ARTipsImage4 = require("../../assets/arTips/4.png");
const ARTipsImage5 = require("../../assets/arTips/5.png");
const ARTipsImage6 = require("../../assets/arTips/6.png");
const ARTipsImage7 = require("../../assets/arTips/7.png");
const ARTipsImage8 = require("../../assets/arTips/8.png");
const ARTipsImage9 = require("../../assets/arTips/9.png");
const ARTipsImage10 = require("../../assets/arTips/10.png");

const examples: any = {
  images: [
    { image: ARTipsImage1 },
    // { image: ARTipsImage2 },
    // { image: ARTipsImage3 },
    // { image: ARTipsImage4 },
    // { image: ARTipsImage5 },
    // { image: ARTipsImage6 },
    // { image: ARTipsImage7 },
    // { image: ARTipsImage8 },
    // { image: ARTipsImage9 },
    // { image: ARTipsImage10 },
  ],
};

const ARTipsScreen: ScreenStackComponent<RootStackParamList, "ARTips"> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const flatListRef = useRef(null);
  const pauseTimerRef = useRef(null);

  const [viewWidth, setViewWidth] = useState(0);
  const viewRef = useRef(null);

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setViewWidth(width);
  };

  const renderItem = ({ item }: any) => {
    return (
      <Image
        source={item?.image}
        // source={{ uri: item?.image }}
        style={[styles.media, { width: viewWidth }]}
        resizeMode="cover"
        resizeMethod="auto"
      />
    );
  };

  // Function to handle user interaction and pause auto sliding
  const handleUserInteraction = () => {
    // Clear any previous pause timer
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
    setIsPaused(true);
    // @ts-ignore
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, AR_TIPS_AUTO_SLIDE_SECONDS * 1000);
  };

  // Auto slide effect that depends on isPaused
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setActiveIndex(prevIndex => {
          const newIndex = prevIndex < examples.images.length - 1 ? prevIndex + 1 : 0;
          // @ts-ignore
          flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
          return newIndex;
        });
      }, AR_TIPS_AUTO_SLIDE_PAUSE_SECONDS * 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused]);

  return (
    <ScreenContainer style={styles.screen}>
      <>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={theme.lightColors?.white}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          />
        ) : (
          <>
            {/* Media Slider */}
            <View style={styles.mediaSliderContainer} ref={viewRef} onLayout={handleLayout}>
              <FlatList
                style={{ borderRadius: 16 }}
                ref={flatListRef}
                data={examples.images}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                onScroll={e => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / viewWidth);
                  setActiveIndex(index);
                }}
                // Pause auto slide when user interacts with the slider
                onScrollBeginDrag={handleUserInteraction}
                onTouchStart={handleUserInteraction}
              />
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navButtons}>
              {/* Dot Indicators */}
              <View style={styles.dotContainer}>
                {examples?.images?.map((_: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === activeIndex ? styles.activeDot : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            </View>
          </>
        )}
      </>
    </ScreenContainer>
  );
};

export default ARTipsScreen;

const styles = StyleSheet.create({
  screen: {},
  mediaSliderContainer: {
    flex: 1,
  },
  media: {
    height: "100%",
  },

  navButtons: {
    width: "100%",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
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
    backgroundColor: theme.lightColors?.purple,
  },
  inactiveDot: {
    backgroundColor: theme.lightColors?.grey0,
  },
});
