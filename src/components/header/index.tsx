import { useNavigation } from '@react-navigation/native';
import { Header } from '@rneui/base';
import React, { FC } from 'react';
import { AppHeaderProps } from './type';
import { TouchableOpacity } from 'react-native';
import useStyles from './styles';
import theme from '../../assets/theme';
import { getHitSlop } from '../../util/buttonUtil';
import { BackArrowIcon } from '../../assets/svg';

const AppHeader: FC<AppHeaderProps> = (props) => {
  const navigation = useNavigation();
  const styles = useStyles();
  const backIcon = () => {
    return (
      <TouchableOpacity
        style={styles.backIcon}
        hitSlop={getHitSlop(5)}
        onPress={() => navigation?.goBack()}>
        <BackArrowIcon />
      </TouchableOpacity>
    );
  };

  function onTitlePress() {
    if (props?.onTitlePress) {
      props?.onTitlePress();
    }
  }

  return (
    <Header
      leftComponent={
        props?.leftComponent ?? (!!props?.hideBackButton ? <></> : backIcon())
      }
      centerComponent={{
        text: props?.title,
        style: [styles.heading, props?.titleStyle ?? {}],
        onPress: () => onTitlePress(),
      }}
      rightComponent={props?.rightComponent ? props?.rightComponent : <></> }
      backgroundColor={theme.darkColors?.inputBG}
      containerStyle={styles.containerStyle}
      {...props}
    />
  );
};

export default AppHeader;
