import * as React from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Image,
  ScrollView,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { fontGroup, FontSizes } from "util/FontUtils";
import AppButton from "./button";

// @ts-ignore
import LineIcon from "assets/ar/line.png";
import theme from "assets/theme";

interface CaptureInfoViewProps {
  isVisible: boolean;
  content: string;
  onAccept?: () => void;
  onCancel?: () => void;
}

const CaptureInfoView = ({ isVisible, content = "", onAccept, onCancel }: CaptureInfoViewProps) => {
  if (!isVisible) return null;

  const navigation = useNavigation();
  const htmlContent = content?.replace(/#000000/g, "#fff");

  return (
    <View style={$challengeInfoContainer}>
      <View style={$challengeInfoHeaderContainer}>
        <Image source={LineIcon} style={{ width: 35.63, height: 4 }} />
        <Text style={$challengeInfoHeader}>Waiver Details</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: "100%", padding: 24 }}
      >
        <RenderHTML
          tagsStyles={{
            p: { color: "#9CA3AF", fontSize: FontSizes.S14 },
            ol: { color: "#9CA3AF", fontSize: FontSizes.S14 },
            strong: { color: "#fff", fontSize: FontSizes.S18 },
          }}
          source={{ html: htmlContent }}
        />
      </ScrollView>
      <View style={{ width: "100%", paddingHorizontal: 24 }}>
        <AppButton
          onPress={onAccept}
          buttonStyle={$buttonStyle}
          containerStyle={$buttonContainerStyle}
          title={"Accept and Continue"}
        />
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            navigation.goBack();
            if (!!onCancel) onCancel();
          }}
        >
          <Text style={$bottomText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CaptureInfoView;

const $challengeInfoContainer: ViewStyle = {
  width: "100%",
  backgroundColor: "#131422",
  height: 440,
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  position: "absolute",
  bottom: 0,
  alignItems: "center",
  paddingBottom: 20,
};

const $challengeInfoHeaderContainer: ViewStyle = {
  paddingVertical: 20,
  alignItems: "center",
  borderBottomColor: "#2C2D41",
  borderBottomWidth: 1,
  width: "100%",
};

// @ts-ignore
const $challengeInfoHeader: TextStyle = {
  ...fontGroup.ns700,
  fontSize: FontSizes.S18,
  color: theme.lightColors?.white,
  marginTop: 10,
};

const $buttonStyle: ViewStyle = {
  height: 50,
};

const $buttonContainerStyle: ViewStyle = {
  marginTop: 20,
};

const $bottomText: TextStyle = {
  ...fontGroup.p700,
  fontSize: FontSizes.S18,
  textAlign: "center",
  color: "#1158F4",
  marginVertical: 15,
  fontWeight: "700",
};
