import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Type for root navigation stacks
export type RootStackParamList = {
  Login: undefined;
  ChangePassword: undefined;
  ForgotPassword: undefined;
  SignUp: undefined;
  EmailVerification: {email : string};
  VerificationSuccess: {ChangePassword : boolean};
  Profile: undefined;
  EditProfile: undefined;
  TermsAndConditions: undefined;
  Home: {openBottomSheet: boolean, deleteAccount: boolean};
  FPChangePassword: {token: string, uid: string};
  PrivacyPolicy: undefined;
  Menu: undefined;
  HomeScreen: undefined
};

export type ScreenStackComponent<
  T extends Record<string, object | undefined>,
  RouteName extends keyof T,
> = React.FC<{
  navigation: NativeStackNavigationProp<T, RouteName>;
  route: RouteProp<T, RouteName>;
}>;
