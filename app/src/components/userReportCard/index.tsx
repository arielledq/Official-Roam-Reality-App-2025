import React from "react";
import {Pressable, View} from "react-native";
import useStyles from "./styles";
import AppText from "../text";
import Icon from "../Icon";
import theme from "../../assets/theme";

const UserInfoCard = ({
  name,
  email,
  isVerified,
  verifyAction,
  image = false,
}: {
  name: string | null;
  email: string | null;
  isVerified: boolean;
  verifyAction: () => void;
}) => {
  const styles = useStyles();

  const truncatedEmail = email?.length > 22 && !isVerified ? `${email?.slice(0, 22)}...` : email;

  return (
    <View style={styles.row}>
      {/* user details */}
      <View style={styles.nameContainer}>
        <AppText style={image ? styles.name : styles.name1}>{name}</AppText>
        <View style={styles.containerBottom}>
          <AppText style={styles.userName}>{truncatedEmail}</AppText>
          {!isVerified && (
            <>
              <Icon
                name={"info"}
                family="antdesign"
                color={theme.lightColors?.yellow}
                size={16}
                style={styles.verificationIcon}
              />
              <AppText style={styles.verificationStatus}>Not Verified</AppText>
              <View style={styles.verifyNowContainer}>
                <Pressable style={styles.verifyButton} onPress={verifyAction}>
                  <AppText style={styles.verifyNow}>Verify Now</AppText>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default UserInfoCard;
