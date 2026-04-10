import {
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "blue",

        tabBarItemStyle: {
          flex: 1,
          maxWidth: "19%",
        },

        tabBarStyle: {
          backgroundColor: "#f7f9fbff",
          borderTopWidth: 1,
          borderTopColor: "lightgrey", // ⚠️ fixed typo (no space)
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
          paddingHorizontal: 10,
          alignItems: "center",
        },

        tabBarLabelStyle: {
          fontSize: 9.5,
          fontWeight: "700",
        },

        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="MyProgress"
        options={{
          title: "MyProgress",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="query-stats" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="MyWorkouts"
        options={{
          title: "MyWorkouts",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dumbbell" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="MyFridge"
        options={{
          title: "MyFridge",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="fridge-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="MyMeals"
        options={{
          title: "MyMeals",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="bowl" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}