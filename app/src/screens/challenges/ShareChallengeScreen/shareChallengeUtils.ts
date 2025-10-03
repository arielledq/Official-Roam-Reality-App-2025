import {Platform} from "react-native";
import {AR_MODES, CHALLENGES_TYPE, SSNN} from "../../../constants";
import {postArMemory, postGeoPinCheckIn} from "network";
import {handleError} from "util/helpers";
import moment from "moment";

export interface Sponsor {
  name: string;
  image?: string;
}
export interface ShareChallengeRouteParams {
  challengeObj: {
    points?: number;
    sponsored?: Sponsor;
    sponsor?: Sponsor;
    pin_challenge?: {points: number};
    geo_ar_star?: {
      geo_site?: {
        pin_challenge?: {points: number; sponsored?: Sponsor};
      };
    };
    remaining_stars?: number;
    created_at?: string;
    selectedMode?: {mode: string};
  };
  captureData: string;
  challengeType: string;
  isMemory: boolean;
  scan_picture?: any;
}

export const challengeData = (
  challengeObj?: any,
  scan_picture?: any,
  challengeType?: string,
  isMemory?: boolean,
  socialPointsCounter?: any
) => {
  let screenTitle = "";
  let challengePoints =
    challengeObj?.points || scan_picture?.points || challengeObj?.pin_challenge?.points;

  let sponsor = challengeObj?.sponsored || scan_picture?.sponsor;
  let challengeTitle = `Congrats on completing the ${sponsor?.name} AR Experience!`;
  let sponsorImage = sponsor?.image || "";
  let sponsorName = sponsor?.name || "";
  const startDate = isMemory
    ? moment(challengeObj?.created_at).format("MM-DD-YYYY")
    : moment().format("MM-DD-YYYY");
  let endChallengeButtonText = "End & Share to Roam Profile";

  const addSocialPoints = (basePoints: number) => {
    return (
      basePoints +
      socialPointsCounter.facebook +
      socialPointsCounter.instagram +
      socialPointsCounter.others
    );
  };

  console.log("challengeType", challengeType);
  console.log("challengeObj", challengeObj);

  switch (challengeType) {
    case CHALLENGES_TYPE.PHOTO_VIDEO:
      screenTitle = CHALLENGES_TYPE.PHOTO_VIDEO_TITLE;
      challengePoints = addSocialPoints(challengePoints);
      break;
    case CHALLENGES_TYPE.PIN_CHECK_IN:
      screenTitle = CHALLENGES_TYPE.PIN_CHECK_IN_TITLE;
      challengePoints = addSocialPoints(challengePoints);
      break;
    case AR_MODES.SCAN_MODE:
      sponsor = challengeObj?.sponsor;
      sponsorImage = sponsor?.image;
      sponsorName = sponsor?.name;
      challengeTitle = `Congrats on completing the ${sponsor?.name} AR Experience!`;
      challengePoints = addSocialPoints(challengePoints);
      break;
    case AR_MODES.GEO_TAG_MODE:
      sponsor = challengeObj?.sponsor;
      sponsorImage = sponsor?.image;
      sponsorName = sponsor?.name;
      challengeTitle = `Congrats on completing the ${sponsor?.name} AR Experience!`;
      challengePoints = addSocialPoints(challengePoints);
      break;
    case CHALLENGES_TYPE.STAR:
      screenTitle = CHALLENGES_TYPE.STAR_TITLE;

      sponsor = challengeObj?.geo_ar_star?.geo_site?.pin_challenge?.sponsored;
      sponsorImage = sponsor?.image;
      sponsorName = sponsor?.name;
      const remainingStars = challengeObj?.remaining_stars;
      if (remainingStars > 1) {
        challengePoints = 0;
        challengeTitle = "";
        endChallengeButtonText = "Continue to the next Star";
      } else {
        challengePoints = challengeObj?.geo_ar_star?.geo_site?.pin_challenge?.points;
      }
      break;

    default:
      challengePoints = addSocialPoints(
        challengeObj?.pin_challenge?.points || challengeObj?.points
      );
      break;
  }

  return {
    screenTitle: screenTitle || "",
    challengePoints: challengePoints || 0,
    sponsor: sponsor || {},
    challengeTitle: challengeTitle || "",
    sponsorImage: sponsorImage || "",
    sponsorName: sponsorName || "",
    startDate: startDate || "",
    endChallengeButtonText: endChallengeButtonText || "",
  };
};

const tryGrantSocialPoints = (
  selectedSSNN: string,
  grantSocialPointsHandler: (selectedSSNN: string) => {}
) => {
  try {
    grantSocialPointsHandler(selectedSSNN);
  } catch (error) {
    console.error("Error granting social points:", error);
  }
};

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
          tryGrantSocialPoints(selectedSSNN, grantSocialPointsHandler);
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
          tryGrantSocialPoints(selectedSSNN, grantSocialPointsHandler);
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
          tryGrantSocialPoints(selectedSSNN, grantSocialPointsHandler);
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
