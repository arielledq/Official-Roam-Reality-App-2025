import {Insets} from "react-native";

/**
 * Defines how far your touch can start away from the button
 * ---------------------------------------------------------
 * NOTE: The touch area never extends past the parent view bounds
 * and the Z-index of sibling views always takes precedence if a
 * touch hits two overlapping views.
 * @param size
 * @returns
 */
type getHitSlopFunction = (size: number) => Insets;
export const getHitSlop: getHitSlopFunction = size => {
  return {
    top: size,
    bottom: size,
    left: size,
    right: size,
  };
};
