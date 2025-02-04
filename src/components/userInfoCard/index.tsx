import React from "react";
import { Pressable, View } from "react-native";
import useStyles from "./styles";
import AppText from "../text";
import Icon from "../Icon";
import theme from "../../assets/theme";

const UserInfoCard = ({
  name,
  email,
  reportAction = null,
  image = false,
}: {
  name: string | null;
  email: string | null;
  reportAction: () => void;
}) => {
  const styles = useStyles();

  const truncatedEmail = email;

  return (
    <View style={styles.row}>
      {/* user details */}
      <View style={styles.nameContainer}>
        <AppText style={image ? styles.name : styles.name1}>{name}</AppText>
        <View style={styles.containerBottom}>
          <AppText style={styles.userName}>{truncatedEmail}</AppText>
          {reportAction && (
            <View style={styles.verifyNowContainer}>
              <Pressable style={styles.verifyButton} onPress={reportAction}>
                <AppText style={styles.verifyNow}>Report User</AppText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default UserInfoCard;
