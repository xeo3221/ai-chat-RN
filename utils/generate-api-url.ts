import Constants from "expo-constants";

export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

  // In development, use http://
  if (__DEV__) {
    const localUrl =
      Constants.experienceUrl?.replace("exp://", "http://") ||
      "http://localhost:8081";
    console.log("Development URL:", localUrl + path);
    return localUrl + path;
  }

  // In production (including Expo Go), use Render.com URL
  return `https://ai-chat-rn.onrender.com${path}`;
};
