import React,{useEffect} from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { setItem ,getItem } from '../../util/helpers'
import Strings from '../../constants/Strings'

const AnimatedSplash = () => {
    const navigation = useNavigation()

    useEffect(()=>{
        setTimeout(async()=>{
            const onboarded =  await getItem(Strings.HasOnboarded);
            if(onboarded === Strings.Onboarded){
                navigation.navigate('SignUp')
            }
            else{
                await setItem(Strings.HasOnboarded,Strings.Onboarded)
                navigation.navigate('Onboarding')
            }
        },3000)
    },[])

    return (
        <View>
            <Text>AnimatedSplash</Text>
        </View>
    )
}

export default AnimatedSplash

const styles = StyleSheet.create({})