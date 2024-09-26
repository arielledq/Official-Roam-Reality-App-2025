import React, { useState } from "react"
import {
  View,
  Text,
  Pressable,
  Image
} from "react-native"

import ReactNativeModal from "react-native-modal"
import theme from "../../assets/theme"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { FontFamily } from "../../util/FontUtils"
import Images from "../../assets/images"

interface DestinationFactModalProps {
  isVisible: boolean;
  onClose: () => void;
  // DestinationFact: ;
}

const DESTINATION_FACTS_DATA = {
  name: "Name of destination",
  facts: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean molestie purus congue euismod dapibus. Suspendisse quis leo non dolor egestas gravida ut faucibus diam. Vestibulum sed bibendum augue, a placerat felis. Fusce egestas, est a porttitor aliquet, urna nibh pellentesque sapien, suscipit volutpat eros quam in ante. Cras sapien massa, semper maximus sem nec, venenatis lacinia mauris. Quisque eu neque cursus, tristique leo quis, blandit dolor. Suspendisse quis fringilla odio."
}

const DestinationFactModal: React.FC<DestinationFactModalProps> = ({
                                                                     isVisible,
                                                                     onClose,
                                                                     // DestinationFact
                                                                   }) => {

  return (
    <ReactNativeModal isVisible={isVisible} onDismiss={onClose}>
      <KeyboardAwareScrollView>
        <View style={styles.modal}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <View style={{ flex: 0.9 }}>
              <Text style={styles.title}>{DESTINATION_FACTS_DATA.name}</Text>
              <Text style={styles.subTitle}>
                Destination Facts:
              </Text>
            </View>
            <Pressable style={{ flex: 0.1 }} onPress={onClose}>
              <Image source={Images.CloseModal} />
            </Pressable>
          </View>
          <Text style={styles.description}>{DESTINATION_FACTS_DATA?.facts}</Text>
        </View>
      </KeyboardAwareScrollView>
    </ReactNativeModal>
  )
}

const styles = {
  modal: {
    backgroundColor: theme.lightColors?.boxStatBG,
    borderRadius: 8,
    padding: 16,
    width: "100%",
    alignself: "center"
  },
  title: {
    fontSize: 16,
    color: theme.lightColors?.white,
    FontFamily: FontFamily.PoppinsBold,
    fontWeight: 600,
    marginBottom: 8
  },
  subTitle: {
    fontSize: 10,
    color: theme.lightColors?.white,
    FontFamily: FontFamily.NunitoSansRegular,
    fontWeight: 400,
    marginBottom: 15
  },
  description: {
    fontSize: 14,
    fontWeight: 400,
    color: theme.lightColors?.white,
    FontFamily: FontFamily.PoppinsBold
  }
}

export default DestinationFactModal
