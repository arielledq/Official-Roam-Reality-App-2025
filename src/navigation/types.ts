import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Type for root navigation stacks
export type RootStackParamList = {
  Login: undefined;
  ChangePassword: undefined;
};

export type ScreenStackComponent<
  T extends Record<string, object | undefined>,
  RouteName extends keyof T,
> = React.FC<{
  navigation: NativeStackNavigationProp<T, RouteName>;
  route: RouteProp<T, RouteName>;
}>;
