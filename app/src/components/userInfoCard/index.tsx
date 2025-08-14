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
        <AppText style={styles.name}>{name}</AppText>
        <View style={styles.containerBottom}>
          <AppText style={styles.userName}>{truncatedEmail}</AppText>
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
                <AppText style={styles.verifyAccountText}>Verify Your Account</AppText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default UserInfoCard;
