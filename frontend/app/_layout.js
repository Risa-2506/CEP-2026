import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { TTSProvider } from "../context/TTSContext";
import { SensorProvider } from "../context/SensorContext";

export default function Layout() {
  return (
    <AuthProvider>
      <TTSProvider>
        <SensorProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/signup" />
            <Stack.Screen name="home/remedies" options={{ headerShown: true, headerTitle: "Home Remedies" }} />
            <Stack.Screen name="home/doctors" options={{ headerShown: true, headerTitle: "Find Doctors" }} />
            <Stack.Screen name="home/sensors" options={{ headerShown: true, headerTitle: "Smart Sensors" }} />
            <Stack.Screen name="home/alzheimer-setup" />
            <Stack.Screen name="home/elderly-setup" />
            <Stack.Screen name="home/alzheimerDashboard" />
            <Stack.Screen name="home/caregiverDashboard" />
            <Stack.Screen name="home/guardianDashboard" />
          </Stack>
        </SensorProvider>
      </TTSProvider>
    </AuthProvider>
  );
}
