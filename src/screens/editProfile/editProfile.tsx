import React, { useState } from "react"
import { Keyboard, TouchableOpacity, View } from "react-native"
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
import { AppText } from "../../components"
import { DateFormat, formatDate } from "../../util/DateUtils"
import { Avatar } from "@rneui/base"

const EditProfile: ScreenStackComponent<RootStackParamList, "EditProfile"> = ({
  navigation
}) => {
  const _styles = useStyles()
  const [gender, setGender] = useState(null)
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const [country, setCountry] = useState(null)
  const [isFocus, setIsFocus] = useState(false)
  const [bDate, setBDate] = useState<Date>(new Date())
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
                  <Avatar size={100}/>
                  <AppInput
                    inputContainerStyle={[_styles.input]}
                    placeholder="Name"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={theme.darkColors?.grey}
                    value={values.name}
                    onChangeText={handleChange("name")}
                    errorMessage={
                      touched.name && errors?.name ? errors.name : undefined
                    }
                    autoCapitalize="none"
                    leftIcon={Icons.UserIcon}
                  />
                  <View style={_styles.dropdownParentView}>
                    <Dropdown
                      style={_styles.dropdown}
                      placeholderStyle={_styles.placeholderStyle}
                      containerStyle={{
                        borderWidth: 0,
                        backgroundColor: "transparent"
                      }}
                      activeColor="#131450"
                      itemContainerStyle={_styles.itemContainerStyle}
                      itemTextStyle={_styles.placeholderStyle}
                      selectedTextStyle={_styles.selectedTextStyle}
                      iconStyle={_styles.iconStyle}
                      data={genders}
                      maxHeight={300}
                      labelField="label"
                      placeholder="Gender"
                      valueField="value"
                      value={(gender || values.gender) ?? ""}
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={value => {
                        setGender(value)
                        setIsFocus(false)
                      }}
                      renderLeftIcon={() => <Icons.FaceIcon />}
                    />
                  </View>
                  <AppInput
                    inputContainerStyle={[_styles.input]}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholder="Phone Number"
                    placeholderTextColor={theme.darkColors?.grey}
                    value={values.phoneNumber}
                    onChangeText={handleChange("phoneNumber")}
                    errorMessage={
                      touched.phoneNumber && errors?.phoneNumber
                        ? errors.phoneNumber
                        : undefined
                    }
                    autoCapitalize="none"
                    keyboardType="phone-pad"
                    leftIcon={Icons.Phone}
                  />
                  <AppInput
                    inputContainerStyle={[_styles.input]}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={theme.darkColors?.grey}
                    placeholder="Address"
                    value={values.address}
                    onChangeText={handleChange("address")}
                    errorMessage={
                      touched.address && errors?.address
                        ? errors.address
                        : undefined
                    }
                    autoCapitalize="none"
                    leftIcon={Icons.LocationIcon}
                  />
                  <View style={_styles.dropdownParentView}>
                    <Dropdown
                      style={_styles.dropdown}
                      placeholderStyle={_styles.placeholderStyle}
                      containerStyle={{
                        borderWidth: 0,
                        backgroundColor: "transparent"
                      }}
                      activeColor="#131450"
                      itemContainerStyle={_styles.itemContainerStyle}
                      itemTextStyle={_styles.placeholderStyle}
                      selectedTextStyle={_styles.selectedTextStyle}
                      iconStyle={_styles.iconStyle}
                      data={genders}
                      maxHeight={300}
                      labelField="label"
                      placeholder="Country"
                      valueField="value"
                      value={(country || values.country) ?? ""}
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={value => {
                        setCountry(value)
                        setIsFocus(false)
                      }}
                      renderLeftIcon={() => <Icons.LocationIcon />}
                    />
                  </View>

                  <TouchableOpacity
                    style={[_styles.timeInput]}
                    onPress={showDatePicker}
                  >
                    <View style={_styles.iconContainer}>
                      <Icons.DOBIcon />
                    </View>
                    {bDate ? (
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
                  </TouchableOpacity>

                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                    maximumDate={new Date()}
                    date={bDate}
                    // locale="en_GB"
                  />
                  <View style={_styles.privacyContainer}>
                    <View style={{marginRight: 10}}>
                      <Icons.Shield/>
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
