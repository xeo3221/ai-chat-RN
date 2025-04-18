import React from "react";
import { Link, Stack } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { Image, Pressable, Text } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Primary } from "@/utils/colors";

export default function RootChatLayout() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#000",
        },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerLargeTitle: true,
          title: " Chat Rooms", // left space for android
          headerLeft: () => (
            <Pressable onPress={() => router.push("/profile")}>
              <Image
                source={{ uri: user?.imageUrl }}
                style={{ width: 32, height: 32, borderRadius: 16 }}
              />
            </Pressable>
          ),
          headerRight: () => (
            <>
              <Pressable onPress={() => router.push("/new-room")}>
                <IconSymbol name="plus" />
              </Pressable>
            </>
          ),
        }}
      />
      <Stack.Screen
        name="new-room"
        options={{
          presentation: "modal",
          headerTitle: "New Chat Room",
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <IconSymbol name="chevron.left" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          presentation: "modal",
          headerTitle: "Profile",
        }}
      />
      <Stack.Screen
        name="ai-chat"
        options={{
          headerTitle: "",
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="[chat]"
        options={{
          headerTitle: "",
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="settings/[chat]"
        options={{
          presentation: "modal",
          headerTitle: "Room Settings",
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <IconSymbol name="chevron.left" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="settings/ai-chat"
        options={{
          presentation: "modal",
          headerTitle: "AI Chat Settings",
        }}
      />
    </Stack>
  );
}
