import AsyncStorage from '@react-native-async-storage/async-storage'
import { EventEmitter } from 'events'

// Create a singleton EventEmitter instance
const storageEventEmitter = new EventEmitter()

/**
 * Utility function to save data in AsyncStorage and emit an event.
 */
export const setItemWithListener = async (key: string, value: any) => {
  try {
    // Emit event when the storage is updated
    storageEventEmitter.emit('storageChanged', { key, value })
  } catch (error) {
    console.error('Error saving data:', error)
  }
}

/**
 * Utility function to retrieve data from AsyncStorage.
 */
export const getItemWithListener = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key)
    return value
  } catch (error) {
    console.error('Error fetching data from AsyncStorage:', error)
  }
}

/**
 * Utility function to remove data from AsyncStorage and emit an event.
 */
export const removeItemWithListener = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key)

    // Emit event when the storage is updated
    storageEventEmitter.emit('storageChanged', { key, value: null })
  } catch (error) {
    console.error('Error removing data from AsyncStorage:', error)
  }
}

/**
 * Subscribe to storage changes.
 */
export const subscribeToStorageChanges = (
  callback: (callbackParam: { key: string; value: any }) => void
) => {
  storageEventEmitter.on('storageChanged', callback)
}

/**
 * Unsubscribe from storage changes.
 */
export const unsubscribeFromStorageChanges = (
  callback: (callbackParam: { key: string; value: any }) => void
) => {
  storageEventEmitter.off('storageChanged', callback)
}
