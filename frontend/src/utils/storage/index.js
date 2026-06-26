import { Platform } from 'react-native';

const impl = Platform.OS === 'web' ? require('./index.web') : require('./index.native');

export const storage = impl.storage;
export const bootstrapStorage = impl.bootstrapStorage;
