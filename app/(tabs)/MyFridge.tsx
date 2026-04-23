import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE_URL = "http://140.104.36.1:8000"; // Use your machine's local IP and port

type PantryItem = {
  food_name: string;
  quantity: number;
};

const MyFridge = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<PantryItem[]>([]);

  // Load userId from AsyncStorage once on mount
  useEffect(() => {
    AsyncStorage.getItem("userId").then(setUserId);
  }, []);

  const endpoint = `/pantry/${userId || "1"}`;

  // Fetch pantry data when endpoint changes (i.e., when userId loads)
  useEffect(() => {
    // Skip fetch if we don’t have an endpoint yet
    if (!endpoint) return;

    console.log("Fetching pantry from:", `${API_BASE_URL}${endpoint}`);
    fetch(`${API_BASE_URL}${endpoint}`)
      .then((res) => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Pantry data received:", data);
        setItems(data);
      })
      .catch((err) => {
        console.error("FETCH ERROR:", err);
      });
  }, [endpoint]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>My Pantry</Text>
      <FlatList
        data={items}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.food_name} - {item.quantity}
          </Text>
        )}
      />
    </SafeAreaView>
  );
};

export default MyFridge;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  item: {
    fontSize: 18,
    marginBottom: 5,
  },
});