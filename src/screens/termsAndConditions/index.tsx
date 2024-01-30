import React, { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, ScrollView } from 'react-native'
import RenderHtml from 'react-native-render-html';
import BackgroundWithImage from '../../components/background';
import { AppHeader } from '../../components';
import { getTermsAndConditions } from '../../network';
import ScreenLoader from '../../components/screenLoader';


const { width } = Dimensions.get('window');

const TermsAndConditions = () => {
  const [loading, setLoading] = useState(true)
  const [html, setHtml] = useState('')
  useEffect(() => {
    getTermsAndConditions().then((res) => {
      setHtml(res.data[0].body)
    }).finally(() => setLoading(false))
  }, [])
  return (
    <BackgroundWithImage>
      <AppHeader title={"Terms and Conditions"} backgroundColor="transparent" />
      {loading ? <ScreenLoader /> : <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        style={{ marginHorizontal: 20 }
        }
      >
        <RenderHtml
          contentWidth={width}
          source={{
            html: html

          }}
        />
      </ScrollView>}
    </BackgroundWithImage>
  )
}

export default TermsAndConditions

const styles = StyleSheet.create({})