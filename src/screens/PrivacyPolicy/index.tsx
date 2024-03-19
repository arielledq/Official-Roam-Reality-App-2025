import React, { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, ScrollView } from 'react-native'
import RenderHtml from 'react-native-render-html';
import BackgroundWithImage from '../../components/background';
import { AppHeader } from '../../components';
import ScreenLoader from '../../components/screenLoader';
import { getPrivacyPolicy } from '../../network';
import { FontSizes } from '../../util/FontUtils';


const { width } = Dimensions.get('window');

const PrivacyPolicy = () => {
  const [loading, setLoading] = useState(true)
  const [html, setHtml] = useState('')
  useEffect(() => {
    getPrivacyPolicy().then((res) => {
      setHtml(res.data[0].body)
    }).finally(() => setLoading(false))
  }, [])
  return (
    <BackgroundWithImage>
      <AppHeader title={"Privacy Policy"} backgroundColor="transparent" />
      {loading ? <ScreenLoader /> : <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        style={{ marginHorizontal: 20 }
        }
      >
        <RenderHtml
          contentWidth={width}
          tagsStyles={{
            body: {
              lineHeight:19.1,
              color: '#fff',
              fontSize: FontSizes.S14
            },
          }}
          source={{
            html: html
          }}
        />
      </ScrollView>}
    </BackgroundWithImage>
  )
}

export default PrivacyPolicy

const styles = StyleSheet.create({})