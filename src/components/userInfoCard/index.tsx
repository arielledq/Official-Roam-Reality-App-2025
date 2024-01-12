import React from "react"
import { Image, Pressable, View, TouchableOpacity } from "react-native"
import useStyles from "./styles"
import AppText from "../text"
import Images from "../../assets/images"

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
        <AppText style={styles.name}>Name</AppText>
        <View style={styles.containerBottom}>
          <AppText style={styles.userName}>Email@kadhbakdh</AppText>
          <AppText style={styles.verificationStatus}>Email@kadhkahd</AppText>
        </View>
      </View>

      {/* Edit Button */}
      <TouchableOpacity>
        <Image source={Images.EditIcon} />
      </TouchableOpacity>
    </View>
  )
}

export default UserInfoCard
