import React, { useEffect } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import DividerWithText from "../dividerwithtextcomponent";
import { AppleIcon, FacebookIcon, GoogleIcon } from "../../assets/svg";
import {
  AccessToken,
  AuthenticationToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager,
} from "react-native-fbsdk-next";
import "react-native-get-random-values";
import uuid from "react-native-uuid";
import appleAuth, { appleAuthAndroid } from "@invertase/react-native-apple-authentication";
import { APPLE_CLIENT_ID, APPLE_REDIRECT_URL } from "../../network/config";
import { googleLogin, appleLogin } from "../../network";
import { useDispatch, useSelector } from "react-redux";
import { updateUserData } from "../../redux/Login";
import { updateAsOldUser } from "../../redux/Persist";
import { handleError, showMessage } from "../../util/helpers";
import Config from "config";

const SocialSignin = ({ setLoading }) => {
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
        console.error({ errorHere: error });
      }
      setLoading(false);
    }
  };

  const _fblogin = () => {
    LoginManager.logOut();
    return LoginManager.logInWithPermissions(["email", "public_profile"]).then(
      res => {
        if (res.declinedPermissions && res.declinedPermissions.includes("email")) {
          showMessage("Email is required", "error");
        }
        if (res.isCancelled) {
          console.error("err");
        } else {
          const req = new GraphRequest("/me?fields=email,name,picture", null, (err, result) => {
            if (err) {
              console.error("err", err);
              return;
            } else {
              AccessToken.getCurrentAccessToken().then(data => {
                // --
              });
            }
          });
          new GraphRequestManager().addRequest(req).start();
        }
      },
      err => {
        console.error("error in login", err);
      }
    );
  };

  const handleFBLogin = async () => {
    try {
      await _fblogin();
    } catch (err) {
      console.error("err in catch", err);
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
            console.error({ err });
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
          console.error({ err });
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      console.error({ err });
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
        <TouchableOpacity onPress={handleFBLogin}>
          <FacebookIcon style={styles.socialSIicon} />
        </TouchableOpacity>
        {/* TODO: Re enable after backend API connection - 2025-02-21 */}
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
