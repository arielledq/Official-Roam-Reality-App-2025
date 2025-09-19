import React, {useEffect} from "react";
import {Platform, StyleSheet, TouchableOpacity, View} from "react-native";
import {GoogleSignin, statusCodes} from "@react-native-google-signin/google-signin";
import DividerWithText from "../dividerwithtextcomponent";
import {AppleIcon, FacebookIcon, GoogleIcon} from "../../assets/svg";
import {AccessToken, AuthenticationToken, LoginManager} from "react-native-fbsdk-next";
import "react-native-get-random-values";
import uuid from "react-native-uuid";
import appleAuth, {appleAuthAndroid} from "@invertase/react-native-apple-authentication";
import {APPLE_CLIENT_ID, APPLE_REDIRECT_URL} from "../../network/config";
import {googleLogin, appleLogin, facebookLogin} from "../../network";
import {useDispatch, useSelector} from "react-redux";
import {updateUserData} from "../../redux/Login";
import {updateAsOldUser} from "../../redux/Persist";
import {handleError, showMessage} from "../../util/helpers";
import Config from "config";

const SocialSignin = ({setLoading}) => {
  const dispatch = useDispatch();
  const newUser = useSelector(state => state.persist.newUser);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userinfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      googleLogin({
        access_token: tokens.accessToken,
        id_token: tokens.idToken,
      })
        .then(res => {
          if (res.status == 1) {
            dispatch(updateUserData(res));
            if (newUser) {
              dispatch(updateAsOldUser());
            }
          } else {
            handleError(res);
          }
        })
        .catch(err => {
          console.error("googleLogin", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      // console.error("handleGoogleLogin", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        // alert('Cancel')
      } else if (error.code === statusCodes.IN_PROGRESS) {
        alert("Signin in progress");
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        alert("PLAY_SERVICES_NOT_AVAILABLE");
        // play services not available or outdated
      } else {
        // some other error happened
        console.error({errorHere: error});
      }
      setLoading(false);
    }
  };

  // Add this utility function
  const isFBAccessTokenValid = expirationTime => {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return expirationTime > currentTime;
  };

  const handleFBLogin = async () => {
    setLoading(true);
    try {
      // Attempt to get current token first
      let accessTokenData = await AccessToken.getCurrentAccessToken();
      console.log("accessTokenData", accessTokenData);
      // If no token or token expired, request new login
      if (!accessTokenData || !isFBAccessTokenValid(accessTokenData.expirationTime)) {
        LoginManager.logOut();
        const result = await LoginManager.logInWithPermissions(["email"]);
        console.log("result", result);
        if (result.isCancelled) {
          setLoading(false);
          return;
        }

        accessTokenData = await AccessToken.getCurrentAccessToken();
        console.log("accessTokenData", accessTokenData);
        if (!accessTokenData) {
          throw new Error("Failed to get access token after login");
        }
      }

      // Verify token is still valid
      if (!isFBAccessTokenValid(accessTokenData.expirationTime)) {
        throw new Error("Token expired immediately after retrieval");
      }

      const token = accessTokenData.accessToken;
      console.log("token", token);
      // Send to backend
      facebookLogin({
        access_token: token,
      })
        .then(res => {
          if (res.status == 1) {
            dispatch(updateUserData(res));
            if (newUser) {
              dispatch(updateAsOldUser());
            }
          } else {
            handleError(res);
          }
        })
        .catch(err => {
          console.error("facebookLogin API error", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error("Facebook login error", error);
      setLoading(false);
    }
  };

  const handleAppleAndroid = async () => {
    try {
      const state = uuid.v4();
      const rawNonce = uuid.v4();
      appleAuthAndroid.configure({
        clientId: APPLE_CLIENT_ID,
        redirectUri: APPLE_REDIRECT_URL,
        responseType: appleAuthAndroid.ResponseType.ALL,
        scope: appleAuthAndroid.Scope.ALL,
        nonce: rawNonce,
        state,
      });

      const response = await appleAuthAndroid.signIn();

      if (response) {
        const payload = {
          id_token: response.id_token ?? "",
          access_token: response.code ?? "",
        };

        appleLogin(payload)
          .then(res => {
            if (res.status == 1) {
              dispatch(updateUserData(res));
              if (newUser) {
                dispatch(updateAsOldUser());
              }
            } else {
              handleError(res);
            }
          })
          .catch(err => {
            console.error({err});
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } catch (error) {
      if (error && error?.code === appleAuth.Error.CANCELED) {
        throw new Error("The user canceled the signin request.");
      }
      throw error;
    }
  };

  const handleAppleiOS = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error("Apple Sign-In failed - no identify token returned");
      }

      const payload = {
        id_token: appleAuthRequestResponse.identityToken,
        access_token: appleAuthRequestResponse.authorizationCode,
      };

      appleLogin(payload)
        .then(res => {
          if (res.status == 1) {
            dispatch(updateUserData(res));
            if (newUser) {
              dispatch(updateAsOldUser());
            }
          } else {
            handleError(res);
          }
        })
        .catch(err => {
          console.error({err});
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      console.error({err});
    }
  };

  const handleAppleLogin = async () => {
    if (Platform.OS === "android") {
      handleAppleAndroid();
    } else {
      handleAppleiOS();
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT,
      scopes: ["email", "profile"],
    });
  }, []);

  return (
    <View>
      <DividerWithText containerStyle={styles.divider} label={"OR"} />
      <View style={styles.socialSUcontainer}>
        {Platform.OS === "android" && (
          <TouchableOpacity onPress={handleFBLogin}>
            <FacebookIcon style={styles.socialSIicon} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleGoogleLogin}>
          <GoogleIcon style={styles.socialSIicon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAppleLogin}>
          <AppleIcon style={styles.socialSIicon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SocialSignin;

const styles = StyleSheet.create({
  divider: {
    marginBottom: "10%",
    marginTop: 20,
  },
  socialSUcontainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  socialSIicon: {
    marginHorizontal: 10,
  },
});
