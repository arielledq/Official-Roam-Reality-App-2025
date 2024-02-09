import React from "react"
import { Image, Pressable, TouchableOpacity, View } from "react-native"
import useStyles from "./styles"
import AppText from "../text"
import Images from "../../assets/images"

const MemoryContainer = ({
  title,
  description,
  image,
  item,
  onPressAction
}: {
  title: string,
  description: string,
  image: string,
  onPressAction?: () => void,
  item:any
}) => {
  const styles = useStyles()

  return (
    <Pressable style={styles.cardContainer} onPress={onPressAction}>
      <View style={styles.cardInner}>
        <Image style={styles.iconStyle} source={Images.ProfileImage} />
        <View style={styles.cardBottomContent}>
          <AppText style={styles.titleStyle}>{item?.challenge_details?.name}</AppText>
          <AppText style={styles.Text}>{description}</AppText>
        </View>
      </View>
    </Pressable>
  )
}

export default MemoryContainer
