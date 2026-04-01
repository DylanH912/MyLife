import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    FlatList,
    ActivityIndicator,
    StyleSheet,
} from "react-native";

type PantryItem = {
    food_name: string;
    quantity: number;
};

const MyFridge = () => {
    const [items, setItems] = useState<PantryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const res = await fetch("http://localhost:8000/pantry"); // change host if needed (device vs emulator)
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (mounted) setItems(data || []);
            } catch (err: any) {
                console.error("Error fetching pantry items:", err);
                if (mounted) setError(String(err));
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, []);

    const renderItem = ({ item }: { item: PantryItem }) => (
        <View style={styles.item}>
            <Text style={styles.name}>{item.food_name}</Text>
            <Text style={styles.qty}>Qty: {item.quantity}</Text>
        </View>
    );

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="small" />
            <Text style={styles.message}>Loading pantry…</Text>
        </View>
    );

    if (error) return (
        <View style={styles.center}>
            <Text style={styles.error}>Failed to load pantry: {error}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {items.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.message}>No items in your pantry.</Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(it, idx) => `${it.food_name}-${idx}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    list: {
        paddingBottom: 24,
    },
    item: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#F6F9FC",
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    name: {
        fontSize: 16,
        color: "#14213D",
    },
    qty: {
        fontSize: 14,
        color: "#5C677D",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    message: {
        marginTop: 8,
        color: "#5C677D",
    },
    error: {
        color: "#D9534F",
    },
});

export default MyFridge;