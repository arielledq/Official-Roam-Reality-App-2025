import {
    NavigationContainerRef,
  } from '@react-navigation/native';
  import React from 'react';
  import { RootStackParamList } from '../navigation/types';
  
  export const navigationRef =
    React.createRef<NavigationContainerRef<RootStackParamList>>();
  