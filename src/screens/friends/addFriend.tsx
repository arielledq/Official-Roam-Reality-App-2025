import React, { useState } from "react"
import { View, Text, Dimensions } from "react-native"
import { TabView, SceneMap, TabBar } from "react-native-tab-view"
import BackgroundWithImage from "../../components/background"
import { AppHeader } from "../../components"
import ContactsTab from "./contactsTab"
import InAppUsers from "./inAppUsers"
import theme from "../../assets/theme"
import { FontFamily, FontSizes } from "../../util/FontUtils"

const initialLayout = { width: Dimensions.get("window").width }

const AddFriendScreen = () => {
  const [index, setIndex] = useState(0)
  const [routes] = useState([
    { key: "contacts", title: "My Contacts" },
    { key: "inApp", title: "In App" }
  ])

  const renderScene = SceneMap({
    contacts: ContactsTab,
    inApp: InAppUsers
  })

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

  return (
    <BackgroundWithImage>
      <AppHeader title="Add Friend" backgroundColor="transparent" />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
      />
    </BackgroundWithImage>
  )
}

export default AddFriendScreen
