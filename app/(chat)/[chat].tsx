import React from "react";
import { Text } from "@/components/Text";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChatRoom, Message } from "@/utils/types";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { LegendList } from "@legendapp/list";
import { IconSymbol } from "@/components/IconSymbol";
import { Gray, Primary, Secondary } from "@/utils/colors";
import { useUser } from "@clerk/clerk-expo";
import { db, appwriteConfig, client } from "@/utils/appwrite";
import { ID, Query } from "react-native-appwrite";
import { useNavigation } from "@react-navigation/native";
import { formatMessageDate } from "@/utils/date";

export default function Chat() {
  const { chat: chatId } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter();
  const navigation = useNavigation();

  if (!chatId) {
    return <Text>Chat ID is required</Text>;
  }

  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const headerHeight = Platform.OS === "ios" ? useHeaderHeight() : 0;

  useEffect(() => {
    handleFirstLoad();
  }, []);

  useEffect(() => {
    const channel = `databases.${appwriteConfig.db}.collections.${appwriteConfig.col.chatRooms}.documents.${chatId}`;

    const unsubscribe = client.subscribe(channel, () => {
      try {
        console.log("chat room updated");
        getChatRoom();
        getMessages();
      } catch (error) {
        console.error("Error in realtime subscription:", error);
      }
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      // Just let the navigation happen naturally
    });

    return unsubscribe;
  }, [navigation]);

  const handleFirstLoad = async () => {
    try {
      await getMessages();
      await getChatRoom();
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (messageContent.trim() === "") return;

    const message = {
      content: messageContent,
      senderId: user?.id,
      senderName: user?.fullName,
      senderPhoto: user?.imageUrl,
      chatRoomId: chatId,
    };

    try {
      await db.createDocument(
        appwriteConfig.db,
        appwriteConfig.col.messages,
        ID.unique(),
        message
      );
      setMessageContent("");

      await db.updateDocument(
        appwriteConfig.db,
        appwriteConfig.col.chatRooms,
        chatId as string,
        { $updatedAt: new Date().toISOString() }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const getMessages = async () => {
    try {
      const { documents, total } = await db.listDocuments(
        appwriteConfig.db,
        appwriteConfig.col.messages,
        [
          Query.equal("chatRoomId", chatId as string),
          Query.limit(100),
          Query.orderAsc("$createdAt"),
        ]
      );
      setMessages(documents as Message[]);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const getChatRoom = async () => {
    try {
      const data = await db.getDocument(
        appwriteConfig.db,
        appwriteConfig.col.chatRooms,
        chatId as string
      );
      setChatRoom(data as ChatRoom);
    } catch (error) {
      console.error("Error fetching chat room:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: chatRoom?.title,
          headerRight: () => (
            <Link
              href={{
                pathname: "/settings/[chat]",
                params: { chat: chatId as string },
              }}
            >
              <IconSymbol name="gearshape" size={24} color={Primary} />
            </Link>
          ),
        }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={"padding"}
          keyboardVerticalOffset={headerHeight}
        >
          <LegendList
            data={messages}
            renderItem={({ item }) => {
              const isSender = item.senderId === user?.id;
              return (
                <View
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 6,
                    maxWidth: "80%",
                    alignSelf: isSender ? "flex-end" : "flex-start",
                  }}
                >
                  {!isSender && (
                    <Image
                      source={{ uri: item.senderPhoto }}
                      style={{ width: 30, height: 30, borderRadius: 15 }}
                    />
                  )}
                  <View
                    style={{
                      backgroundColor: isSender ? Primary : Secondary,
                      flex: 1,
                      padding: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontWeight: "500", marginBottom: 4 }}>
                      {item.senderName}
                    </Text>
                    <Text>{item.content}</Text>
                    <Text
                      style={{
                        fontSize: 10,
                        textAlign: "right",
                      }}
                    >
                      {formatMessageDate(item.$createdAt!)}
                    </Text>
                  </View>
                </View>
              );
            }}
            keyExtractor={(item) => item?.$id ?? "unknown"}
            contentContainerStyle={{ padding: 10 }}
            recycleItems={true}
            initialScrollIndex={messages.length - 1}
            alignItemsAtEnd
            maintainScrollAtEnd
            maintainScrollAtEndThreshold={0.5}
            maintainVisibleContentPosition
            estimatedItemSize={100}
          />

          <View
            style={{ marginTop: 16, flexDirection: "row", marginBottom: 10 }}
          >
            <TextInput
              style={{
                flex: 1,
                backgroundColor: "#1A1A1A",
                color: "#fff",
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#333",
                marginRight: 8,
              }}
              placeholder="Message..."
              value={messageContent}
              onChangeText={setMessageContent}
              multiline
              placeholderTextColor={Gray}
              editable={!isLoading}
            />
            <Pressable
              disabled={messageContent === "" || isLoading}
              style={{
                width: 50,
                height: 50,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={sendMessage}
            >
              {isLoading ? (
                <ActivityIndicator color={Primary} />
              ) : (
                <IconSymbol
                  name="paperplane"
                  color={messageContent === "" || isLoading ? Gray : Primary}
                />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
