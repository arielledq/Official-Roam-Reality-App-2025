import * as React from 'react'
import { FontSizes, fontGroup } from '../util/FontUtils'
import { View, Text } from 'react-native'
// @ts-expect-error
import ARSiteCountBG from '../assets/geoar/ar_site_count_bg.svg'

const NumericStatItem = ({ count, label }: { count: string | number; label: string }) => {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      }}
    >
      <View
        style={{
          width: 58,
          height: 58,

          borderRadius: 58 * 2,

          alignItems: 'center',
          justifyContent: 'center',

          marginBottom: 10,
        }}
      >
        <ARSiteCountBG style={{ width: 60, height: 60 }}></ARSiteCountBG>
        <Text
          style={{
            ...(fontGroup.ns700 as any),
            fontWeight: 800,
            fontSize: FontSizes.S18,
            color: '#FFF',
            alignItems: 'center',
            textAlign: 'center',
            position: 'absolute',
            top: 16,
          }}
        >
          {count}
        </Text>
      </View>
      <Text
        style={{
          ...(fontGroup.ns400 as any),
          fontSize: FontSizes.S12,
          fontWeight: 700,
          color: '#FFF',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  )
}

export default NumericStatItem
