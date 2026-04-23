import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../lib/api";

type PantryItem = {
    food_name: string;
    quantity: number;
};

const MyFridge = () => {
    const [items, setItems] = useState<PantryItem[]>([]);

    const endpoint = "/pantry";

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
