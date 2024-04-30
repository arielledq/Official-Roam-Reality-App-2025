import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetProps
} from "@gorhom/bottom-sheet"
import React, { FC, ReactNode, Ref, useMemo } from "react"
import useStyles from "./styles"

export interface AppBottomSheetProps extends BottomSheetProps {
  children: ReactNode;
  snaps: string[];
  bottomSheetRef: Ref<BottomSheet>;
}
export const renderBackdrop = (_props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
      {..._props}
      //   onPress={() => bottomSheetRef?.current?.close()}
      disappearsOnIndex={-1}
  />
)

const AppBottomSheet: FC<AppBottomSheetProps> = props => {
  const { children, snaps, bottomSheetRef, ...otherProps } = props
  const styles = useStyles()
  const snapPoints = useMemo(() => snaps, [snaps])

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetStyle}
      handleIndicatorStyle={styles.dragIndicatorStyle}
      {...otherProps}
    >
      {children}
    </BottomSheet>
  )
}

export default AppBottomSheet
