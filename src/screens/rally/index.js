import React from "react";
import { ImageBackground } from "react-native";

const Rally = ({}) => {
  return (
    <ImageBackground
      source={require("../../assets/images/ROAM_RALLY.png")}
      style={{ flex: 1, marginBottom: 50 }}
      resizeMode="cover"
    />
  );
};

export default Rally;
