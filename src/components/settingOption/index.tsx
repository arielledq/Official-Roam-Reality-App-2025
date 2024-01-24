import React from "react"
import { TouchableOpacity, View } from "react-native"
import AppText from "../text"
import useStyles from "./styles"
import Icon from "../Icon/Icon"
import theme from "../../assets/theme"
export type MenuOptionProps = {
  title: string,
  iconType: string,
  rightIconDisabled: boolean,
  onNavigate: () => void
}

const SettingOption = (props: MenuOptionProps) => {
  const styles = useStyles()

  return (
    <View style={[
      styles.container,
      props.title === "AR Challenges" ? { backgroundColor: theme.lightColors?.pink } : {}
    ]}>
      <TouchableOpacity
        style={styles.headerContainer}
        onPress={props.onNavigate}
      >
        <View style={styles.leftContainer}>
          <Icon
            name={props.iconType}
            family="feather"
            color={theme.lightColors?.white}
            size={20}
          />
          <AppText style={styles.Text}>{props.title}</AppText>
        </View>
        {props.rightIconDisabled ? null : (
          <View>
            <Icon
              name={"chevron-right"}
              family="entypo"
              color={theme.lightColors?.white}
              size={20}
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

export default SettingOption
