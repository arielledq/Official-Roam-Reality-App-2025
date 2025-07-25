/**
 * Utility functions for handling images, including base64 data URIs
 */

/**
 * Check if a string is a base64 data URI
 * @param str - The string to check
 * @returns true if the string is a base64 data URI, false otherwise
 */
export const isBase64DataUri = (str: string): boolean => {
  return str.startsWith('data:image/') && str.includes('base64,')
}

/**
 * Get the appropriate source object for FastImage component
 * Handles both regular URLs and base64 data URIs
 * @param imageUrl - The image URL or base64 data URI
 * @returns FastImage source object
 */
export const getImageSource = (imageUrl: string) => {
  if (isBase64DataUri(imageUrl)) {
    return { uri: imageUrl }
  } else {
    return { uri: imageUrl }
  }
}

/**
 * Get FastImage source with additional properties
 * @param imageUrl - The image URL or base64 data URI
 * @param additionalProps - Additional FastImage source properties
 * @returns FastImage source object with additional properties
 */
export const getImageSourceWithProps = (imageUrl: string, additionalProps: object = {}) => {
  const baseSource = getImageSource(imageUrl)
  return {
    ...baseSource,
    ...additionalProps
  }
} 