import React, {useEffect, useRef, useState} from "react";
import {Keyboard, Pressable, Text, View} from "react-native";
import {Formik} from "formik";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {Dropdown} from "react-native-element-dropdown";
import DatePicker from "react-native-date-picker";
import axios from "axios";
import {Asset, CameraOptions, launchImageLibrary} from "react-native-image-picker";
import {useDispatch, useSelector} from "react-redux";

import {RootStackParamList, ScreenStackComponent} from "../../constants/types";
import {DateFormat, formatDate} from "../../util/DateUtils";
import {FontSizes} from "../../util/FontUtils";
import {updateProfile} from "../../network";
import {accountSetupIsComplete, handleError, showMessage} from "../../util/helpers";
import {updateAccountFlag} from "../../redux/Login";
import {EditProfileSchema} from "../../util/ValidationSchemas";

import AppButton from "../../components/button";
import BackgroundWithImage from "../../components/background";
import AppHeader from "../../components/header";
import AppInput from "../../components/input";
import {AppText, ProfileAvatar} from "../../components";
import Icon from "../../components/Icon";

import useStyles from "./styles";

import theme from "../../assets/theme";
import {Icons} from "../../assets/Icons";
import WaiverDetailsModal from "screens/editProfile/WaiverDetailsModal";

interface ImageData {
  uri: string | undefined;
  type: string | undefined;
  name: string;
}

const GENDERS = [
  {label: "Female", value: 1},
  {label: "Male", value: 2},
  {label: "Prefer not to say", value: 3},
];

const dateToString = (date: Date | null) => {
  let formattedDate = "";
  if (date) {
    formattedDate = new Date(date).toISOString().split("T")[0];
  }
  return formattedDate;
};

const EditProfile: ScreenStackComponent<RootStackParamList, "EditProfile"> = ({
  route,
  navigation,
}) => {
  const edit = route?.params?.edit;
  const userData = route?.params?.profileDetails;
  const onProfileUpdate = route?.params?.onProfileUpdate;

  let dateOfBirth = null;
  if (userData?.date_of_birth) {
    const [year, month, day] = userData.date_of_birth.split("-").map(Number);
    dateOfBirth = new Date(year, month - 1, day);
  }
  const initialFormValues = {
    pImage: userData?.image ?? undefined,
    name: userData?.user?.name ?? "",
    gender: userData?.gender ?? undefined,
    phoneNumber: userData?.phone_number ?? "",
    address: userData?.home_address ?? "",
    country: userData?.home_country ?? "",
    date_of_birth: dateOfBirth ?? "",
  };

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isNameInputFocused, setNameInputFocused] = useState(false);
  const [isMobileInputFocused, setMobileInputFocused] = useState(false);
  const [isAddressInputFocused, setAddressInputFocused] = useState(false);
  const [isGenderDropDownFocused, setGenderDropDownFocused] = useState(false);
  const [isCountryDropDownFocused, setCountryDropDownFocused] = useState(false);
  const [photoDetails, setPhotoDetails] = useState<ImageData | null>(null);
  const [countryData, setCountryData] = useState<[]>([]);
  const [bDate, setBDate] = useState<Date>(dateOfBirth);
  const [isLoading, setIsLoading] = useState(false);
  const [gender, setGender] = useState({
    label: userData?.gender ?? "",
    value: userData?.gender ?? "",
  });
  const [country, setCountry] = useState({
    label: userData?.home_country ?? "",
    value: userData?.home_country ?? "",
  });
  const [detailsShow, setDetailsShow] = useState(false);
  const dispatch = useDispatch();
  const _styles = useStyles();
  const nameRef = useRef();
  const userProfile = useSelector((state: any) => state?.login?.data?.user);

  const handleConfirm = (date: Date, setFieldValue: (field: string, value: any) => {}) => {
    hideDatePicker();
    setBDate(date);
    setFieldValue("date_of_birth", dateToString(date));
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  function uploadProfileImage(image: Asset) {
    setPhotoDetails({
      uri: image.uri,
      type: image.type,
      name: Date.now() + ".jpeg",
    });
  }

  async function pickImage(setFieldValue: (field: string, value: any) => {}) {
    const options = {
      mediaType: "photo",
      includeBase64: false,
      quality: 1,
    } as CameraOptions;

    await launchImageLibrary(options, response => {
      if (response?.assets) {
        const selectedImageUri = response?.assets?.[0]?.uri;
        setFieldValue("pImage", selectedImageUri);
        uploadProfileImage(response?.assets?.[0]);
      }
    });
  }

  const handleNavigation = () => {
    if (edit) {
      onProfileUpdate();
      navigation.goBack();
    } else {
      setDetailsShow(true);
    }
  };

  const handleEditProfile = (values: any) => {
    const formattedDate = dateToString(bDate);
    // Check if country has a value, if not, use the existing value
    const updatedCountry = country.value ? country.value : userData?.home_country;
    const updatedGender = gender.value ? gender.value : userData?.gender;
    // Check if formattedDate has a value, if not, use the existing value
    const updatedDateOfBirth = formattedDate ? formattedDate : userData?.date_of_birth;
    nameRef.current = values.name;
    const updatedProfileData = new FormData();
    updatedProfileData.append("name", values.name);
    updatedProfileData.append("phone_number", values.phoneNumber);
    updatedProfileData.append("home_address", values.address);
    updatedProfileData.append("account_setup", true);
    gender.value ? updatedProfileData.append("gender", updatedGender) : {};
    updatedProfileData.append("home_country", updatedCountry);
    formattedDate ? updatedProfileData.append("date_of_birth", updatedDateOfBirth) : {};
    if (photoDetails?.name) {
      updatedProfileData.append("image", photoDetails);
    }
    setIsLoading(true);
    updateProfile({
      id: userProfile.user_profile.id,
      data: updatedProfileData,
    })
      .then(res => {
        if (res.status == 1) {
          showMessage("Details saved successfully!");
          handleNavigation();
        } else {
          handleError(res);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const formatPhoneNumber = (input: string) => {
    // Remove non-digit characters
    const cleaned = input.replace(/\D/g, "");

    // Apply desired format
    let formatted = "";
    for (let i = 0; i < cleaned.length; i++) {
      if (i == 0) {
        formatted += "1-";
      } else if (i === 4 || i === 7) {
        formatted += `-${cleaned[i]}`;
      } else {
        formatted += cleaned[i];
      }
    }
    return formatted;
  };

  useEffect(() => {
    var config = {
      method: "get",
      url: "https://api.countrystatecity.in/v1/countries",
      headers: {
        "X-CSCAPI-KEY": "QXZWZEV5d1RXVm80ZHNHVzk5S1prRWtHNEhwUjV3R3ltVW9Ta3lENw==",
      },
    };

    axios(config)
      .then(function (response) {
        var count = Object.keys(response.data).length;
        let countryArray = [];
        for (var i = 0; i < count; i++) {
          countryArray.push({
            value: response.data[i].iso2,
            label: response.data[i].name,
          });
        }
        setCountryData(countryArray);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  const acceptWaiverButtonHandler = () => {
    setDetailsShow(false);
    dispatch(updateAccountFlag(true));
    setIsLoading(true);

    if (edit) return;

    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{name: "TabNavigator", params: {screen: "GeoArChallenge"}}],
      });
    }, 500);
  };

  const formikRef = useRef(null);

  useEffect(() => {
    console.log("accountSetupIsComplete", accountSetupIsComplete(userData));
    console.log("userData", userData);
    if (userData && formikRef.current && !accountSetupIsComplete(userData)) {
      const dob = userData.date_of_birth ? new Date(userData.date_of_birth) : "";
      formikRef.current.setValues({
        pImage: userData?.image || undefined,
        name: userData?.user?.name || "",
        gender: userData?.gender || undefined,
        phoneNumber: userData?.phone_number || "",
        address: userData?.home_address || "",
        country: userData?.home_country || "",
        date_of_birth: dob ? dateToString(dob) : "",
      });
    }
  }, [userData]);

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        hideBackButton={!edit}
        title={edit ? "Edit Profile" : "Account Setup"}
        backgroundColor="transparent"
      />

      <KeyboardAwareScrollView nestedScrollEnabled>
        <Formik
          innerRef={formikRef}
          initialValues={initialFormValues}
          onSubmit={values => handleEditProfile(values)}
          enableReinitialize
          validationSchema={EditProfileSchema}
        >
          {({handleSubmit, values, errors, touched, setFieldValue}) => {
            return (
              <View style={_styles.container}>
                <View style={_styles.chidlView}>
                  {/* profile avatar */}
                  <ProfileAvatar
                    onChangeProfilePic={() => pickImage(setFieldValue)}
                    avatarUrl={values.pImage}
                  />

                  {/* Name */}
                  <AppInput
                    inputContainerStyle={[
                      _styles.input,
                      isNameInputFocused ? _styles.focusedInput : {},
                      touched.name && errors?.name ? _styles.inputError : {},
                    ]}
                    selectionColor={"white"}
                    onFocus={() => setNameInputFocused(true)}
                    onBlur={() => setNameInputFocused(false)}
                    placeholder="Full name"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={
                      (touched.name && errors?.name) || isNameInputFocused
                        ? theme.lightColors?.white
                        : theme.lightColors?.grey0
                    }
                    value={values.name}
                    onChangeText={value => setFieldValue("name", value)}
                    errorMessage={touched.name && errors?.name ? errors.name : undefined}
                    autoCapitalize="none"
                    leftIcon={
                      <Icon
                        name={"user"}
                        family="antdesign"
                        color={
                          (touched.name && errors?.name) || isNameInputFocused
                            ? theme.lightColors?.white
                            : theme.lightColors?.grey0
                        }
                        size={24}
                      />
                    }
                  />

                  {/* Gender */}
                  <View style={_styles.dropdownParentView}>
                    <Dropdown
                      style={[
                        _styles.dropdown,
                        isGenderDropDownFocused ? _styles.focusedInput : {},
                        touched.gender && errors?.gender && !gender?.value
                          ? _styles.inputError
                          : {},
                      ]}
                      placeholderStyle={{
                        color:
                          (touched.gender && errors?.gender && !gender?.value) ||
                          isGenderDropDownFocused
                            ? theme.lightColors?.white
                            : theme.lightColors?.grey0,
                        marginStart: 13,
                        fontSize: FontSizes.S14,
                        opacity: 1,
                      }}
                      containerStyle={{
                        borderWidth: 0,
                        backgroundColor: "transparent",
                      }}
                      onFocus={() => {
                        setGenderDropDownFocused(true);
                      }}
                      onBlur={() => {
                        setGenderDropDownFocused(false);
                      }}
                      activeColor={theme.lightColors?.inputBG}
                      itemContainerStyle={_styles.itemContainerStyle}
                      itemTextStyle={_styles.placeholderStyle}
                      selectedTextStyle={_styles.selectedTextStyle}
                      iconStyle={_styles.iconStyle}
                      data={GENDERS}
                      maxHeight={300}
                      labelField="label"
                      placeholder="Select Gender"
                      valueField="value"
                      value={values.gender}
                      onChange={item => {
                        setFieldValue("gender", item.value);
                        setGender(item);
                      }}
                      renderLeftIcon={() => (
                        <Icon
                          name={"meh"}
                          family="antdesign"
                          color={
                            (touched.gender && errors?.gender && !gender?.value) ||
                            isGenderDropDownFocused
                              ? theme.lightColors?.white
                              : theme.lightColors?.grey0
                          }
                          size={24}
                        />
                      )}
                    />
                    {touched.gender && errors?.gender && !gender?.value ? (
                      <Text style={_styles.errorText}>{errors.gender}</Text>
                    ) : undefined}
                  </View>

                  {/* Phone number */}
                  <AppInput
                    inputContainerStyle={[
                      _styles.input,
                      isMobileInputFocused ? _styles.focusedInput : {},
                      touched.phoneNumber && errors?.phoneNumber ? _styles.inputError : {},
                    ]}
                    onFocus={() => setMobileInputFocused(true)}
                    onBlur={() => setMobileInputFocused(false)}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholder="Mobile Number"
                    placeholderTextColor={
                      (touched.phoneNumber && errors?.phoneNumber) || isMobileInputFocused
                        ? theme.lightColors?.white
                        : theme.lightColors?.grey0
                    }
                    selectionColor={"white"}
                    value={values.phoneNumber}
                    onChangeText={value => setFieldValue("phoneNumber", formatPhoneNumber(value))}
                    maxLength={14}
                    errorMessage={
                      touched.phoneNumber && errors?.phoneNumber ? errors.phoneNumber : undefined
                    }
                    autoCapitalize="none"
                    keyboardType="phone-pad"
                    leftIcon={
                      <Icon
                        name={"phone"}
                        family="antdesign"
                        color={
                          (touched.phoneNumber && errors?.phoneNumber) || isMobileInputFocused
                            ? theme.lightColors?.white
                            : theme.lightColors?.grey0
                        }
                        size={24}
                      />
                    }
                  />

                  {/* Address */}
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
                        ? theme.lightColors?.white
                        : theme.lightColors?.grey0
                    }
                    selectionColor={"white"}
                    placeholder="Hometown"
                    value={values.address}
                    onChangeText={value => setFieldValue("address", value)}
                    errorMessage={touched.address && errors?.address ? errors.address : undefined}
                    autoCapitalize="none"
                    leftIcon={
                      <Icon
                        name={"enviromento"}
                        family="antdesign"
                        color={
                          (touched.address && errors?.address) || isAddressInputFocused
                            ? theme.lightColors?.white
                            : theme.lightColors?.grey0
                        }
                        size={24}
                      />
                    }
                  />

                  {/* Country */}
                  <View style={_styles.dropdownParentView}>
                    <Dropdown
                      style={[
                        _styles.dropdown,
                        isCountryDropDownFocused ? _styles.focusedInput : {},
                        touched.country && errors?.country && !country?.value
                          ? _styles.inputError
                          : {},
                      ]}
                      placeholderStyle={{
                        color:
                          (touched.country && errors?.country && !country?.value) ||
                          isCountryDropDownFocused
                            ? theme.lightColors?.white
                            : theme.lightColors?.grey0,
                        marginStart: 13,
                        fontSize: FontSizes.S14,
                        opacity: 1,
                      }}
                      containerStyle={{
                        borderWidth: 0,
                        backgroundColor: "transparent",
                      }}
                      onFocus={() => {
                        setCountryDropDownFocused(true);
                      }}
                      onBlur={() => {
                        setCountryDropDownFocused(false);
                      }}
                      activeColor={theme.lightColors?.inputBG}
                      itemContainerStyle={_styles.itemContainerStyle}
                      itemTextStyle={_styles.placeholderStyle}
                      selectedTextStyle={_styles.selectedTextStyle}
                      iconStyle={_styles.iconStyle}
                      data={countryData}
                      maxHeight={300}
                      labelField="label"
                      placeholder="Home Country"
                      valueField="value"
                      value={values.country}
                      onChange={item => {
                        setFieldValue("country", item.value);
                        setCountry(item);
                      }}
                      renderLeftIcon={() => (
                        <Icon
                          name={"enviromento"}
                          family="antdesign"
                          color={
                            (touched.country && errors?.country && !country?.value) ||
                            isCountryDropDownFocused
                              ? theme.lightColors?.white
                              : theme.lightColors?.grey0
                          }
                          size={24}
                        />
                      )}
                    />
                    {touched.country && errors?.country && !country?.value ? (
                      <Text style={_styles.errorText}>{errors.country}</Text>
                    ) : undefined}
                  </View>

                  {/* DOB */}
                  <View>
                    <Pressable
                      style={[
                        _styles.timeInput,
                        touched.date_of_birth && errors?.date_of_birth && !bDate
                          ? _styles.inputError
                          : {},
                      ]}
                      onPress={showDatePicker}
                    >
                      <View style={_styles.iconContainer}>
                        <Icon
                          onPress={() => {}}
                          name={"camerao"}
                          family="antdesign"
                          color={
                            touched.date_of_birth && errors?.date_of_birth && !bDate
                              ? theme.lightColors?.white
                              : theme.lightColors?.grey0
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
                      ) : userData?.date_of_birth ? (
                        <View style={_styles.textContainer}>
                          <AppText style={_styles.timeteststyle}>
                            {formatDate(userData.date_of_birth, DateFormat.MMDDYY)}
                          </AppText>
                        </View>
                      ) : (
                        <View style={_styles.textContainer}>
                          <AppText
                            style={
                              touched.date_of_birth && errors?.date_of_birth && !bDate
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
                        family="antdesign"
                        color={
                          touched.date_of_birth && errors?.date_of_birth && !bDate
                            ? theme.lightColors?.white
                            : theme.lightColors?.grey0
                        }
                        size={24}
                      />
                    </Pressable>
                    {touched.date_of_birth && errors?.date_of_birth && !bDate ? (
                      <Text style={[_styles.errorText, {marginTop: 5}]}>
                        Date of birth is required
                      </Text>
                    ) : undefined}
                  </View>
                  <DatePicker
                    modal
                    mode="date"
                    open={isDatePickerVisible}
                    date={bDate || new Date()}
                    onConfirm={date => handleConfirm(date, setFieldValue)}
                    onCancel={hideDatePicker}
                  />

                  <View style={_styles.privacyContainer}>
                    <View style={{marginRight: 10}}>
                      <Icons.Shield />
                    </View>
                    <AppText style={_styles.privacyText}>
                      Privacy First! Only your name and avatar will be visible on your profile. All
                      other information is kept confidential.
                    </AppText>
                  </View>

                  <AppButton
                    buttonStyle={_styles.buttonStyle}
                    containerStyle={_styles.buttonContainer}
                    title={"Save & Continue"}
                    onPress={handleSubmit}
                    loading={isLoading}
                  />
                </View>
              </View>
            );
          }}
        </Formik>
      </KeyboardAwareScrollView>

      <WaiverDetailsModal
        isVisible={detailsShow}
        confirmHandler={acceptWaiverButtonHandler}
        cancelHandler={() => {
          setDetailsShow(false);
        }}
      />
    </BackgroundWithImage>
  );
};

export default EditProfile;
