import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Keyboard, Platform, Pressable, Text, View } from 'react-native'
import { Formik } from 'formik'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import theme from '../../assets/theme'
import AppButton from '../../components/button'
import useStyles from './styles'
import { RootStackParamList, ScreenStackComponent } from '../../navigation/types'
import BackgroundWithImage from '../../components/background'
import AppHeader from '../../components/header'
import { Dropdown } from 'react-native-element-dropdown'
import AppInput from '../../components/input'
import { Icons } from '../../assets/Icons'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { AppText, ProfileAvatar } from '../../components'
import { DateFormat, formatDate } from '../../util/DateUtils'
import Icon from '../../components/Icon'
import { FontSizes } from '../../util/FontUtils'
import { EditProfileSchema } from '../../util/ValidationSchemas'
import axios from 'axios'
import { Asset, CameraOptions, launchImageLibrary } from 'react-native-image-picker'
import { useDispatch, useSelector } from 'react-redux'
import { getProfieDetails, updateProfile } from '../../network'
import { handleError, showMessage } from '../../util/helpers'
import { useNavigation, useRoute } from '@react-navigation/native'
import { updateAccountFlag, updateName } from '../../redux/Login'

interface ImageData {
  uri: string | undefined
  type: string | undefined
  name: string
}

const EditProfile: ScreenStackComponent<RootStackParamList, 'EditProfile'> = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const route = useRoute()
  const edit = route?.params?.edit
  const userData = route?.params?.profileDetails
  const onProfileUpdate = route?.params?.onProfileUpdate
  const _styles = useStyles()
  const [profileDetails, setProfileDetails] = useState(userData)
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const [isNameInputFocused, setNameInputFocused] = useState(false)
  const [isMobileInputFocused, setMobileInputFocused] = useState(false)
  const [isAddressInputFocused, setAddressInputFocused] = useState(false)
  const [isGenderDropDownFocused, setGenderDropDownFocused] = useState(false)
  const [isCountryDropDownFocused, setCountryDropDownFocused] = useState(false)
  const [pImage, setPImage] = useState<string | undefined>(undefined)
  const [photoDetails, setPhotoDetails] = useState<ImageData | null>(null)
  const [pageLoading, setPageLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [countryData, setCountryData] = useState([])
  const [height, setHeight] = useState(0)
  const nameRef = useRef()
  // Function to fetch
  const fetchProfileDetails = async () => {
    try {
      // const details = await getProfieDetails({
      //   id: userProfile.user_profile.id
      // })

      // Store the details in the state variable
      setProfileDetails(userData)
    } catch (error) {
      console.error('Error fetching profile details: ', error)
    }
  }
  useEffect(() => {
    // fetchProfileDetails()
    //   .then(() => setPageLoading(false))
    //   .catch(error => {
    //     console.error("Error fetching profile details: ", error);
    //     setPageLoading(false);
    //   });
    var config = {
      method: 'get',
      url: 'https://api.countrystatecity.in/v1/countries',
      headers: {
        'X-CSCAPI-KEY': 'QXZWZEV5d1RXVm80ZHNHVzk5S1prRWtHNEhwUjV3R3ltVW9Ta3lENw==',
      },
    }

    axios(config)
      .then(function (response) {
        var count = Object.keys(response.data).length
        let countryArray = []
        for (var i = 0; i < count; i++) {
          countryArray.push({
            value: response.data[i].iso2,
            label: response.data[i].name,
          })
        }
        setCountryData(countryArray)
      })
      .catch(function (error) {
        console.error(error)
      })
  }, [])
  const [isFocus, setIsFocus] = useState(false)
  const [bDate, setBDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const userProfile = useSelector(state => state.login?.data?.user)
  const [genders, setGenders] = useState([
    { label: 'Female', value: 1 },
    { label: 'Male', value: 2 },
    { label: 'Prefer not to say', value: 3 },
  ])
  const handleConfirm = (date: Date) => {
    hideDatePicker()
    setBDate(date)
  }
  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }
  const [gender, setGender] = useState({
    label: profileDetails?.gender ?? '',
    value: profileDetails?.gender ?? '',
  })

  const [country, setCountry] = useState({
    label: profileDetails?.home_country ?? '',
    value: profileDetails?.home_country ?? '',
  })

  function uploadProfileImage(image: Asset) {
    setPhotoDetails({
      uri: image.uri,
      type: image.type,
      name: Date.now() + '.jpeg',
    })
  }

  async function pickImage() {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      // maxHeight: 300,
      // maxWidth: 300,
      quality: 1,
    } as CameraOptions

    await launchImageLibrary(options, response => {
      // setPImage(response?.assets?.[0]?.uri);
      if (response?.assets) {
        const selectedImageUri = response?.assets?.[0]?.uri
        setPImage(selectedImageUri)
        uploadProfileImage(response?.assets?.[0])
      }
    })
  }

  const handleNavigation = () => {
    if (edit) {
      onProfileUpdate()
      navigation.goBack()
    } else {
      dispatch(updateName(nameRef.current))
      dispatch(updateAccountFlag(true))
      navigation.reset({
        index: 0,
        routes: [{ name: 'TabNavigator', params: { screen: 'GeoArChallenge' } }],
      })
    }
  }

  const handleEditProfile = values => {
    const formattedDate = bDate ? new Date(bDate).toISOString().split('T')[0] : null

    // Check if country has a value, if not, use the existing value
    const updatedCountry = country.value ? country.value : profileDetails?.home_country

    const updatedGender = gender.value ? gender.value : profileDetails?.gender

    // Check if formattedDate has a value, if not, use the existing value
    const updatedDateOfBirth = formattedDate ? formattedDate : profileDetails?.date_of_birth
    nameRef.current = values.name
    const updatedProfileData = new FormData()
    updatedProfileData.append('name', values.name)
    updatedProfileData.append('phone_number', values.phoneNumber)
    updatedProfileData.append('home_address', values.address)
    updatedProfileData.append('account_setup', true)
    gender.value ? updatedProfileData.append('gender', updatedGender) : {}
    updatedProfileData.append('home_country', updatedCountry)
    formattedDate ? updatedProfileData.append('date_of_birth', updatedDateOfBirth) : {}
    if (photoDetails?.name) {
      updatedProfileData.append('image', photoDetails)
    }
    setIsLoading(true)
    updateProfile({
      id: userProfile.user_profile.id,
      data: updatedProfileData,
    })
      .then(res => {
        if (res.status == 1) {
          showMessage('Details saved successfully!')
          handleNavigation()
        } else {
          handleError(res)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const formatPhoneNumber = (input: string) => {
    // Remove non-digit characters
    const cleaned = input.replace(/\D/g, '')

    // Apply desired format
    let formatted = ''
    for (let i = 0; i < cleaned.length; i++) {
      if (i == 0) {
        formatted += '1-'
      } else if (i === 4 || i === 7) {
        formatted += `-${cleaned[i]}`
      } else {
        formatted += cleaned[i]
      }
    }
    return formatted
  }

  const handleInputChange = (input: string) => {
    const formattedNumber = formatPhoneNumber(input)
    setProfileDetails({ ...profileDetails, phone_number: formattedNumber })
  }

  const handleInputName = (input: string) => {
    setProfileDetails({ ...profileDetails, user: { name: input } })
  }

  const handleInputAddress = (input: string) => {
    setProfileDetails({ ...profileDetails, home_address: input })
  }
  return (
    <>
      <BackgroundWithImage style={_styles.mainContainer}>
        <AppHeader
          hideBackButton={!edit}
          title={edit ? 'Edit Profile' : 'Account Setup'}
          backgroundColor='transparent'
        />
        {pageLoading ? (
          <View style={_styles.loaderContainer}>
            <ActivityIndicator size='large' color={theme.lightColors?.pink} />
          </View>
        ) : (
          <KeyboardAwareScrollView keyboardShouldPersistTaps='always' nestedScrollEnabled>
            <Formik
              initialValues={{
                name: profileDetails?.user.name ?? '',
                phoneNumber: profileDetails?.phone_number ?? '',
                address: profileDetails?.home_address ?? '',
                gender: profileDetails?.gender ?? '',
                pImage: (pImage || profileDetails?.image) ?? undefined,
              }}
              onSubmit={values => handleEditProfile(values)}
              enableReinitialize
              validationSchema={EditProfileSchema}
            >
              {({ handleChange, handleSubmit, values, errors, touched }) => (
                <View style={_styles.container}>
                  <View style={_styles.chidlView}>
                    {/* profile avatar */}
                    <ProfileAvatar onChangeProfilePic={pickImage} avatarUrl={values.pImage} />

                    {/* input fields */}
                    <AppInput
                      inputContainerStyle={[
                        _styles.input,
                        isNameInputFocused ? _styles.focusedInput : {},
                        touched.name && errors?.name ? _styles.inputError : {},
                      ]}
                      selectionColor={'white'}
                      onFocus={() => setNameInputFocused(true)}
                      onBlur={() => setNameInputFocused(false)}
                      placeholder='Full name'
                      onSubmitEditing={Keyboard.dismiss}
                      placeholderTextColor={
                        (touched.name && errors?.name) || isNameInputFocused
                          ? theme.darkColors?.white
                          : theme.darkColors?.grey
                      }
                      value={values.name}
                      onChangeText={e => handleInputName(e)}
                      errorMessage={touched.name && errors?.name ? errors.name : undefined}
                      autoCapitalize='none'
                      leftIcon={
                        <Icon
                          name={'user'}
                          family='feather'
                          color={
                            (touched.name && errors?.name) || isNameInputFocused
                              ? theme.darkColors?.white
                              : theme.darkColors?.TandCgrey
                          }
                          size={24}
                        />
                      }
                    />
                    <View style={_styles.dropdownParentView}>
                      <Dropdown
                        style={[
                          _styles.dropdown,
                          isGenderDropDownFocused ? _styles.focusedInput : {},
                          // touched.gender && errors?.gender && !gender
                          //   ? _styles.inputError
                          //   : {}
                        ]}
                        placeholderStyle={{
                          color:
                            // (touched.gender && errors?.gender && !gender) ||
                            isGenderDropDownFocused
                              ? theme.darkColors?.white
                              : theme.darkColors?.grey,
                          marginStart: 13,
                          fontSize: FontSizes.S14,
                          opacity: 1,
                        }}
                        containerStyle={{
                          borderWidth: 0,
                          backgroundColor: 'transparent',
                        }}
                        onFocus={() => {
                          setGenderDropDownFocused(true)
                        }}
                        onBlur={() => {
                          setGenderDropDownFocused(false)
                        }}
                        activeColor={theme.darkColors?.inputBG}
                        itemContainerStyle={_styles.itemContainerStyle}
                        itemTextStyle={_styles.placeholderStyle}
                        selectedTextStyle={_styles.selectedTextStyle}
                        iconStyle={_styles.iconStyle}
                        data={genders}
                        maxHeight={300}
                        labelField='label'
                        placeholder='Select Gender'
                        valueField='value'
                        value={profileDetails?.gender ?? null}
                        // onFocus={() => setIsFocus(true)}
                        // onBlur={() => setIsFocus(false)}
                        onChange={value => {
                          handleChange('gender')
                          setGender(value)
                          setIsFocus(false)
                        }}
                        renderLeftIcon={() => (
                          <Icon
                            name={'meh'}
                            family='feather'
                            color={
                              // (touched.gender && errors?.gender && !gender) ||
                              isGenderDropDownFocused
                                ? theme.darkColors?.white
                                : theme.darkColors?.TandCgrey
                            }
                            size={24}
                          />
                        )}
                      />
                      {touched.gender && errors?.gender && !gender ? (
                        <Text style={_styles.errorText}>{errors.gender}</Text>
                      ) : undefined}
                    </View>
                    <AppInput
                      inputContainerStyle={[
                        _styles.input,
                        isMobileInputFocused ? _styles.focusedInput : {},
                        touched.phoneNumber && errors?.phoneNumber ? _styles.inputError : {},
                      ]}
                      onFocus={() => setMobileInputFocused(true)}
                      onBlur={() => setMobileInputFocused(false)}
                      onSubmitEditing={Keyboard.dismiss}
                      placeholder='Mobile Number'
                      placeholderTextColor={
                        (touched.phoneNumber && errors?.phoneNumber) || isMobileInputFocused
                          ? theme.darkColors?.white
                          : theme.darkColors?.grey
                      }
                      selectionColor={'white'}
                      value={values.phoneNumber}
                      onChangeText={e => handleInputChange(e)}
                      maxLength={14}
                      errorMessage={
                        touched.phoneNumber && errors?.phoneNumber ? errors.phoneNumber : undefined
                      }
                      autoCapitalize='none'
                      keyboardType='phone-pad'
                      leftIcon={
                        <Icon
                          name={'phone'}
                          family='feather'
                          color={
                            (touched.phoneNumber && errors?.phoneNumber) || isMobileInputFocused
                              ? theme.darkColors?.white
                              : theme.darkColors?.TandCgrey
                          }
                          size={24}
                        />
                      }
                    />
                    <AppInput
                      inputContainerStyle={[
                        _styles.input,
                        isAddressInputFocused ? _styles.focusedInput : {},
                        touched.address && errors?.address ? _styles.inputError : {},
                      ]}
                      onFocus={() => setAddressInputFocused(true)}
                      onBlur={() => setAddressInputFocused(false)}
                      onSubmitEditing={Keyboard.dismiss}
                      placeholderTextColor={
                        (touched.address && errors?.address) || isAddressInputFocused
                          ? theme.darkColors?.white
                          : theme.darkColors?.grey
                      }
                      selectionColor={'white'}
                      placeholder='Hometown'
                      value={values.address}
                      onChangeText={e => handleInputAddress(e)}
                      errorMessage={touched.address && errors?.address ? errors.address : undefined}
                      autoCapitalize='none'
                      leftIcon={
                        <Icon
                          name={'map-pin'}
                          family='feather'
                          color={
                            (touched.address && errors?.address) || isAddressInputFocused
                              ? theme.darkColors?.white
                              : theme.darkColors?.TandCgrey
                          }
                          size={24}
                        />
                      }
                      onContentSizeChange={event => setHeight(event.nativeEvent.contentSize.height)}
                    />
                    <View style={_styles.dropdownParentView}>
                      <Dropdown
                        style={[
                          _styles.dropdown,
                          isCountryDropDownFocused ? _styles.focusedInput : {},
                          touched.country && errors?.country && !country ? _styles.inputError : {},
                        ]}
                        placeholderStyle={{
                          color:
                            (touched.country && errors?.country && !country) ||
                            isCountryDropDownFocused
                              ? theme.darkColors?.white
                              : theme.darkColors?.grey,
                          marginStart: 13,
                          fontSize: FontSizes.S14,
                          opacity: 1,
                        }}
                        containerStyle={{
                          borderWidth: 0,
                          backgroundColor: 'transparent',
                        }}
                        onFocus={() => {
                          setCountryDropDownFocused(true)
                        }}
                        onBlur={() => {
                          setCountryDropDownFocused(false)
                        }}
                        activeColor={theme.darkColors?.inputBG}
                        itemContainerStyle={_styles.itemContainerStyle}
                        itemTextStyle={_styles.placeholderStyle}
                        selectedTextStyle={_styles.selectedTextStyle}
                        iconStyle={_styles.iconStyle}
                        data={countryData}
                        maxHeight={300}
                        labelField='label'
                        placeholder='Home Country'
                        valueField='value'
                        value={profileDetails?.home_country ?? ''}
                        onChange={item => {
                          handleChange('country')
                          setCountry(item)
                          setIsFocus(false)
                        }}
                        renderLeftIcon={() => (
                          <Icon
                            name={'map-pin'}
                            family='feather'
                            color={
                              (touched.country && errors?.country && !country) ||
                              isCountryDropDownFocused
                                ? theme.darkColors?.white
                                : theme.darkColors?.TandCgrey
                            }
                            size={24}
                          />
                        )}
                      />
                      {touched.country && errors?.country && !country ? (
                        <Text style={_styles.errorText}>{errors.country}</Text>
                      ) : undefined}
                    </View>
                    <View>
                      <Pressable
                        style={[
                          _styles.timeInput,
                          // touched.dob && errors?.dob && !bDate
                          //   ? _styles.inputError
                          //   : {}
                        ]}
                        onPress={showDatePicker}
                      >
                        <View style={_styles.iconContainer}>
                          <Icon
                            onPress={() => {}}
                            name={'aperture'}
                            family='feather'
                            color={
                              // touched.dob && errors?.dob && !bDate
                              //   ? theme.darkColors?.white
                              //   :
                              theme.darkColors?.TandCgrey
                            }
                            size={24}
                          />
                        </View>
                        {bDate !== null ? (
                          <View style={_styles.textContainer}>
                            <AppText style={_styles.timeteststyle}>
                              {formatDate(bDate, DateFormat.MMDDYY)}
                            </AppText>
                          </View>
                        ) : profileDetails?.date_of_birth ? (
                          <View style={_styles.textContainer}>
                            <AppText style={_styles.timeteststyle}>
                              {formatDate(profileDetails.date_of_birth, DateFormat.MMDDYY)}
                            </AppText>
                          </View>
                        ) : (
                          <View style={_styles.textContainer}>
                            <AppText
                              style={
                                // touched.dob && errors?.dob && !bDate
                                //   ? _styles.placeholderDOBStyle
                                //   :
                                _styles.placeholderStyle
                              }
                            >
                              Date of Birth
                            </AppText>
                          </View>
                        )}
                        <Icon
                          onPress={() => {}}
                          name={'calendar'}
                          family='feather'
                          color={
                            // touched.dob && errors?.dob && !bDate
                            //   ? theme.darkColors?.white
                            //   :
                            theme.darkColors?.TandCgrey
                          }
                          size={24}
                        />
                      </Pressable>
                      {/* {touched.dob && errors?.dob && !bDate ? (
                      <Text style={[_styles.errorText, { marginTop: 5 }]}>
                        Date of birth is required
                      </Text>
                    ) : undefined} */}
                    </View>
                    <DateTimePickerModal
                      isVisible={isDatePickerVisible}
                      mode='date'
                      themeVariant='light'
                      onConfirm={handleConfirm}
                      onCancel={hideDatePicker}
                      maximumDate={new Date()}
                      date={bDate || new Date()} // Provide a default value if bDate is null
                      // locale="en_GB"
                    />
                    <View style={_styles.privacyContainer}>
                      <View style={{ marginRight: 10 }}>
                        <Icons.Shield />
                      </View>
                      <AppText style={_styles.privacyText}>
                        Privacy First! Only your name and avatar will be visible on your profile.
                        All other information is kept confidential.
                      </AppText>
                    </View>
                    <AppButton
                      buttonStyle={_styles.buttonStyle}
                      containerStyle={_styles.buttonContainer}
                      title={'Save & Continue'}
                      onPress={handleSubmit}
                      loading={isLoading}
                    />
                  </View>
                </View>
              )}
            </Formik>
          </KeyboardAwareScrollView>
        )}
      </BackgroundWithImage>
    </>
  )
}

export default EditProfile
