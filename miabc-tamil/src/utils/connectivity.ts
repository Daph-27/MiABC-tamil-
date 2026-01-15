import NetInfo from '@react-native-community/netinfo';

/**
 * Check if device has internet connectivity
 * @returns Promise<boolean> - true if connected to internet
 */
export const checkConnectivity = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    // Handle null values - consider connected if isConnected is true
    return state.isConnected === true;
  } catch (error) {
    console.error('Connectivity check failed:', error);
    return false;
  }
};

/**
 * Subscribe to connectivity changes
 * @param callback - Function to call when connectivity changes
 * @returns Unsubscribe function
 */
export const subscribeToConnectivity = (
  callback: (isConnected: boolean) => void
) => {
  return NetInfo.addEventListener(state => {
    // Handle null values - consider connected if isConnected is true
    callback(state.isConnected === true);
  });
};

/**
 * Get current connectivity state
 */
export const getConnectivityState = async () => {
  return await NetInfo.fetch();
};
