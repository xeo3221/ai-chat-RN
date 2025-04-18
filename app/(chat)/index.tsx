import {
  View,
  FlatList,
  RefreshControl,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { Text } from "@/components/Text";
// import { chatRooms } from "@/utils/mock-data";
import { Link, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { IconSymbol } from "@/components/IconSymbol";
import { Gray, Primary, Red, Secondary } from "@/utils/colors";
import { type ChatRoom, type AIChatRoom } from "@/utils/types";
import { appwriteConfig, db } from "@/utils/appwrite";
import { Query } from "react-native-appwrite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "@clerk/clerk-expo";

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [aiChatRooms, setAiChatRooms] = useState<AIChatRoom[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAiChatsExpanded, setIsAiChatsExpanded] = useState(true);
  const [isChatRoomsExpanded, setIsChatRoomsExpanded] = useState(true);
  const { user } = useUser();

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchChatRooms();
        fetchAiChatRooms();
      }
    }, [user])
  );

  const fetchChatRooms = async () => {
    try {
      const { documents } = await db.listDocuments(
        appwriteConfig.db,
        appwriteConfig.col.chatRooms,
        [Query.limit(100)]
      );
      setChatRooms(documents as ChatRoom[]);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

  const fetchAiChatRooms = async () => {
    try {
      const { documents } = await db.listDocuments(
        appwriteConfig.db,
        appwriteConfig.col.aiChatRooms,
        [
          Query.equal("userId", user?.id || ""),
          Query.orderDesc("lastMessageAt"),
          Query.limit(100),
        ]
      );
      setAiChatRooms(documents as AIChatRoom[]);
    } catch (error) {
      console.error("Error fetching AI chat rooms:", error);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchChatRooms();
      await fetchAiChatRooms();
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View
          style={{
            marginTop: insets.top + (Platform.OS === "ios" ? 120 : 20),
            marginHorizontal: 20,
            marginVertical: 20,
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => router.push("/new-ai-chat")}
            style={{
              padding: 10,
              backgroundColor: Secondary,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#334155",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <IconSymbol name="plus" color={Primary} />
              <Text style={{ fontSize: 17 }}> Create New AI Chat</Text>
            </View>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <Pressable
            onPress={() => setIsAiChatsExpanded(!isAiChatsExpanded)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              justifyContent: "space-between",
              paddingRight: 6,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>AI Chats</Text>
            <IconSymbol
              name={isAiChatsExpanded ? "chevron.right" : "chevron.right"}
              color={Primary}
              style={{
                transform: [{ rotate: isAiChatsExpanded ? "90deg" : "0deg" }],
              }}
            />
          </Pressable>
        </View>

        {isAiChatsExpanded && (
          <FlatList
            data={aiChatRooms}
            keyExtractor={(item) => item.$id || ""}
            renderItem={({ item }) => (
              <Link
                href={{
                  pathname: "/ai-chat",
                  params: { chatId: item.$id },
                }}
              >
                <View
                  style={{
                    padding: 16,
                    width: "100%",
                    borderRadius: 10,
                    flexDirection: "row",
                    backgroundColor: Secondary,
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#1e293b",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconSymbol
                      name="cube"
                      color={Primary}
                      style={{ width: 24, height: 24 }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ItemTitleAndDescription
                      title={item.title}
                      description={item.description || ""}
                    />
                  </View>
                  <IconSymbol name="chevron.right" color={Gray} />
                </View>
              </Link>
            )}
            contentContainerStyle={{
              padding: 16,
              gap: 16,
            }}
            scrollEnabled={false}
          />
        )}

        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <Pressable
            onPress={() => setIsChatRoomsExpanded(!isChatRoomsExpanded)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              justifyContent: "space-between",
              paddingRight: 6,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>Chat Rooms</Text>
            <IconSymbol
              name={isChatRoomsExpanded ? "chevron.right" : "chevron.right"}
              color={Primary}
              style={{
                transform: [{ rotate: isChatRoomsExpanded ? "90deg" : "0deg" }],
              }}
            />
          </Pressable>
        </View>

        {isChatRoomsExpanded && (
          <FlatList
            data={chatRooms}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
              <Link
                href={{
                  pathname: "/[chat]",
                  params: { chat: item.$id },
                }}
              >
                <View
                  style={{
                    padding: 16,
                    width: "100%",
                    borderRadius: 10,
                    flexDirection: "row",
                    backgroundColor: Secondary,
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#1e293b",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconSymbol
                      name="person.2"
                      color={Primary}
                      style={{ width: 24, height: 24 }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ItemTitleAndDescription
                      title={item.title}
                      description={item.description}
                    />
                  </View>
                  <IconSymbol name="chevron.right" color={Gray} />
                </View>
              </Link>
            )}
            contentContainerStyle={{
              padding: 16,
              gap: 16,
              paddingBottom: 32,
            }}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </View>
  );
}

function ItemTitle({ title }: { title: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Text style={{ fontSize: 17 }}>{title}</Text>
    </View>
  );
}

function ItemTitleAndDescription({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={{ gap: 4 }}>
      <ItemTitle title={title} />
      <Text style={{ fontSize: 13, color: Gray }}>{description}</Text>
    </View>
  );
}
