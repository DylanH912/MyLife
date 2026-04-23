import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from 'react-native-safe-area-context';

const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  AsyncStorage.getItem("userId").then(setUserId);
}, []);

const API_BASE_URL = "http://140.104.37.114:8000"; // CHANGE: Use your machine's local IP address and port where FastAPI is running

type PantryItem = {
    food_name: string;
    quantity: number;
};

const MyFridge = () => {
    const [items, setItems] = useState<PantryItem[]>([]);
    const endpoint = `/pantry/${userId || "1"}`;

    useEffect(() => {
        console.log("Fetching pantry from:", `${API_BASE_URL}${endpoint}`); //Debug
        fetch(`${API_BASE_URL}${endpoint}`)
            .then((res) => {
                console.log("Response status:", res.status); //Debug
                return res.json();
            })
            .then((data) => {
                console.log("Pantry data received:", data); //Debug
                setItems(data);
            })
            .catch((err) => {
                console.error("FETCH ERROR: ",err);
            });
    }, []);

    return (
    <SafeAreaView style={styles.container} edges={["top"]}>
        <Text style={styles.title}>My Pantry</Text>

        <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
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
