import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const EXPO_PUBLIC_API_URL = "http://140.104.38.113:8000"; // CHANGE: Use your machine's local IP address and port where FastAPI is running

type PantryItem = {
    food_name: string;
    quantity: number;
};

const MyFridge = () => {
    const [items, setItems] = useState<PantryItem[]>([]);

    const endpoint = "/pantry";

    useEffect(() => {
    fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`)
        .then((res) => res.json())
        .then((data) => setItems(data))
        .catch((err) => console.error(err));
    }, []);

    return (
    <View style={styles.container}>
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
    </View>
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