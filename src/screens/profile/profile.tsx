import React from "react"
import { TouchableOpacity, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import useStyles from "./styles"
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../navigation/types"
// import { handleErrorMessage } from '../../util/util';
import BackgroundWithImage from "../../components/background"
import AppHeader from "../../components/header"
import { MenuIcon } from "../../assets/svg"
import UserInfoCard from "../../components/userInfoCard"
import { Avatar } from "@rneui/base"
import { AppText } from "../../components"
import StatContainer from "../../components/statContainer"
import BoxStatContainer from "../../components/boxStatContainer"

const Profile: ScreenStackComponent<RootStackParamList, "Profile"> = ({
  navigation
}) => {
  const _styles = useStyles()

  const handleMenuButton = () => {
    return (
      <TouchableOpacity style={_styles.menuIcon}>
        <MenuIcon />
      </TouchableOpacity>
    )
  }

  const data = [
    { id: 1, value: 50, property: "Sites Viewed" },
    { id: 2, value: 60, property: "Likes Received" },
    { id: 3, value: 40, property: "Comments Posted" },
    { id: 4, value: 75, property: "Photos Uploaded" },
    { id: 5, value: 55, property: "Friends Added" },
    { id: 6, value: 30, property: "Articles Read" },
    { id: 7, value: 80, property: "Messages Sent" },
    { id: 8, value: 65, property: "Logins This Month" }
  ]
  // Split the data into chunks of 3 for each row
  const rows = []
  for (let i = 0; i < data.length; i += 3) {
    rows.push(data.slice(i, i + 3))
  }

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        containerStyle={_styles.headerContainer}
        titleStyle={_styles.headerStyle}
        title={"Profile"}
        leftComponent={handleMenuButton()}
      />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        style={_styles.scroll}
      >
        <Avatar size={350} />
        <UserInfoCard name={""} email={""} editAction={() => console.log()} />
        <AppText style={_styles.scoreboard}>SCOREBOARD</AppText>

        <View style={_styles.statContainerStyle}>
          <StatContainer value={"178/1000"} property={"Global Rank"} />
          <StatContainer value={"23"} property={"Points"} />
          <StatContainer value={"23"} property={"TT Rank"} />
        </View>

        <View style={_styles.boxstatContainerStyle}>
          <View style={_styles.boxstatContainer}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={_styles.boxstatContainerStyle}>
                {row.map(item => (
                  <BoxStatContainer
                    key={item.id}
                    value={item.value}
                    property={item.property}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </BackgroundWithImage>
  )
}

export default Profile
