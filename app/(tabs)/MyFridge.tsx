import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
const EXPO_PUBLIC_API_URL = "[140.104.38.113](http://140.104.38.113:8000)";
type PantryItem = {
    food_name: string;
    quantity: number;
};
const MyFridge = () => {
    const [items, setItems] = useState<PantryItem[]>([]);
    const endpoint = "/pantry";
    useEffect(() => {
        console.log("Fetching pantry from:", `${EXPO_PUBLIC_API_URL}${endpoint}`);
        fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`)
            .then((res) => {
                console.log("Response status:", res.status);
                return res.json();
            })
            .then((data) => {
                console.log("Pantry data received:", data);
                setItems(data);
            })
            .catch((err) => {
                console.error("FETCH ERROR: ", err);
            });
    }, []);
    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Pantry</Text>
            <FlatList
                data={items}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.item}>
                            {item.food_name} - {item.quantity}
                        </Text>
                    </View>
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
        backgroundColor: "#FFFFFF",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#1a1a1a",
    },
    itemContainer: {
        backgroundColor: "#F5F5F5",
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    item: {
        fontSize: 18,
        color: "#333333",
    },
});