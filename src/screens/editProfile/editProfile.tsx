import React, { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";

import { Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from "axios";
import { Asset, CameraOptions, launchImageLibrary } from "react-native-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";

import { RootStackParamList, ScreenStackComponent } from "../../constants/types";
import { DateFormat, formatDate } from "../../util/DateUtils";
import { FontSizes } from "../../util/FontUtils";
import { updateProfile } from "../../network";
import { handleError, showMessage } from "../../util/helpers";
import { updateAccountFlag, updateName } from "../../redux/Login";
import { EditProfileSchema } from "../../util/ValidationSchemas";

import AppButton from "../../components/button";
import BackgroundWithImage from "../../components/background";
import AppHeader from "../../components/header";
import AppInput from "../../components/input";
import { AppText, ProfileAvatar } from "../../components";
import Icon from "../../components/Icon";

import useStyles from "./styles";

import theme from "../../assets/theme";
import { Icons } from "../../assets/Icons";

interface ImageData {
  uri: string | undefined;
  type: string | undefined;
  name: string;
}

const GENDERS = [
  { label: "Female", value: 1 },
  { label: "Male", value: 2 },
  { label: "Prefer not to say", value: 3 },
];

const dateToString = (date: Date | null) => {
  let formattedDate = "";
  if (date) {
    formattedDate = new Date(date).toISOString().split("T")[0];
  }
  return formattedDate;
};

const EditProfile: ScreenStackComponent<RootStackParamList, "EditProfile"> = () => {
  const edit = route?.params?.edit;
  const userData = route?.params?.profileDetails;
  const onProfileUpdate = route?.params?.onProfileUpdate;

  const [profileDetails, setProfileDetails] = useState(userData);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isNameInputFocused, setNameInputFocused] = useState(false);
  const [isMobileInputFocused, setMobileInputFocused] = useState(false);
  const [isAddressInputFocused, setAddressInputFocused] = useState(false);
  const [isGenderDropDownFocused, setGenderDropDownFocused] = useState(false);
  const [isCountryDropDownFocused, setCountryDropDownFocused] = useState(false);
  const [pImage, setPImage] = useState<string | undefined>(undefined);
  const [photoDetails, setPhotoDetails] = useState<ImageData | null>(null);
  const [countryData, setCountryData] = useState<[]>([]);
  const [bDate, setBDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gender, setGender] = useState({
    label: profileDetails?.gender ?? "",
    value: profileDetails?.gender ?? "",
  });
  const [country, setCountry] = useState({
    label: profileDetails?.home_country ?? "",
    value: profileDetails?.home_country ?? "",
  });

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
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

  async function pickImage() {
    const options = {
      mediaType: "photo",
      includeBase64: false,
      // maxHeight: 300,
      // maxWidth: 300,
      quality: 1,
    } as CameraOptions;

    await launchImageLibrary(options, response => {
      // setPImage(response?.assets?.[0]?.uri);
      if (response?.assets) {
        const selectedImageUri = response?.assets?.[0]?.uri;
        setPImage(selectedImageUri);
        uploadProfileImage(response?.assets?.[0]);
      }
    });
  }

  const handleNavigation = () => {
    if (edit) {
      onProfileUpdate();
      navigation.goBack();
    } else {
      dispatch(updateName(nameRef.current));
      dispatch(updateAccountFlag(true));
      navigation.reset({
        index: 0,
        routes: [{ name: "TabNavigator", params: { screen: "GeoArChallenge" } }],
      });
    }
  };

  const handleEditProfile = (values: any) => {
    const formattedDate = dateToString(bDate);
    // Check if country has a value, if not, use the existing value
    const updatedCountry = country.value ? country.value : profileDetails?.home_country;
    const updatedGender = gender.value ? gender.value : profileDetails?.gender;
    // Check if formattedDate has a value, if not, use the existing value
    const updatedDateOfBirth = formattedDate ? formattedDate : profileDetails?.date_of_birth;
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

  const handleInputChange = (input: string) => {
    const formattedNumber = formatPhoneNumber(input);
    setProfileDetails({ ...profileDetails, phone_number: formattedNumber });
  };

  const handleInputName = (input: string) => {
    setProfileDetails({ ...profileDetails, user: { name: input } });
  };

  const handleInputAddress = (input: string) => {
    setProfileDetails({ ...profileDetails, home_address: input });
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

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        hideBackButton={!edit}
        title={edit ? "Edit Profile" : "Account Setup"}
        backgroundColor="transparent"
      />

      <KeyboardAwareScrollView nestedScrollEnabled>
        <Formik
          initialValues={{
            name: profileDetails?.user.name ?? "",
            phoneNumber: profileDetails?.phone_number ?? "",
            address: profileDetails?.home_address ?? "",
            gender: profileDetails?.gender ?? "",
            country: profileDetails?.country ?? "",
            pImage: (pImage || profileDetails?.image) ?? undefined,
            date_of_birth: profileDetails?.date_of_birth ?? "",
          }}
          onSubmit={values => handleEditProfile(values)}
          enableReinitialize
          validationSchema={EditProfileSchema}
        >
          {({ handleSubmit, values, errors, touched, setFieldValue }) => {
            console.log(values, errors);
            return (
              <View style={_styles.container}>
                <View style={_styles.chidlView}>
                  {/* profile avatar */}
                  <ProfileAvatar onChangeProfilePic={pickImage} avatarUrl={values.pImage} />

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
                    onChangeText={e => handleInputName(e)}
                    errorMessage={touched.name && errors?.name ? errors.name : undefined}
                    autoCapitalize="none"
                    leftIcon={
                      <Icon
                        name={"user"}
                        family="feather"
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
                          family="feather"
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
                    onChangeText={e => handleInputChange(e)}
                    maxLength={14}
                    errorMessage={
                      touched.phoneNumber && errors?.phoneNumber ? errors.phoneNumber : undefined
                    }
                    autoCapitalize="none"
                    keyboardType="phone-pad"
                    leftIcon={
                      <Icon
                        name={"phone"}
                        family="feather"
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
                    onChangeText={e => handleInputAddress(e)}
                    errorMessage={touched.address && errors?.address ? errors.address : undefined}
                    autoCapitalize="none"
                    leftIcon={
                      <Icon
                        name={"map-pin"}
                        family="feather"
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
                          name={"map-pin"}
                          family="feather"
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
                          name={"aperture"}
                          family="feather"
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
                        family="feather"
                        color={
                          touched.date_of_birth && errors?.date_of_birth && !bDate
                            ? theme.lightColors?.white
                            : theme.lightColors?.grey0
                        }
                        size={24}
                      />
                    </Pressable>
                    {touched.date_of_birth && errors?.date_of_birth && !bDate ? (
                      <Text style={[_styles.errorText, { marginTop: 5 }]}>
                        Date of birth is required
                      </Text>
                    ) : undefined}
                  </View>
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    themeVariant="light"
                    onConfirm={date => handleConfirm(date, setFieldValue)}
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
    </BackgroundWithImage>
  );
};

export default EditProfile;
