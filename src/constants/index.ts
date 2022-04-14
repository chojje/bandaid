import packageInfo from '../../package.json';
const version = packageInfo.version;
export { version as APP_VERSION };
export const SUPPORTED_VERSIONS = [
  "0.1.0",
  packageInfo.version,
]