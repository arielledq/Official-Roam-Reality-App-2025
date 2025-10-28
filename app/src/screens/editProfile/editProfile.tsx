import React, {useEffect, useRef, useState} from "react";
import {Image, Keyboard, Pressable, Text, TextInput, View} from "react-native";
import {Formik} from "formik";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {Dropdown} from "react-native-element-dropdown";
import DatePicker from "react-native-date-picker";
import axios from "axios";
import {Asset} from "react-native-image-picker";
import {useDispatch, useSelector} from "react-redux";
import {Button, Dialog, Portal} from "react-native-paper";

import {RootStackParamList, ScreenStackComponent} from "../../constants/types";
import {DateFormat, formatDate} from "../../util/DateUtils";
import {FontSizes} from "../../util/FontUtils";
import {DeleteProfilePicture, updateProfile} from "../../network";
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
import Images from "../../assets/images";
import {ProfilePlaceholder} from "assets/base64";
import {updateUserProperties} from "redux/Login/reducer";
import {useFocusEffect} from "@react-navigation/native";
import ImagePicker from "react-native-image-crop-picker";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import {height} from "util/AppDimensions";
interface ImageData {
  uri: string | undefined;
  type: string | undefined;
  name: string;
  default: boolean;
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
    instagram: userData?.instagram_handle ?? "", // new field
  };

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isInstagramInputFocused, setInstagramInputFocused] = useState(false);
  const [isNameInputFocused, setNameInputFocused] = useState(false);
  const [isMobileInputFocused, setMobileInputFocused] = useState(false);
  const [isAddressInputFocused, setAddressInputFocused] = useState(false);
  const [isGenderDropDownFocused, setGenderDropDownFocused] = useState(false);
  const [photoDetails, setPhotoDetails] = useState<ImageData | null>(null);
  const [countryData, setCountryData] = useState<[]>([]);
  const [filteredCountryData, setFilteredCountryData] = useState<[]>([]);
  const [countrySearchText, setCountrySearchText] = useState("");
  const [bDate, setBDate] = useState<Date>(dateOfBirth);
  const [isLoading, setIsLoading] = useState(false);
  const [gender, setGender] = useState({
    label: userData?.gender ?? "",
    value: userData?.gender ?? "",
  });
  const [waiverIsVisible, setWaiverIsVisible] = useState(false);
  const [addProfilePictureIsVisible, setAddProfilePictureIsVisible] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);
  const [updatedProfileValues, setUpdatedProfileValues] = useState<any>(null);

  const formikRef = useRef(null);
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

  const getFileName = (filePath: any) => {
    return filePath.split("/").pop();
  };

  function uploadProfileImage(image: Asset) {
    setPhotoDetails({
      uri: image.path,
      name: getFileName(image.path),
      type: image.mime,

      default: false,
    });
  }

  async function pickImage(setFieldValue: (field: string, value: any) => {}) {
    try {
      // Use ImagePicker directly for picking and cropping in one step
      const croppedImage = await ImagePicker.openPicker({
        mediaType: "photo",
        width: widthPercentageToDP("100%"),
        height: height * 0.4,
        cropping: true,
        includeBase64: false,
      });

      setFieldValue("pImage", croppedImage.path);
      uploadProfileImage(croppedImage);
    } catch (error) {
      console.log("Image picker cancelled or error:", error);
    }
  }

  const handleEditProfile = (values: any) => {
    const formattedDate = dateToString(bDate);
    // Check if country has a value, if not, use the existing value
    const updatedCountry = values.country ? values.country : userData?.home_country;
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

    if (values.instagram && values.instagram.trim()) {
      // new field appended if provided
      updatedProfileData.append("instagram_handle", values.instagram);
    }
    if (!photoDetails?.default && photoDetails?.uri) {
      updatedProfileData.append("image", photoDetails);
    }
    console.log("Updated Profile Data:", updatedProfileData);
    setIsLoading(true);
    updateProfile({
      id: userProfile.user_profile.id,
      data: updatedProfileData,
    })
      .then(res => {
        if (res.status == 1) {
          if (!!edit) {
            onProfileUpdate();
            navigation.goBack();
          } else {
            setWaiverIsVisible(true);
          }
          showMessage("Details saved successfully!");
          setUpdatedProfileValues(res?.user);
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

    return cleaned;
  };

  const filterCountries = (searchText: string) => {
    if (!searchText.trim()) {
      setFilteredCountryData(countryData);
      return;
    }

    const filtered = countryData.filter((country: any) =>
      country.label.toLowerCase().startsWith(searchText.toLowerCase())
    );
    setFilteredCountryData(filtered);
  };

  const acceptWaiverButtonHandler = () => {
    setWaiverIsVisible(false);
    dispatch(updateAccountFlag(true));
    setIsLoading(true);

    if (edit) return;

    navigation.reset({
      index: 0,
      routes: [{name: "TabNavigator", params: {screen: "GeoArChallenge"}}],
    });
  };

  const updateReduxProfileDetails = () => {
    dispatch(updateUserProperties(updatedProfileValues));
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
        setFilteredCountryData(countryArray);
      })
      .catch(function (error) {
        console.error(error);
      });

    return () => {
      setCountryData([]);
      setFilteredCountryData([]);
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        updateReduxProfileDetails();
      };
    }, [])
  );

  useEffect(() => {
    if (userData && formikRef.current && !accountSetupIsComplete(userData)) {
      const dob = userData.date_of_birth ? new Date(userData.date_of_birth) : "";
      // @ts-ignore
      formikRef.current.setValues({
        pImage: userData?.image,
        name: userData?.user?.name || "",
        gender: userData?.gender || undefined,
        phoneNumber: userData?.phone_number || "",
        address: userData?.home_address || "",
        country: userData?.home_country || "",
        date_of_birth: dob ? dateToString(dob) : "",
        instagram_handle: userData?.instagram || "", // update instagram value
      });
      setPhotoDetails({
        uri: userData?.image,
        type: "image/png",
        name: "profile.png",
        default: true,
      });
    }
  }, [userData]);

  const handleDeleteAccount = async () => {
    const rest = await DeleteProfilePicture();
    console.log("Delete Profile Picture Response:", rest);
  };

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        hideBackButton={!edit}
        title={edit ? "Edit Profile" : "Account Setup"}
        backgroundColor="transparent"
      />

      <KeyboardAwareScrollView>
        <Formik
          innerRef={formikRef}
          initialValues={initialFormValues}
          onSubmit={values => {
            if (!edit && photoDetails?.default) {
              setPendingValues(values);
              setAddProfilePictureIsVisible(true);
            } else {
              handleEditProfile(values);
            }
          }}
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
                    onDeleteProfilePic={async () => {
                      setFieldValue("pImage", undefined);
                      setPhotoDetails({
                        uri: undefined,
                        type: undefined,
                        name: "",
                        default: true,
                      });
                      const res = await DeleteProfilePicture();
                      console.log("Delete Profile Picture Response:", res);
                    }}
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
                      activeColor={theme.lightColors?.inputBlue}
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
                          name={"idcard"}
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
                    placeholder="City/Town"
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
                      autoScroll={false}
                      mode="default"
                      style={[
                        _styles.dropdown,

                        touched.country && errors?.country && !values.country
                          ? _styles.inputError
                          : {},
                      ]}
                      placeholderStyle={{
                        color:
                          (touched.country && errors?.country && !values.country) ||
                          theme.lightColors?.grey0,
                        marginStart: 13,
                        fontSize: FontSizes.S14,
                        opacity: 1,
                      }}
                      containerStyle={{
                        borderWidth: 0,
                        backgroundColor: theme.lightColors?.grey4,
                        marginTop: heightPercentageToDP("0.5%"),
                      }}
                      // inputSearchStyle={{
                      //   color: theme.lightColors?.white,
                      //   fontSize: FontSizes.S14,
                      //   borderWidth: 1,
                      //   borderBottomWidth: 0,
                      //   backgroundColor: theme.lightColors?.inputBG,

                      // }}
                      renderInputSearch={() => (
                        <TextInput
                          style={{
                            ..._styles.input,
                            backgroundColor: theme.lightColors?.inputBG,
                            borderWidth: 1,
                            borderColor: theme.lightColors?.white,
                            color: theme.lightColors?.white,
                          }}
                          placeholder="Search Country"
                          placeholderTextColor={theme.lightColors?.grey0}
                          selectionColor={"white"}
                          autoCapitalize="none"
                          value={countrySearchText}
                          onChangeText={text => {
                            setCountrySearchText(text);
                            filterCountries(text);
                          }}
                        />
                      )}
                      searchPlaceholder="Search Country"
                      searchPlaceholderTextColor={theme.lightColors?.grey0}
                      activeColor={theme.lightColors?.inputBlue}
                      itemContainerStyle={{
                        color: theme.lightColors?.grey0,
                      }}
                      keyboardAvoiding={true}
                      itemTextStyle={_styles.placeholderStyle}
                      selectedTextStyle={_styles.selectedTextStyle}
                      iconStyle={_styles.iconStyle}
                      data={filteredCountryData}
                      // maxHeight={300}
                      labelField="label"
                      placeholder="Home Country"
                      search
                      valueField="value"
                      value={values.country}
                      onChange={item => {
                        setFieldValue("country", item.value);
                      }}
                      renderLeftIcon={() => (
                        <Icon
                          name={"enviromento"}
                          family="antdesign"
                          color={
                            (touched.country && errors?.country && !values.country) ||
                            theme.lightColors?.grey0
                          }
                          size={24}
                        />
                      )}
                    />
                    {touched.country && errors?.country && !values.country ? (
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
                          name={"calendar"}
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

                  {/* Instagram Handle - new optional field */}
                  <View style={{marginTop: 20}} />
                  <AppInput
                    inputContainerStyle={[
                      _styles.input,
                      isInstagramInputFocused ? _styles.focusedInput : {},
                    ]}
                    onFocus={() => setInstagramInputFocused(true)}
                    onBlur={() => setInstagramInputFocused(false)}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholder="Instagram Handle"
                    placeholderTextColor={
                      isInstagramInputFocused ? theme.lightColors?.white : theme.lightColors?.grey0
                    }
                    selectionColor={"white"}
                    value={values.instagram}
                    onChangeText={value => setFieldValue("instagram", value)}
                    autoCapitalize="none"
                    leftIcon={
                      <Icon
                        name={"instagram"}
                        family="feather"
                        color={
                          isInstagramInputFocused
                            ? theme.lightColors?.white
                            : theme.lightColors?.grey0
                        }
                        size={24}
                      />
                    }
                  />

                  <AppButton
                    buttonStyle={_styles.buttonStyle}
                    containerStyle={_styles.buttonContainer}
                    title={"Save & Continue"}
                    onPress={handleSubmit}
                    loading={isLoading}
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
                </View>
              </View>
            );
          }}
        </Formik>
      </KeyboardAwareScrollView>

      {waiverIsVisible && (
        <WaiverDetailsModal
          isVisible
          confirmHandler={acceptWaiverButtonHandler}
          cancelHandler={() => {
            setWaiverIsVisible(false);
          }}
        />
      )}

      <Portal>
        <Dialog
          visible={addProfilePictureIsVisible}
          onDismiss={() => setAddProfilePictureIsVisible(false)}
          style={{
            backgroundColor: "#1E1E2D",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Dialog.Title style={{color: "white"}}>Make sure to add a profile picture</Dialog.Title>
          <Dialog.Content>
            <Text style={{color: "#B8B8B8", fontSize: 14, lineHeight: 20}}>
              Do you wish to go back and choose a profile picture?
            </Text>
          </Dialog.Content>
          <Dialog.Actions
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 0,
              marginTop: 8,
              gap: 8,
            }}
          >
            <Button
              mode="text"
              onPress={() => {
                if (pendingValues) {
                  setAddProfilePictureIsVisible(false);
                  handleEditProfile(pendingValues);
                }
              }}
              textColor="#FF3B30"
              style={{
                borderRadius: 8,
                width: 100,
              }}
              labelStyle={{
                paddingVertical: 8,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Skip
            </Button>

            <View style={{flex: 1}}>
              <AppButton
                title="Go Back"
                onPress={() => setAddProfilePictureIsVisible(false)}
                buttonStyle={{
                  height: 40,
                }}
                titleStyle={{
                  fontSize: 14,
                }}
              />
            </View>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </BackgroundWithImage>
  );
};

export default EditProfile;
