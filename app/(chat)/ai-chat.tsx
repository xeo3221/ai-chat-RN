import React, { useState, useEffect } from "react";
import { Text } from "@/components/Text";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { LegendList } from "@legendapp/list";
import { IconSymbol } from "@/components/IconSymbol";
import { Gray, Primary, Secondary } from "@/utils/colors";
import { generateAPIUrl } from "@/utils/generate-api-url";
import { fetch as expoFetch } from "expo/fetch";
import { useUser } from "@clerk/clerk-expo";
import { db, appwriteConfig, client } from "@/utils/appwrite";
import { ID, Query } from "react-native-appwrite";
import { type Message } from "@/utils/types";
import { useNavigation } from "@react-navigation/native";
import { formatMessageDate } from "@/utils/date";

interface AIMessage {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  $collectionId?: string;
  $databaseId?: string;
  $permissions?: any[];
  content: string;
  senderId: string;
  senderName: string;
  role: "user" | "assistant";
  chatId: string;
}

interface AIChatRoom {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  $collectionId?: string;
  $databaseId?: string;
  $permissions?: any[];
  title: string;
  description?: string;
  lastMessageAt?: string;
}

export default function Chat() {
  const { chatId } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [chatRoom, setChatRoom] = useState<AIChatRoom | null>(null);
  const headerHeight = Platform.OS === "ios" ? useHeaderHeight() : 0;

  useEffect(() => {
    if (user) {
      handleFirstLoad();
    }
  }, [user, chatId]);

  useEffect(() => {
    const channel = `databases.${appwriteConfig.db}.collections.${appwriteConfig.col.aiMessages}.documents`;

    const unsubscribe = client.subscribe(channel, () => {
      console.log("AI messages updated");
      loadMessages();
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    const channel = `databases.${appwriteConfig.db}.collections.${appwriteConfig.col.aiChatRooms}.documents.${chatId}`;

    const unsubscribe = client.subscribe(channel, () => {
      console.log("AI chat room updated");
      getChatRoom();
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {});

    return unsubscribe;
  }, [navigation]);

  const handleFirstLoad = async () => {
    try {
      await getMessages();
      await getChatRoom();
    } catch (error) {
      console.error("Error in handleFirstLoad:", error);
      setError(
        error instanceof Error ? error : new Error("Failed to initialize chat")
      );
    }
  };

  const getChatRoom = async () => {
    try {
      const data = await db.getDocument(
        appwriteConfig.db,
        appwriteConfig.col.aiChatRooms,
        chatId as string
      );
      setChatRoom(data as AIChatRoom);
    } catch (error) {
      console.error("Error fetching chat room:", error);
    }
  };

  const getMessages = async () => {
    try {
      const { documents } = await db.listDocuments(
        appwriteConfig.db,
        appwriteConfig.col.aiMessages,
        [Query.equal("chatId", chatId as string), Query.orderAsc("$createdAt")]
      );
      setMessages(documents as AIMessage[]);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const { documents } = await db.listDocuments(
        appwriteConfig.db,
        appwriteConfig.col.aiMessages,
        [
          Query.equal("senderId", user?.id || ""),
          Query.equal("chatId", chatId as string),
          Query.orderAsc("$createdAt"),
          Query.limit(100),
        ]
      );
      setMessages(documents as AIMessage[]);
    } catch (error) {
      console.error("Error loading messages:", error);
      setError(
        error instanceof Error ? error : new Error("Failed to load messages")
      );
    }
  };

  const sendMessage = async () => {
    if (!messageContent.trim() || isLoading || !user) return;

    const userMessage: AIMessage = {
      role: "user",
      content: messageContent,
      $createdAt: new Date().toISOString(),
      senderName: user.fullName || "User",
      senderId: user.id,
      chatId: chatId as string,
    };

    try {
      await db.updateDocument(
        appwriteConfig.db,
        appwriteConfig.col.aiChatRooms,
        chatId as string,
        {
          lastMessageAt: new Date().toISOString(),
        }
      );

      const savedUserMessage = await db.createDocument(
        appwriteConfig.db,
        appwriteConfig.col.aiMessages,
        ID.unique(),
        userMessage
      );

      setMessages((prev) => [...prev, savedUserMessage as AIMessage]);
      setMessageContent("");
      setIsLoading(true);

      const response = await expoFetch(generateAPIUrl("/api/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: AIMessage = {
        role: "assistant",
        content: data.text,
        $createdAt: new Date().toISOString(),
        senderName: "AI Assistant 🤖",
        senderId: user.id,
        chatId: chatId as string,
      };

      const savedAssistantMessage = await db.createDocument(
        appwriteConfig.db,
        appwriteConfig.col.aiMessages,
        ID.unique(),
        assistantMessage
      );

      setMessages((prev) => [...prev, savedAssistantMessage as AIMessage]);
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
          {error.message}
        </Text>
        <Pressable
          onPress={() => setError(null)}
          style={{
            padding: 10,
            backgroundColor: Primary,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white" }}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: chatRoom?.title || "AI Assistant",
          headerStyle: {
            backgroundColor: "#000",
          },
          headerTintColor: "#fff",
          headerRight: () => (
            <Link
              href={{
                pathname: "/settings/ai-chat",
                params: { chatId: chatId as string },
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
        >
          <LegendList
            data={messages}
            renderItem={({ item }) => {
              const isUser = item.role === "user";
              return (
                <View
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 6,
                    maxWidth: "80%",
                    alignSelf: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: isUser ? Primary : Secondary,
                      flex: 1,
                      padding: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontWeight: "500", marginBottom: 4 }}>
                      {item.senderName}
                    </Text>
                    <Text>{item.content}</Text>
                    {item.$createdAt && (
                      <Text
                        style={{
                          fontSize: 10,
                          textAlign: "right",
                        }}
                      >
                        {formatMessageDate(item.$createdAt)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
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
                marginLeft: 8,
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
