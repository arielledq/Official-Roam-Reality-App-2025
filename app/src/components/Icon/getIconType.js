import AntIcon from "react-native-vector-icons/AntDesign";
import FAIcon from "react-native-vector-icons/FontAwesome";
import FA5Icon from "react-native-vector-icons/FontAwesome5";
import fantisto from "react-native-vector-icons/Fontisto";
import Ionicon from "react-native-vector-icons/Ionicons";

import Custom from "./Custom";

export const getIconType = (type = "") => {
  switch (type.toLowerCase()) {
    case "antdesign":
      return AntIcon;

    case "fontawesome":
    case "font-awesome":
      return FAIcon;
    case "font-awesome-5":
      return FA5Icon;
    case "fontisto":
      return fantisto;
    case "ionicon":
      return Ionicon;

    case "custom":
      return Custom;

    default:
      return AntIcon;
  }
};
