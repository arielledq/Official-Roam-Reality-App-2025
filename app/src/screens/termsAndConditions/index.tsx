import React, { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, ScrollView } from 'react-native'
import RenderHtml from 'react-native-render-html';
import BackgroundWithImage from '../../components/background';
import { AppHeader } from '../../components';
import { getTermsAndConditions } from '../../network';
import ScreenLoader from '../../components/screenLoader';
import { FontSizes } from '../../util/FontUtils';
import RenderHTML from "react-native-render-html";


const { width } = Dimensions.get('window');

const TermsAndConditions = () => {
  const [loading, setLoading] = useState(true)
  const [html, setHtml] = useState('')
  useEffect(() => {
    getTermsAndConditions().then((res) => {
      setHtml(res.data[0].body?.replace(/#000000/g, "#fff"))
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
        <RenderHTML
          tagsStyles={{
            p: { color: "#fff", fontSize: FontSizes.S14 },
            ol: { color: "#fff", fontSize: FontSizes.S14 },
            ul: { color: "#fff", fontSize: FontSizes.S14 },
            strong: { color: "#fff", fontSize: FontSizes.S18 },
          }}
          source={{ html: html }}
          contentWidth={width}
        />
      </ScrollView>}
    </BackgroundWithImage>
  )
}

export default TermsAndConditions

const styles = StyleSheet.create({})