import React, { useState } from 'react'
import {View, Text, Pressable, Image, TouchableOpacity} from 'react-native'

import ReactNativeModal from 'react-native-modal'
import theme from '../../assets/theme'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { FontFamily } from '../../util/FontUtils'
import Images from '../../assets/images'
import WebView from "react-native-webview";

interface DestinationFactModalProps {
  isVisible: boolean
  onClose: () => void
  name: string
  facts: string
  // DestinationFact: ;
}

const DESTINATION_FACTS_DATA = {
  name: 'Name of destination',
  facts:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean molestie purus congue euismod dapibus. Suspendisse quis leo non dolor egestas gravida ut faucibus diam. Vestibulum sed bibendum augue, a placerat felis. Fusce egestas, est a porttitor aliquet, urna nibh pellentesque sapien, suscipit volutpat eros quam in ante. Cras sapien massa, semper maximus sem nec, venenatis lacinia mauris. Quisque eu neque cursus, tristique leo quis, blandit dolor. Suspendisse quis fringilla odio.',
}




const DestinationFactModal: React.FC<DestinationFactModalProps> = ({
  isVisible,
  onClose,
  name = DESTINATION_FACTS_DATA.name,
  facts = DESTINATION_FACTS_DATA.facts,
  // DestinationFact
}) => {

  const styledFacts = `
  <html>
    <head>
      <style>
        p { font-size: 20px; color: #ffffff; line-height: 1.6; }
        strong { color: #ffffff; font-weight: bold; font-size: 20px;}
      </style>
    </head>
    <body>
      ${facts}
    </body>
  </html>
`;

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onDismiss={onClose}
      onBackdropPress={onClose}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={onClose}
      >
        <View style={styles.modal}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flex: 0.9 }}>
              <Text style={styles.title}>{name}</Text>
              <Text style={styles.subTitle}>Destination Facts:</Text>
            </View>
            <Pressable style={{ flex: 0.1 }} onPress={onClose}>
              <Image source={Images.CloseModal} />
            </Pressable>
          </View>
          <WebView
            originWhitelist={['*']}
            source={{ html: styledFacts}}
            style={styles.description}
            scalesPageToFit={false}
          />
        </View>
      </Pressable>
    </ReactNativeModal>
  )
}

const styles = {
  modal: {
    backgroundColor: theme.lightColors?.boxStatBG,
    borderRadius: 8,
    padding: 16,
    width: '100%',
    // flex: 1,
    height: 500,
  },
  title: {
    fontSize: 26,
    color: theme.lightColors?.white,
    fontFamily: FontFamily.PoppinsBold,
    fontWeight: 600,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 18,
    color: theme.lightColors?.white,
    fontFamily: FontFamily.NunitoSansRegular,
    fontWeight: 400,
    marginBottom: 15,
  },
  description: {
    fontSize: 30,
    fontWeight: 400,
    fontFamily: FontFamily.PoppinsBold,
    minHeight: 300,
    flex: 1,
    backgroundColor: theme.lightColors?.boxStatBG

  },
}

export default DestinationFactModal
