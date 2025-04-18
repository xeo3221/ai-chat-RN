import React, { useState, useEffect } from "react";
import {
  View,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/Text";
import { Primary, Red, RedSecondary, Secondary } from "@/utils/colors";
import { db, appwriteConfig } from "@/utils/appwrite";
import { IconSymbol } from "@/components/IconSymbol";
import { Query } from "react-native-appwrite";

export default function AIChatSettings() {
  const { chatId } = useLocalSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadChatDetails();
  }, []);

  const loadChatDetails = async () => {
    try {
      const chatRoom = await db.getDocument(
        appwriteConfig.db,
        appwriteConfig.col.aiChatRooms,
        chatId as string
      );
      setTitle(chatRoom.title);
      setDescription(chatRoom.description || "");
    } catch (error) {
      console.error("Error fetching chat room:", error);
      Alert.alert("Error", "Failed to load chat details. Please try again.");
    }
  };

  const handleDeleteChat = async () => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);

              // First, delete all messages in this chat
              const { documents: messages } = await db.listDocuments(
                appwriteConfig.db,
                appwriteConfig.col.aiMessages,
                [Query.equal("chatId", chatId as string)]
              );

              // Delete each message
              await Promise.all(
                messages.map((message) =>
                  db.deleteDocument(
                    appwriteConfig.db,
                    appwriteConfig.col.aiMessages,
                    message.$id
                  )
                )
              );

              // Then delete the chat room
              await db.deleteDocument(
                appwriteConfig.db,
                appwriteConfig.col.aiChatRooms,
                chatId as string
              );

              router.replace("/");
            } catch (error) {
              console.error("Error deleting chat:", error);
              Alert.alert("Error", "Failed to delete chat. Please try again.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await db.updateDocument(
        appwriteConfig.db,
        appwriteConfig.col.aiChatRooms,
        chatId as string,
        {
          title: title.trim(),
          description: description.trim(),
        }
      );
      router.back();
    } catch (error) {
      console.error("Error updating chat:", error);
      Alert.alert("Error", "Failed to update chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "AI Chat Settings",
          headerStyle: {
            backgroundColor: "#000",
          },
          headerTintColor: "#fff",
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={isLoading}>
              <Text style={{ color: Primary, fontSize: 16 }}>Save</Text>
            </Pressable>
          ),
        }}
      />
      <View style={{ flex: 1, padding: 16, backgroundColor: "#000" }}>
        <View style={{ gap: 16, marginBottom: 16 }}>
          <TextInput
            style={{
              backgroundColor: Secondary,
              color: "#fff",
              padding: 12,
              borderRadius: 8,
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
              height: 100,
              textAlignVertical: "top",
            }}
            placeholder="Description (optional)"
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={handleDeleteChat}
          disabled={isLoading}
          style={{
            flexDirection: "row",
            alignItems: "center",
            // justifyContent: "space-between",
            backgroundColor: RedSecondary,
            padding: 16,
            borderRadius: 10,
            marginBottom: 30,
            marginTop: 20,
            justifyContent: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <IconSymbol name="trash" color={Red} />
            <Text style={{ color: "red" }}>Delete Chat</Text>
          </View>
        </Pressable>
      </View>
    </>
  );
}
