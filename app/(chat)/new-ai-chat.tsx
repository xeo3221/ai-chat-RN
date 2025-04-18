import React, { useState } from "react";
import { View, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Stack, useRouter, useNavigation } from "expo-router";
import { Text } from "@/components/Text";
import { Primary, Secondary } from "@/utils/colors";
import { useUser } from "@clerk/clerk-expo";
import { db, appwriteConfig } from "@/utils/appwrite";
import { ID } from "react-native-appwrite";
import { type AIChatRoom } from "@/utils/types";

export default function NewAIChat() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createAiChatRoom = async () => {
    if (!user) return;

    try {
      const chatRoom = await db.createDocument(
        appwriteConfig.db,
        appwriteConfig.col.aiChatRooms,
        ID.unique(),
        {
          title: title.trim() || "New AI Chat",
          description: description.trim() || "Start a conversation with AI",
          userId: user.id,
          lastMessageAt: new Date().toISOString(),
        }
      );

      router.push({
        pathname: "/ai-chat",
        params: { chatId: chatRoom.$id },
      });
    } catch (error) {
      console.error("Error creating AI chat room:", error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "New AI Chat",
          headerStyle: {
            backgroundColor: "#000",
          },
          headerTintColor: "#fff",
        }}
      />
      <View style={{ flex: 1, padding: 16, backgroundColor: "#000" }}>
        <TextInput
          style={{
            backgroundColor: Secondary,
            color: "#fff",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
          placeholder="Chat Title"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={{
            backgroundColor: Secondary,
            color: "#fff",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            height: 100,
            textAlignVertical: "top",
          }}
          placeholder="Description (optional)"
          placeholderTextColor="#666"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Pressable
          onPress={createAiChatRoom}
          disabled={!title.trim() || isLoading}
          style={{
            backgroundColor: Primary,
            padding: 16,
            borderRadius: 8,
            alignItems: "center",
            opacity: !title.trim() || isLoading ? 0.5 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Create Chat
            </Text>
          )}
        </Pressable>
      </View>
    </>
  );
}
