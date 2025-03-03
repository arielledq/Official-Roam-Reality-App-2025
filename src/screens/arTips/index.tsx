import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, FlatList, Image, StyleSheet } from "react-native";
import { RootStackParamList, ScreenStackComponent } from "../../constants/types";
import { AR_TIPS_AUTO_SLIDE_PAUSE_SECONDS, AR_TIPS_AUTO_SLIDE_SECONDS } from "../../constants";
import ScreenContainer from "components/ScreenContainer";
import theme from "assets/theme";
import {getArTips, login} from "network";
import {handleError} from "util/helpers";

const ARTipsScreen: ScreenStackComponent<RootStackParamList, "ARTips"> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [arTips, setArTips] = useState([]);

  const flatListRef = useRef(null);
  const pauseTimerRef = useRef(null);

  const [viewWidth, setViewWidth] = useState(0);
  const viewRef = useRef(null);

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setViewWidth(width);
  };

  const getPictures = () => {
    setIsLoading(true);
    getArTips()
      .then(res => {
        if (res.status == 1) {
          setArTips(res?.data)
        } else {
          handleError(res);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const renderItem = ({ item }: any) => {
    return (
      <Image
        // source={item?.image}
        source={{ uri: item?.image }}
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
    if (!isPaused && arTips.length > 0) {
      const timer = setInterval(() => {
        setActiveIndex((prevIndex) => {
          const nextIndex = prevIndex < arTips.length - 1 ? prevIndex + 1 : 0;
          // @ts-ignore
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
          return nextIndex;
        });
      }, AR_TIPS_AUTO_SLIDE_PAUSE_SECONDS * 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused, arTips]);

  useEffect(() => {
    getPictures()
  }, []);

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
                data={arTips}
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
                {arTips?.map((_: any, index: number) => (
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
