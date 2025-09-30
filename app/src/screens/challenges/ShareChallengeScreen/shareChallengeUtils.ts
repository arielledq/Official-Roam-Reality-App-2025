import {Platform} from "react-native";
import {AR_MODES, CHALLENGES_TYPE, SSNN} from "../../../constants";
import {postArMemory, postGeoPinCheckIn} from "network";
import {handleError} from "util/helpers";

export const countSocialPoints = (
  selectedSSNN: string,
  grantSocialPointsHandler: (selectedSSNN: string) => {},
  setSocialPointsCounter: (counter: any) => void,
  setDisableBackButton: (disable: boolean) => void
) => {
  switch (selectedSSNN) {
    case SSNN.FACEBOOK:
      setSocialPointsCounter((currCounter: any) => {
        let updatedCounter = currCounter.facebook;
        if (currCounter.facebook === 0) {
          updatedCounter = 1;
          grantSocialPointsHandler(selectedSSNN);
          setDisableBackButton(true);
        } else {
          console.info(" not counting more points but allowing to share... ");
        }
        return {
          ...currCounter,
          facebook: updatedCounter,
        };
      });
      break;
    case SSNN.INSTAGRAM:
      setSocialPointsCounter((currCounter: any) => {
        let updatedCounter = currCounter.instagram;
        if (currCounter.instagram === 0) {
          updatedCounter = 1;
          grantSocialPointsHandler(selectedSSNN);
          setDisableBackButton(true);
        } else {
          console.info(" not counting more points but allowing to share... ");
        }
        return {
          ...currCounter,
          instagram: updatedCounter,
        };
      });
      break;
    case SSNN.OTHERS:
      setSocialPointsCounter((currCounter: any) => {
        let updatedCounter = currCounter.others;
        if (currCounter.others === 0) {
          updatedCounter = 1;
          grantSocialPointsHandler(selectedSSNN);
          setDisableBackButton(true);
        } else {
          console.info(" not counting more points but allowing to share... ");
        }
        return {
          ...currCounter,
          others: updatedCounter,
        };
      });
      break;

    default:
      break;
  }
};

export const shareToRoamProfile = async (
  endExperienceHandler?: () => void,
  capturedDataUri?: string,
  fileExt?: string,
  challengeType?: string,
  challengeObj?: any,
  setIsLoading?: (isLoading: boolean) => void,
  setHasSharedToRoamProfile?: (hasShared: boolean) => void,
  ARUserProfile?: () => void
) => {
  if (setIsLoading) setIsLoading(true);
  let filename = capturedDataUri?.split("/").pop();
  let shareFile = {
    uri: Platform.OS === "android" ? `file://${capturedDataUri}` : capturedDataUri,
    type: fileExt == "mp4" ? "video/mp4" : `image/{${fileExt}}`,
    name: filename,
  };

  const formData = new FormData();
  let res;

  try {
    switch (challengeType) {
      case CHALLENGES_TYPE.PHOTO_VIDEO:
        formData.append("challenges", challengeObj?.id);
        formData.append("memory_file", shareFile);
        let memoryType = "";
        if (challengeObj?.memory_type) {
          memoryType = challengeObj?.memory_type;
        } else {
          memoryType = fileExt == "mp4" ? "VIDEO" : "PHOTO";
        }
        formData.append("memory_type", memoryType);
        res = await postArMemory(formData);
        break;

      case CHALLENGES_TYPE.PIN_CHECK_IN:
        formData.append("geo_challenge", challengeObj?.id);
        formData.append("geo_site", challengeObj?.geo_site?.id);
        formData.append("memory_file", shareFile);

        res = await postGeoPinCheckIn(formData);
        break;

      case AR_MODES.SCAN_MODE:
        formData.append("scan_id", challengeObj?.scanChallenge?.id);
        const fixedShareFile = {...shareFile, uri: capturedDataUri};
        formData.append("memory_file", fixedShareFile);
        formData.append("memory_type", "SCAN_PHOTO");
        res = await postArMemory(formData);
        break;

      case AR_MODES.GEO_TAG_MODE:
        formData.append("geo_challenge", challengeObj?.pin_challenge?.id);
        formData.append("geo_site", challengeObj?.id);
        shareFile = {
          ...shareFile,
          uri: capturedDataUri,
        };
        formData.append("memory_file", shareFile);

        res = await postGeoPinCheckIn(formData);
        break;

      default:
        break;
    }

    if (res?.status === 1) {
      if (setHasSharedToRoamProfile) setHasSharedToRoamProfile(true);
      if (ARUserProfile) ARUserProfile();
      if (endExperienceHandler) {
        endExperienceHandler();
      }
    } else {
      console.error("Success - Error al compartir el desafío:", res);
      handleError("There was an error sharing your challenge");
    }
  } catch (error) {
    console.error("Catch - Error al compartir el desafío:", error);
    handleError("There was an error sharing your challenge");
  } finally {
    if (setIsLoading) setIsLoading(false);
  }
};
