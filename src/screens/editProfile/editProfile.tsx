import React, { useState } from "react"
import { Keyboard, Pressable, Text, View } from "react-native"
import { Formik } from "formik"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import theme from "../../assets/theme"
import AppButton from "../../components/button"
import useStyles from "./styles"
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../navigation/types"
import BackgroundWithImage from "../../components/background"
import AppHeader from "../../components/header"
import { Dropdown } from "react-native-element-dropdown"
import AppInput from "../../components/input"
import { Icons } from "../../assets/Icons"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { AppText, ProfileAvatar } from "../../components"
import { DateFormat, formatDate } from "../../util/DateUtils"
import Icon from "../../components/Icon"
import { FontSizes } from "../../util/FontUtils"
import { EditProfileSchema } from "../../util/ValidationSchemas"

const EditProfile: ScreenStackComponent<RootStackParamList, "EditProfile"> = ({
  navigation
}) => {
  const _styles = useStyles()
  const [gender, setGender] = useState(null)
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const [isNameInputFocused, setNameInputFocused] = useState(false)
  const [isMobileInputFocused, setMobileInputFocused] = useState(false)
  const [isAddressInputFocused, setAddressInputFocused] = useState(false)
  const [isGenderDropDownFocused, setGenderDropDownFocused] = useState(false)
  const [isCountryDropDownFocused, setCountryDropDownFocused] = useState(false)

  const [country, setCountry] = useState(null)
  const [isFocus, setIsFocus] = useState(false)
  const [bDate, setBDate] = useState<Date|null>(null)
  const [genders, setGenders] = useState([
    { label: "Female", value: "female" },
    { label: "Male", value: "male" },
    { label: "Prefer not to say", value: "other" }
  ])
  const handleConfirm = (date: Date) => {
    // const formattedDate = moment(date).format("DD/MM/yyyy").split("/")
    setBDate(date)
    hideDatePicker()
  }
  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  function handleEditProfile() {}

  return (
    <>
      <BackgroundWithImage style={_styles.mainContainer}>
        <AppHeader title={"Edit Profile"} backgroundColor="transparent" />
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
        >
          <Formik
            initialValues={{
              name: "",
              phoneNumber: "",
              address: "",
              gender: "",
              country: "",
              dob: Date.now().toString()
            }}
            onSubmit={handleEditProfile}
            validationSchema={EditProfileSchema}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <View style={_styles.container}>
                <View style={_styles.chidlView}>
                  <ProfileAvatar avatarUrl={undefined} />
                  <AppInput
                    inputContainerStyle={[
                      _styles.input,
                      isNameInputFocused ? _styles.focusedInput : {},
                      touched.name && errors?.name ? _styles.inputError : {}
                    ]}
                    selectionColor={"white"}
                    onFocus={() => setNameInputFocused(true)}
                    onBlur={() => setNameInputFocused(false)}
                    placeholder="Full name"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={
                      (touched.name && errors?.name) || isNameInputFocused
                        ? theme.darkColors?.white
                        : theme.darkColors?.grey
                    }
                    value={values.name}
                    onChangeText={handleChange("name")}
                    errorMessage={
                      touched.name && errors?.name ? errors.name : undefined
                    }
                    autoCapitalize="none"
                    leftIcon={
                      <Icon
                        name={"user"}
                        family="feather"
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
                        touched.gender && errors?.gender && !gender
                          ? _styles.inputError
                          : {}
                      ]}
                      placeholderStyle={{
                        color:
                          (touched.gender && errors?.gender && !gender) ||
                          isGenderDropDownFocused
                            ? theme.darkColors?.white
                            : theme.darkColors?.grey,
                        marginStart: 13,
                        fontSize: FontSizes.S14,
                        opacity: 1
                      }}
                      containerStyle={{
                        borderWidth: 0,
                        backgroundColor: "transparent"
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
                      labelField="label"
                      placeholder="Select Gender"
                      valueField="value"
                      value={(gender || values.gender) ?? ""}
                      // onFocus={() => setIsFocus(true)}
                      // onBlur={() => setIsFocus(false)}
                      onChange={value => {
                        handleChange("gender")
                        setGender(value)
                        setIsFocus(false)
                      }}
                      renderLeftIcon={() => (
                        <Icon
                          name={"meh"}
                          family="feather"
                          color={
                            (touched.gender && errors?.gender && !gender) ||
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
                      touched.phoneNumber && errors?.phoneNumber
                        ? _styles.inputError
                        : {}
                    ]}
                    onFocus={() => setMobileInputFocused(true)}
                    onBlur={() => setMobileInputFocused(false)}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholder="Mobile Number"
                    placeholderTextColor={
                      (touched.phoneNumber && errors?.phoneNumber) ||
                      isMobileInputFocused
                        ? theme.darkColors?.white
                        : theme.darkColors?.grey
                    }
                    selectionColor={"white"}
                    value={values.phoneNumber}
                    onChangeText={handleChange("phoneNumber")}
                    errorMessage={
                      touched.phoneNumber && errors?.phoneNumber
                        ? errors.phoneNumber
                        : undefined
                    }
                    autoCapitalize="none"
                    keyboardType="phone-pad"
                    leftIcon={
                      <Icon
                        name={"phone"}
                        family="feather"
                        color={
                          (touched.phoneNumber && errors?.phoneNumber) ||
                          isMobileInputFocused
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
                      touched.address && errors?.address
                        ? _styles.inputError
                        : {}
                    ]}
                    onFocus={() => setAddressInputFocused(true)}
                    onBlur={() => setAddressInputFocused(false)}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={
                      (touched.address && errors?.address) ||
                      isAddressInputFocused
                        ? theme.darkColors?.white
                        : theme.darkColors?.grey
                    }
                    selectionColor={"white"}
                    placeholder="Home Address"
                    value={values.address}
                    onChangeText={handleChange("address")}
                    errorMessage={
                      touched.address && errors?.address
                        ? errors.address
                        : undefined
                    }
                    autoCapitalize="none"
                    leftIcon={
                      <Icon
                        name={"map-pin"}
                        family="feather"
                        color={
                          (touched.address && errors?.address) ||
                          isAddressInputFocused
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
                        isCountryDropDownFocused ? _styles.focusedInput : {},
                        touched.country && errors?.country && !country
                          ? _styles.inputError
                          : {}
                      ]}
                      placeholderStyle={{
                        color:
                          (touched.country && errors?.country && !country) ||
                          isCountryDropDownFocused
                            ? theme.darkColors?.white
                            : theme.darkColors?.grey,
                        marginStart: 13,
                        fontSize: FontSizes.S14,
                        opacity: 1
                      }}
                      containerStyle={{
                        borderWidth: 0,
                        backgroundColor: "transparent"
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
                      data={genders}
                      maxHeight={300}
                      labelField="label"
                      placeholder="Home Country"
                      valueField="value"
                      value={(country || values.country) ?? ""}
                      // onFocus={() => setIsFocus(true)}
                      // onBlur={() => setIsFocus(false)}
                      onChange={value => {
                        handleChange("country")
                        setCountry(value)
                        setIsFocus(false)
                      }}
                      renderLeftIcon={() => (
                        <Icon
                          name={"map-pin"}
                          family="feather"
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
                        touched.dob && errors?.dob && !bDate
                          ? _styles.inputError
                          : {}
                      ]}
                      onPress={showDatePicker}
                    >
                      <View style={_styles.iconContainer}>
                        <Icon
                          onPress={() => {}}
                          name={"aperture"}
                          family="feather"
                          color={
                            touched.dob && errors?.dob && !bDate
                              ? theme.darkColors?.white
                              : theme.darkColors?.TandCgrey
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
                      ) : (
                        <View style={_styles.textContainer}>
                          <AppText
                            style={
                              touched.dob && errors?.dob && !bDate
                                ? _styles.placeholderDOBStyle
                                : _styles.placeholderStyle
                            }
                          >
                            Date of Birth
                          </AppText>
                        </View>
                      )}
                      <Icon
                        onPress={() => {}}
                        name={"calendar"}
                        family="feather"
                        color={
                          touched.dob && errors?.dob && !bDate
                            ? theme.darkColors?.white
                            : theme.darkColors?.TandCgrey
                        }
                        size={24}
                      />
                    </Pressable>
                    {touched.dob && errors?.dob && !bDate ? (
                      <Text style={[_styles.errorText, { marginTop: 5 }]}>
                        Date of birth is required
                      </Text>
                    ) : undefined}
                  </View>
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    themeVariant="light"
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
                      Privacy First! Only your name and avatar will be visible
                      on your profile. All other information is kept
                      confidential.
                    </AppText>
                  </View>
                  <AppButton
                    buttonStyle={_styles.buttonStyle}
                    containerStyle={_styles.buttonContainer}
                    title={"Save & Continue"}
                    onPress={handleSubmit}
                    //   loading={isLoading}
                  />
                </View>
              </View>
            )}
          </Formik>
        </KeyboardAwareScrollView>
      </BackgroundWithImage>
    </>
  )
}

export default EditProfile
