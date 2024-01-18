import { Avatar, Image } from "@rneui/themed"
import React, { FC } from "react"
import { AVATAR_SIZE, useStyles } from "./styles"
import { ImageBackground, TouchableOpacity, View } from "react-native"
import Images from "../../assets/images"
import { Icons } from "../../assets/Icons"

export interface ProfileAvatarProps {
  avatarUrl?: string | undefined;
}

const ProfileAvatar: FC<ProfileAvatarProps> = props => {
  const { avatarUrl = "" } = props
  const styles = useStyles()
  return (
    <View style={styles.parent}>
      {/* {avatarUrl ? (
        <ImageBackground source={Images.ProfileImgGradient} style={styles.imageBackground}>
          <TouchableOpacity>
            <Avatar
              size={AVATAR_SIZE}
              containerStyle={styles.avatarContainer}
              avatarStyle={styles.avatarStyles}
              source={{ uri: avatarUrl }}
            />
          </TouchableOpacity>
        </ImageBackground>
      ) : ( */}
      <TouchableOpacity style={styles.parent}>
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
        <Icons.ProfilePicPlusIcon style={styles.plusIcon}/>
      </TouchableOpacity>
      {/* )} */}
    </View>
  )
}

export default ProfileAvatar
