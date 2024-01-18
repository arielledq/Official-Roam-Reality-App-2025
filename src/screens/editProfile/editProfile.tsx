import React, { useState } from "react"
import { Keyboard, Pressable, View } from "react-native"
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
import { Avatar } from "@rneui/base"
import Icon from "../../components/Icon"
import { FontSizes } from "../../util/FontUtils"

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
  const [isDOBFocused, setDOBFocused] = useState(false)

  const [country, setCountry] = useState(null)
  const [isFocus, setIsFocus] = useState(false)
  const [bDate, setBDate] = useState <Date | null>(null)
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
            // validationSchema={validationSchema}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <View style={_styles.container}>
                <View style={_styles.chidlView}>
                  <ProfileAvatar avatarUrl={undefined} />
                  <AppInput
                    inputContainerStyle={[
                      _styles.input,
                      isNameInputFocused ? _styles.focusedInput : {}
                    ]}
                    onFocus={() => setNameInputFocused(true)}
                    onBlur={() => setNameInputFocused(false)}
                    placeholder="Full name"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={
                      isNameInputFocused
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
                          isNameInputFocused
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
                        isGenderDropDownFocused ? _styles.focusedInput : {}
                      ]}
                      placeholderStyle={{
                        color: isGenderDropDownFocused
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
                        setGender(value)
                        setIsFocus(false)
                      }}
                      renderLeftIcon={() => (
                        <Icon
                          name={"meh"}
                          family="feather"
                          color={
                            isGenderDropDownFocused
                              ? theme.darkColors?.white
                              : theme.darkColors?.TandCgrey
                          }
                          size={24}
                        />
                      )}
                    />
                  </View>
                  <AppInput
                    inputContainerStyle={[
                      _styles.input,
                      isMobileInputFocused ? _styles.focusedInput : {}
                    ]}
                    onFocus={() => setMobileInputFocused(true)}
                    onBlur={() => setMobileInputFocused(false)}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholder="Mobile Number"
                    placeholderTextColor={
                      isMobileInputFocused
                        ? theme.darkColors?.white
                        : theme.darkColors?.grey
                    }
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
                      isAddressInputFocused ? _styles.focusedInput : {}
                    ]}
                    onFocus={() => setAddressInputFocused(true)}
                    onBlur={() => setAddressInputFocused(false)}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={
                      isAddressInputFocused
                        ? theme.darkColors?.white
                        : theme.darkColors?.grey
                    }
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
                        isCountryDropDownFocused ? _styles.focusedInput : {}
                      ]}
                      placeholderStyle={{
                        color: isCountryDropDownFocused
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
                      activeColor="#131450"
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
                        setCountry(value)
                        setIsFocus(false)
                      }}
                      renderLeftIcon={() => (
                        <Icon
                          name={"map-pin"}
                          family="feather"
                          color={
                            isCountryDropDownFocused
                              ? theme.darkColors?.white
                              : theme.darkColors?.TandCgrey
                          }
                          size={24}
                        />
                      )}
                    />
                  </View>

                  <Pressable
                    style={[
                      _styles.timeInput,
                      isDOBFocused ? _styles.focusedInput : {}
                    ]}
                    onPress={showDatePicker}
                  >
                    <View style={_styles.iconContainer}>
                      <Icon
                        onPress={() => {}}
                        name={"aperture"}
                        family="feather"
                        color={
                          isDOBFocused
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
                        <AppText style={_styles.placeholderStyle}>
                          Select a Date
                        </AppText>
                      </View>
                    )}
                    <Icons.Calendar />
                  </Pressable>

                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
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
