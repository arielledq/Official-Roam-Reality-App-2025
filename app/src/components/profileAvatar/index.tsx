import { Avatar, Image } from "@rneui/themed"
import React, { FC } from "react"
import { AVATAR_SIZE, useStyles } from "./styles"
import { ImageBackground, TouchableOpacity, View } from "react-native"
import Images from "../../assets/images"
import { Icons } from "../../assets/Icons"
import FastImage from "react-native-fast-image"

export interface ProfileAvatarProps {
  avatarUrl?: string | undefined;
  onChangeProfilePic?: () => void;
}

const ProfileAvatar: FC<ProfileAvatarProps> = props => {
  const { avatarUrl = "", onChangeProfilePic } = props
  const styles = useStyles()
  return (
    <View style={styles.parent}>
      {avatarUrl ? (
        <ImageBackground
          source={Images.ProfileImgGradient}
          style={styles.imagePresentBackground}
        >
          <TouchableOpacity onPress={onChangeProfilePic}>
            <View style={[styles.avatarContainer, styles.avatarViewStyles]}>
              <FastImage
                style={[styles.avatarContainer, styles.avatarStyles]}
                source={{ uri: avatarUrl }}
                resizeMode="contain"
              />
            </View>
            <Icons.ProfilePicPlusIcon style={styles.plusIconWithImage} />
          </TouchableOpacity>
        </ImageBackground>
      ) : (
        <TouchableOpacity style={styles.parent} onPress={onChangeProfilePic}>
          <ImageBackground
            source={Images.ProfileImgGradient}
            style={styles.imageBackground}
          >
            <Image
              style={styles.addImage}
              resizeMode="contain"
              source={Images.ProfileImage}
            />
          </ImageBackground>
          <Icons.ProfilePicPlusIcon style={styles.plusIcon} />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default ProfileAvatar
