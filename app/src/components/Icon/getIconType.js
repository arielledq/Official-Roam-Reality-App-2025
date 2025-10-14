import AntIcon from "react-native-vector-icons/AntDesign";
import FAIcon from "react-native-vector-icons/FontAwesome";
import FA5Icon from "react-native-vector-icons/FontAwesome5";

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

    case "custom":
      return Custom;

    default:
      return AntIcon;
  }
};
