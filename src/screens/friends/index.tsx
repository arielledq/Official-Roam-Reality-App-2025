import React from "react"
import { Text, useWindowDimensions } from "react-native"
import MyFriends from "./myFriends"
import PendingRequests from "./pendingRequests"
import { AppButton, AppHeader } from "../../components"
import BackgroundWithImage from "../../components/background"
import useStyles from "./styles"
import { TabView, SceneMap, TabBar } from "react-native-tab-view"
import theme from "../../assets/theme"
import { FontFamily, FontSizes } from "../../util/FontUtils"
import { useNavigation } from "@react-navigation/native"

const tabs = {
  myFriends: "My Friends",
  requests: "Pending Requests"
}

const Friends: React.FC = () => {
  const layout = useWindowDimensions()
  const navigation = useNavigation()

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState([
    { key: "one", title: tabs.myFriends },
    { key: "two", title: tabs.requests }
  ])
  const _styles = useStyles()

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.lightColors?.magenta }}
      style={{ backgroundColor: "transparent" }}
      renderLabel={({ route, focused, color }) => (
        <Text
          style={{
            color,
            fontSize: FontSizes.S18,
            fontFamily: FontFamily.NunitoSansSemiBold
          }}
        >
          {route.title}
        </Text>
      )}
    />
  )

  const onAddFriendClick = () => {
    navigation.navigate("AddFriend")
  }

  return (
    <BackgroundWithImage>
      <AppHeader title={tabs.myFriends} backgroundColor="transparent" />
      <TabView
        lazy
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
      <AppButton
        buttonStyle={_styles.buttonStyle}
        containerStyle={[_styles.buttonContainer, { marginHorizontal: 15 }]}
        title={"Add a new friend"}
        onPress={onAddFriendClick}
      />
    </BackgroundWithImage>
  )
}

const MyFriendsRoute = () => <MyFriends key={1} />

const PedningRequestsRoute = () => <PendingRequests key={2} />

const renderScene = SceneMap({
  one: MyFriendsRoute,
  two: PedningRequestsRoute
})

export default Friends
