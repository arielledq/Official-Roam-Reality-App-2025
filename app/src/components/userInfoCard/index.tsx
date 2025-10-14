import React from "react";
import {Pressable, View} from "react-native";
import useStyles from "./styles";
import AppText from "../text";
import Icon from "../Icon";
import theme from "../../assets/theme";

const UserInfoCard = ({
  name,
  email,
  reportAction,
  image,
  verifyAction,
  isVerified,
}: {
  name: string | null;
  email: string | null;
  image: string;
  reportAction: () => void;
  verifyAction: () => void;
  isVerified: boolean;
}) => {
  const styles = useStyles();

  const truncatedEmail = email;

  return (
    <View style={styles.row}>
      {/* user details */}
      <View style={styles.nameContainer}>
        <AppText style={image ? styles.name : styles.name1}>{name}</AppText>
        <View style={styles.containerBottom}>
          {reportAction && (
            <View style={styles.verifyNowContainer}>
              <Pressable style={styles.verifyButton} onPress={reportAction}>
                <AppText style={styles.verifyNow}>Report User</AppText>
              </Pressable>
            </View>
          )}
          {!isVerified && (
            <View style={styles.verifyNowContainer}>
              <Pressable style={styles.verifyButton} onPress={verifyAction}>
                <AppText style={styles.verifyAccountText}>Verify My Profile</AppText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default UserInfoCard;
