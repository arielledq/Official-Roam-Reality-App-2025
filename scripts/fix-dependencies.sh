cd ios && rm -rf Pods Podfile.lock && wait && pod install && cd ..;
cp "./scripts/hash.hpp" "./ios/Pods/boost/boost/container_hash/hash.hpp" && wait;
cp "./scripts/RNDateTimePickerShadowView.m" "./node_modules/@react-native-community/datetimepicker/ios/RNDateTimePickerShadowView.m" && wait;
echo 'Updated broken dependencies files'
