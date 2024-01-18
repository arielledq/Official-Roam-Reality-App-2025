import React from 'react'
import { Dimensions, StyleSheet, Text, ScrollView } from 'react-native'
import RenderHtml from 'react-native-render-html';
import BackgroundWithImage from '../../components/background';
import { AppHeader } from '../../components';
import terms from '../../constants/terms';


const { width } = Dimensions.get('window');

const PrivacyPolicy = () => {
  return (
    <BackgroundWithImage>
      <AppHeader title={"Privacy Policy"} backgroundColor="transparent" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        style={{ marginHorizontal: 20 }
        }
      >
        <RenderHtml
          contentWidth={width}
          source={{
            html: terms

          }}
        />
      </ScrollView>
    </BackgroundWithImage>
  )
}

export default PrivacyPolicy

const styles = StyleSheet.create({})