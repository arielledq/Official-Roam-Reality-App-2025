import * as React from "react"
import {
  Text,
  View,
  StyleSheet,
  Keyboard,
  Pressable,
  ImageBackground,
  Alert
} from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { AppInput } from "../../components"
import { FlatList } from "react-native-gesture-handler"
import useStyles from "./styles"
import theme from "../../assets/theme"
import { Icon } from "react-native-elements"
import { searchUsers, sendFriendRequest } from "../../network"
import FastImage from "react-native-fast-image"
import { color } from "@rneui/base"
import Images from "../../assets/images"
import fontGroup from "../../assets/fonts"
import { FontSizes } from "../../util/FontUtils"
import useDebounce from "../../hooks/debounce"
import { DEBOUNCE_TIME } from "../../util/helpers"


const ScoreBoard = ({
}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)

  const renderFriendItem = (item, onAddFriendClick, styles?) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: theme.lightColors?.inputBG,
          paddingRight: 20,
          borderRadius: 10,
          marginVertical: 5,
          flex: 1
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            flex: 0.9
          }}
        >
          <ImageBackground
            source={Images.BGBlur}
            style={{
              width: 80,
              aspectRatio: 1,
              justifyContent: "center",
              alignItems: "center"
            }}
            resizeMode="stretch"
          >
            <FastImage
              style={{
                width: 30,
                aspectRatio: 1,
                borderRadius: 5
              }}
              source={{ uri: item?.user_profile?.image }}
              resizeMode={FastImage.resizeMode.cover}
            />
          </ImageBackground>
          <View>
            <Text style={styles.title}>{item.name}</Text>
            <Text
              style={[styles.subTitle, { marginVertical: 5, maxWidth: 180 }]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {item.email}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => onAddFriendClick(item)}
          style={{ marginLeft: 10 }}
        >
          <Text style={localStyle.addButton}>Add as friend</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: 'Scoreboard',
          style: [_styles.heading],
        }} backgroundColor="transparent" />
    </BackgroundWithImage>
  )
}

export default ScoreBoard