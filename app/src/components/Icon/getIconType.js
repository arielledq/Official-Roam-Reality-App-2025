import AntIcon from "react-native-vector-icons/AntDesign";

import Custom from "./Custom";

export const getIconType = (type = "") => {
  switch (type.toLowerCase()) {
    case "antdesign":
      return AntIcon;

    case "custom":
      return Custom;
    default:
      return AntIcon;
  }
};
