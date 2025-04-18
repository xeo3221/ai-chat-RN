import { Client, Databases } from "react-native-appwrite";

if (
  !process.env.EXPO_PUBLIC_APPWRITE_APP_ID ||
  !process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID
) {
  throw new Error("appwrite key not found");
}

const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_APP_ID,
  platform: "com.xeo3221.aichat",
  db: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  col: {
    chatRooms: "67fd405400273d586264",
    messages: "67fd4045001a56faef3e",
    aiMessages: "680165ed001e35044631",
    aiChatRooms: "68017114003cba0118cd",
  },
};

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const db = new Databases(client);
export { db, appwriteConfig, client };
