import React, { useState } from 'react'
import { View,FlatList} from 'react-native'
import {  AppHeader, AppText } from '../../components';
import BackgroundWithImage from '../../components/background';
import useStyles from "./styles"
import DownArrowIcon from '../../assets/svg/DownArrowIcon';
import { TouchableOpacity } from 'react-native-gesture-handler';
import UpArrowIcon from '../../assets/svg/UpArrowIcon';

const QuestionItem = ({item}) => {
    const _styles = useStyles()
    const [readmore, setReadmore] = useState(false)
    return (
        <View style={_styles.container}>
            <View style={_styles.row}>
                <AppText style={readmore ? _styles.question : _styles.question1}>
                  Lorem Ipsum is simply dummy text of the printing 
                </AppText>
                <TouchableOpacity 
                  onPress={()=>setReadmore((prev) => !prev)} 
                  style={_styles.btn}
                >
                    {readmore ? <UpArrowIcon/> : <DownArrowIcon/>}
                </TouchableOpacity>
            </View>
            {readmore && <AppText style={_styles.answer}>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
                when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
                It has survived not only five centuries,
            </AppText>}
            <View style={ _styles.line}/>
        </View>
    
    )
}

const FAQ = () => {
  const _styles = useStyles()
  return (
    <BackgroundWithImage>
      <AppHeader title={"FAQ"} backgroundColor="transparent" />
      <FlatList
        data={[1,2,3,4]}
        renderItem={(item)=><QuestionItem item={item}/>}
        contentContainerStyle={_styles.contentContainerStyle}
      />
    </BackgroundWithImage>
  )
}

export default FAQ


