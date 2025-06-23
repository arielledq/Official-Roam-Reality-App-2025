import React, {useCallback, useEffect, useRef, useState} from "react";
import {View} from "react-native";
import {AppButton} from "components";

const ARModeView = ({ setMode, onClose }) => {
    return (
        <View style={{ width: '100%', gap:10, flex: 1}}>
            <AppButton
                buttonStyle={{height: 52, width: '100%' }}
                customColors={["#B816E0", "#8516e0", "#1158F4"]}
                onPress={() => setMode('checkin')}
                titleStyle={{ width: '100%', fontWeight: '700' }}
                title={'Check-in Mode'}
            />
            <AppButton
                buttonStyle={{ height: 52, width: '100%' }}
                titleStyle={{ width: '100%', fontWeight: '700' }}
                onPress={() => setMode('scan')}
                customColors={["#B816E0", "#8516e0", "#1158F4"]}
                title={'Scan Mode'}
            />
            <AppButton
                buttonStyle={{height: 52, width: '100%' }}
                customColors={["#B816E0", "#8516e0", "#1158F4"]}
                onPress={() => setMode('hunt')}
                titleStyle={{ width: '100%', fontWeight: '700' }}
                title={'Hunt Mode'}
            />

        </View>
    );
};

export default ARModeView;



// import React from 'react';
// import { View, Text } from "react-native";
//
// const CheckinModeView = () => {
//     return (
//         <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
//             <Text style={{ color: 'white', fontSize: 16 }}>
//                 Check-in mode will be available soon.
//             </Text>
//         </View>
//     );
// };
//
// export default CheckinModeView;
