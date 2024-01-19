import React from "react"
import { Image, Pressable, View, TouchableOpacity } from "react-native"
import useStyles from "./styles"
import AppText from "../text"
import Images from "../../assets/images"
import Icon from "../Icon"
import theme from "../../assets/theme"

const UserInfoCard = ({
  name,
  email,
  editAction
}: {
  name: string,
  email: string,
  editAction: () => void
}) => {
  const styles = useStyles()

  return (
    <View style={styles.row}>
      {/* user details */}
      <View style={styles.nameContainer}>
        <AppText style={styles.name}>Fatoumata Chidubem</AppText>
        <View style={styles.containerBottom}>
          <AppText style={styles.userName}>linda.brown@gmail.com</AppText>
          <Icon
            name={"info"}
            family="feather"
            color={theme.lightColors?.yellow}
            size={16}
            style={styles.verificationIcon}
          />
          <AppText style={styles.verificationStatus}>Not Verified</AppText>
          <View style={styles.verifyNowContainer}>
            <Pressable style={styles.verifyButton}>
              <AppText style={styles.verifyNow}>Verify Now</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}

export default UserInfoCard
