import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

type PantryItem = {
    food_name: string; // or "name" depending on your backend
    quantity: number;
};

const MyFridge = () => {
    const [items, setItems] = useState<PantryItem[]>([]);

    useEffect(() => {
    fetch("http://YOUR_IP:8000/pantry") // ⚠️ important, see below
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