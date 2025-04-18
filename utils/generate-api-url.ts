import Constants from "expo-constants";

export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

  // In development, use http://
  if (process.env.NODE_ENV === "development") {
    const localUrl =
      Constants.experienceUrl?.replace("exp://", "http://") ||
      "http://localhost:8081";
    return localUrl + path;
  }

  // In production (Expo Go), use exp:// format
  const experienceUrl = Constants.experienceUrl || "exp://localhost:8081";
  return experienceUrl + path;
};
