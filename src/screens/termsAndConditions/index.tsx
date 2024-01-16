import React from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import RenderHtml from 'react-native-render-html';

const { width } = Dimensions.get('window');

const source = {
  html: `
<p style='text-align:center;'>
  Hello World!
</p>`
};

const TermsAndConditions = () => {
  return (
    <View>
      <RenderHtml
        contentWidth={width}
        source={source}
      />
    </View>
  )
}

export default TermsAndConditions

const styles = StyleSheet.create({})