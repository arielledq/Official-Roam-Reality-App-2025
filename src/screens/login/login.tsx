import React, { useEffect, useState } from 'react';

// import {
//   AppHeader,
//   AppInput,
//   AppText,
//   DividerWithText,
// } from '../../components';

import { Alert, Keyboard, Text, TouchableOpacity, View } from 'react-native';

import { Formik } from 'formik';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import useStyles from './styles';
import {
  RootStackParamList,
  ScreenStackComponent,
} from '../../navigation/types';
import AppButton from '../../components/button';
import AppInput from '../../components/input';
import { EyeIcon, LockIcon, MailIcon } from '../../assets/svg';
import AppHeader from '../../components/header';
import BackgroundWithImage from '../../components/background';

const Login: ScreenStackComponent<RootStackParamList, 'Login'> = ({
  navigation,
}) => {

  const _styles = useStyles();
  const [passwordVisibility, setPasswordVisibility] = useState(true);

  
  return (
    <>
      <BackgroundWithImage style={_styles.mainContainer}>
        <AppHeader title={'Login'} backgroundColor='transparent' />
        <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
          <Formik
            initialValues={{
              username: '',
              password: '',
            }}
            onSubmit={() => console.log('hello')}
            // validationSchema={validationSchema}
            >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={_styles.container}>
                <AppInput
                  inputContainerStyle={[_styles.input]}
                  placeholder={'Email Address'}
                  placeholderTextColor="#9CA3AF"
                  value={values.username}
                  autoCapitalize="none"
                  onChangeText={handleChange('username')}
                  // onBlur={handleBlur('username')}
                  errorMessage={
                    touched.username && errors?.username
                      ? errors.username
                      : undefined
                  }
                  autoCorrect={false}
                  textContentType="username"
                  autoComplete="username"
                  leftIconContainerStyle={{marginRight: 5}}
                  leftIcon={<MailIcon/>}
                />
                <AppInput
                  inputContainerStyle={[_styles.input]}
                  secureTextEntry={passwordVisibility && true}
                  onSubmitEditing={Keyboard.dismiss}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  // onBlur={handleBlur('password')}
                  errorMessage={
                    touched.password && errors?.password
                      ? errors.password
                      : undefined
                  }
                  autoCapitalize="none"
                  leftIcon={<LockIcon />}
                  rightIcon={<EyeIcon />}
                />
                {/* forgot password */}
                {/* <AppText
                  style={_styles.fpText}
                  onPress={navigateToResetPassword}>
                  {t('forgot_password')}?
                </AppText> */}
                {/* login Button */}
                {/* <AppButton
                  buttonStyle={_styles.buttonStyle}
                  containerStyle={_styles.buttonContainer}
                  title={t('login')}
                  onPress={handleSubmit}
                  loading={isLoading}
                /> */}
                {/* signup */}
                {/* <AppText style={_styles.dontHaveAccount}>
                  {t('dont_have_account')}
                  <AppText
                    style={_styles.signupLink}
                    onPress={navigateToSignUp}>
                    {' ' + t('signup')}
                  </AppText>
                </AppText> */}
                {/* divider */}
                {/* <DividerWithText
                  containerStyle={_styles.divider}
                  label={t('orLoginWith')}
                /> */}
                {/* Spotify  */}
                {/* <AppButton
                  buttonStyle={_styles.spotifyButton}
                  title={t('spotify')}
                  onPress={handleSpotify}
                  // loading={isLoading}
                  icon={<Spotify style={_styles.spotifyIcon} />}
                /> */}

                {/* Apple login  */}
                <AppButton
                  buttonStyle={{height: 50}}
                  title={'Sign In'}
                  // onPress={handleSubmit}
                  // loading={isLoading}
                //   icon={<AppleMusic style={_styles.spotifyIcon} />}
                />
              </View>
            )}
          </Formik>
        </KeyboardAwareScrollView>
      </BackgroundWithImage>
    </>
  );
};

export default Login;
