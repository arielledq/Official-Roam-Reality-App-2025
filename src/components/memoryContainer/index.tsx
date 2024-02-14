import React from "react"
import { Image, Pressable, TouchableOpacity, View } from "react-native"
import useStyles from "./styles"
import AppText from "../text"
import Images from "../../assets/images"
import FastImage from "react-native-fast-image"

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
  item: any
}) => {
  const styles = useStyles()
  console.log("item:", item)
  return (
    <Pressable style={styles.cardContainer} onPress={onPressAction}>
      <View style={styles.cardInner}>
        <FastImage style={styles.iconStyle}
          resizeMode={FastImage.resizeMode.cover}
          source={{ uri: item.memory_type == 'VIDEO' ? item?.thumbnail_memory_video_file : item?.image }} />
        <View style={styles.cardBottomContent}>
          <AppText style={styles.titleStyle}>{item?.challenge_details?.name}</AppText>
          <AppText numberOfLines={2} style={styles.Text}>{item?.challenge_details?.description.replace(/<[^>]+>/g, '')}</AppText>
        </View>
      </View>
    </Pressable>
  )
}

export default MemoryContainer
