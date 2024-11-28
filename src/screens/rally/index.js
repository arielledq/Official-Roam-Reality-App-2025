import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Button,
  TextInput,
  Text,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import UnityView from "@azesmway/react-native-unity";
import { unzip } from "react-native-zip-archive";
import Share from "react-native-share";
import RNFetchBlob from "rn-fetch-blob";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { getARChallenges } from "../../network";
import { handleError } from "../../util/helpers";
const { config, fs } = RNFetchBlob;

const Rally = ({}) => {
  const RNFS = require("react-native-fs");

  const unityRef = useRef(null);
  const route = useRoute();
  const [challengeObj, setChallengeObj] = useState(null);
  const challengeParams = challengeObj?.parameters;
 
  const [sponsoredData, setSponsoredData] = useState([]);
  const [fileFound, setFileFound] = useState(null);

  // Actualizamos los estados cuando challengeParams esté disponible

  return (
  
    <ImageBackground source={require("../../assets/images/ROAM_RALLY.png")} style={{ flex: 1, }}
    resizeMode="cover"/>   
  );
};

export default Rally;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
  },
  unityView: {
    borderRadius: 50,
    marginHorizontal: 20,
    flex: 1,
    width: "100%",
  },
  inputContainer: {
    width: "80%",
    marginTop: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
  },
  shareButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  shareButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  inputRow: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: "auto",
    marginBottom: 10,
    paddingLeft: 8,
  },
});
