import React, {useEffect, useState} from 'react'
import { Dimensions, StyleSheet, Text, ScrollView } from 'react-native'
import BackgroundWithImage from '../../components/background';
import { AppHeader } from '../../components';
import ScreenLoader from '../../components/screenLoader';
import {useSelector} from "react-redux";
import RenderHTML from "react-native-render-html";
import {FontSizes} from "util/FontUtils.ts";
import {getARStettings, getTermsAndConditions, getUserAgreement} from "network";


const { width } = Dimensions.get('window');

const UserAgreement = () => {
  const [loading, setLoading] = useState(true)
  const [html, setHtml] = useState('')
  useEffect(() => {
    getUserAgreement().then((res) => {
      setHtml(res.data[0].body)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <BackgroundWithImage>
      <AppHeader title={"End User Agreement"} backgroundColor="transparent" />
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
            em: { color: "#fff", fontStyle: "italic" },
            u: { color: "#fff" ,textDecorationLine: "underline", },
            s: { color: "#fff", textDecorationLine: "line-through", },
            strong: { color: "#fff", fontSize: FontSizes.S18 },
          }}
          source={{ html: html }}
          contentWidth={width}
        />
      </ScrollView>}
    </BackgroundWithImage>
  )
}

export default UserAgreement

const styles = StyleSheet.create({})