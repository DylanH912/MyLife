import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EXPO_PUBLIC_API_URL = "http://140.104.38.113:8000";

type PantryItem = {
    food_name: string;
    quantity: number;
};

const MyFridge = () => {
    const [items, setItems] = useState<PantryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);

    const fetchPantry = () => {
    setLoading(true);
    fetch(`${EXPO_PUBLIC_API_URL}/pantry`)
        .then((res) => res.json())
        .then((data) => {
            setItems(data);
            setLoading(false);
        })
        .catch((err) => {
            console.error("FETCH ERROR:", err);
            setLoading(false);
    });
    };

    useEffect(() => {
    fetchPantry();
    }, []);

    const removeItem = (food_name: string) => {
    Alert.alert("Remove Item", `Remove "${food_name}" from your pantry?`, [
        { text: "Cancel", style: "cancel" },
        {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
            setRemoving(food_name);
            const amount = 1
            try {
            const response = await fetch(
                `${EXPO_PUBLIC_API_URL}/pantry/${encodeURIComponent(food_name)}/${encodeURIComponent(amount)}`,
                { method: "DELETE" }
            );
            if (response.ok) {
                setItems((prev) =>
                    prev
                        .map((item) =>
                            item.food_name === food_name
                                ? { ...item, quantity: item.quantity - 1 }
                                : item
                        )
    .filter((item) => item.quantity > 0)
);
            } else {
                Alert.alert("Error", "Could not remove item.");
            }
            } catch (err) {
            Alert.alert("Network Error", "Check server connection.");
            } finally {
            setRemoving(null);
            }
        },
        },
    ]);
    };

    return (
    <SafeAreaView style={styles.safe}>
        <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
            <View>
                <Text style={styles.title}>My Pantry</Text>
                <Text style={styles.subtitle}>
                    {items.length} item{items.length !== 1 ? "s" : ""}
                </Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchPantry} disabled={loading}>
                <Ionicons name="refresh" size={20} color={loading ? "#555" : "#fff"} />
            </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="rgba(255,255,255,0.7)" />
            </View>
        ) : items.length === 0 ? (
            <View style={styles.centered}>
                <Ionicons name="basket-outline" size={52} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>Your pantry is empty</Text>
                <Text style={styles.emptyHint}>Scan food with the camera to add items</Text>
            </View>
        ) : (
            <FlatList
            data={items}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
                <View style={styles.card}>
                {/* Icon swatch */}
                <View style={styles.iconSwatch}>
                    <Ionicons name="nutrition-outline" size={18} color="rgba(255,255,255,0.6)" />
                </View>

                {/* Name */}
                <Text style={styles.foodName} numberOfLines={1}>
                    {item.food_name}
                </Text>

                {/* Quantity badge */}
                <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>×{item.quantity}</Text>
                </View>

                {/* Remove button */}
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item.food_name)}
                    disabled={removing === item.food_name}
                >
                    {removing === item.food_name ? (
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
                    ) : (
                    <Ionicons name="trash-outline" size={16} color="rgba(255,80,80,0.85)" />
                    )}
                </TouchableOpacity>
                </View>
            )}
            />
        )}
        </View>
    </SafeAreaView>
);
};

export default MyFridge;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#111",
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },

  // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        color: "rgba(255,255,255,0.4)",
        marginTop: 2,
        fontWeight: "500",
    },
    refreshButton: {
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 30,
    },

    // List
    listContent: {
        paddingBottom: 40,
        gap: 8,
    },

    // Card
    card: {
        backgroundColor: "rgba(255,255,255,0.07)",
        borderRadius: 14,
        paddingVertical: 13,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    iconSwatch: {
        width: 36,
        height: 36,
        borderRadius: 9,
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },
    foodName: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
        letterSpacing: -0.1,
    },
    quantityBadge: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    quantityText: {
        fontSize: 12,
        fontWeight: "700",
        color: "rgba(255,255,255,0.7)",
    },
    removeButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "rgba(255,60,60,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },

  // States
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingBottom: 60,
    },
    emptyText: {
        fontSize: 17,
        fontWeight: "700",
        color: "rgba(255,255,255,0.5)",
        marginTop: 8,
    },
    emptyHint: {
        fontSize: 13,
        color: "rgba(255,255,255,0.25)",
        textAlign: "center",
        paddingHorizontal: 40,
    },
});