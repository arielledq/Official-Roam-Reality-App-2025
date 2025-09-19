import { NavigationContainerRef } from "@react-navigation/native";
import React from "react";
import { RootStackParamList } from "../constants/types";
// import { createNavigationContainerRef } from "@react-navigation/native";

// export const navigationRef = createNavigationContainerRef<RootStackParamList>();
export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();
