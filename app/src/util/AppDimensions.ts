import { Dimensions } from "react-native"
const { width, height } = Dimensions.get("window")

//Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350
const guidelineBaseHeight = 680

const scale = (size: number) => (width / guidelineBaseWidth) * size
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor

const tabbarHeight = verticalScale(80)

const screenHorizontalPadding = moderateScale(13)
const screenVerticalPadding = moderateScale(10)
export {
  tabbarHeight,
  scale,
  verticalScale,
  moderateScale,
  screenHorizontalPadding,
  screenVerticalPadding,
  width,
  height
}