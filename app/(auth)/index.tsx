import { Image, View } from "react-native";
import { Text } from "@/components/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { isClerkAPIResponseError, useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { type ClerkAPIError } from "@clerk/types";
import { IconSymbol } from "@/components/IconSymbol";
import { Primary } from "@/utils/colors";

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const { startSSOFlow } = useSSO();
  const [errors, setErrors] = useState<ClerkAPIError[]>([]);

  const handleSignInWithGoogle = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri(),
      });
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
        setErrors((prev) => [
          ...prev,
          {
            code: "sso_flow",
            message: "Failed to start SSO flow. Please try again.",
          },
        ]);
        console.error("Failed to start SSO flow. Please try again.");
        return;
      }
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        console.error("Clerk API error:", error);
        setErrors((prev) => [...prev, error.errors[0]]);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <View style={{ flex: 0.1 }} />

        <View style={{ gap: 20, alignItems: "center" }}>
          <IconSymbol name="cube" color={"#fff"} size={100} />
          <Text style={{ fontSize: 32, fontWeight: "bold" }}>AI Chat App</Text>
          <Text>The best chat with built-in AI assistant</Text>
          {errors.map((error) => (
            <Text
              key={error.code}
              style={{
                color: "red",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {error.message}
            </Text>
          ))}
        </View>

        <View style={{ flex: 0.7 }} />

        <Button
          onPress={handleSignInWithGoogle}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 30,
            marginTop: 20,
          }}
        >
          <Image
            source={require("@/assets/images/google-icon.png")}
            style={{ width: 20, height: 20 }}
          />
          <Text style={{ color: "black", fontWeight: "500" }}>
            Sign in with Google
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
