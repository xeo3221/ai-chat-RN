import Constants from "expo-constants";

export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

  // In development, use http://
  if (process.env.NODE_ENV === "development") {
    const localUrl =
      Constants.experienceUrl?.replace("exp://", "http://") ||
      "http://localhost:8081";
    console.log("Development URL:", localUrl + path);
    return localUrl + path;
  }

  // In Expo Go (production)
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (projectId) {
    // Get the experience URL without the protocol
    const expUrl = Constants.experienceUrl?.split("//")[1] || "";
    if (expUrl.includes("exp.host")) {
      // If it's running on Expo's servers
      return `https://exp.host/@xeo3221/ai-chat${path}`;
    }
  }

  // Fallback
  console.log("Fallback URL:", "http://localhost:8081" + path);
  return "http://localhost:8081" + path;
};
