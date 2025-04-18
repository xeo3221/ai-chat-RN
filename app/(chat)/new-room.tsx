import * as React from "react";
import { View, Switch, Button } from "react-native";
import { Text } from "@/components/Text";
import { useState } from "react";
import Input from "@/components/Input";
import { Stack, router } from "expo-router";
import { Secondary } from "@/utils/colors";
import { IconSymbol } from "@/components/IconSymbol";
import { appwriteConfig, db } from "@/utils/appwrite";
import { ID } from "react-native-appwrite";

export default function NewRoom() {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreateRoom() {
    try {
      setIsLoading(true);
      const room = await db.createDocument(
        appwriteConfig.db,
        appwriteConfig.col.chatRooms,
        ID.unique(),
        {
          title: roomName,
          description: roomDescription,
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      router.back();
    }
  }
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              title={isLoading ? "Creating..." : "Create"}
              onPress={handleCreateRoom}
              disabled={roomName.length === 0 || isLoading}
            />
          ),
        }}
      />
      <View style={{ padding: 16, gap: 16 }}>
        <Input
          placeholder="Room Name"
          value={roomName}
          onChangeText={setRoomName}
          maxLength={200}
        />
        <Input
          placeholder="Room Description"
          value={roomDescription}
          onChangeText={setRoomDescription}
          multiline
          maxLength={500}
          style={{ height: 100 }}
          textAlignVertical="top"
        />
      </View>
    </>
  );
}
