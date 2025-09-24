import {Image, Text, TouchableOpacity, View} from "react-native";
import theme from "assets/theme";

interface IGPostTypeButtonProps {
  onPress: () => {};
  imageSource: any | {uri: string};
  text: string;
}

const IGPostTypeButton = ({onPress, imageSource, text}: IGPostTypeButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 8,
        paddingVertical: 16,
        borderRadius: 8,
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 16,
        borderColor: theme.lightColors?.purple,
        borderWidth: 3,
        width: 124,
      }}
    >
      <View style={{height: 64, width: 64, justifyContent: "center", alignItems: "center"}}>
        <Image source={imageSource} />
      </View>
      <Text style={{color: theme.lightColors?.white, fontSize: 12}}>{text}</Text>
    </TouchableOpacity>
  );
};

export default IGPostTypeButton;
