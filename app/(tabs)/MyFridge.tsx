import { Text, View } from "react-native";
import React, {useEffect, useState} from "react";

type PantryItem = {
    food_name: string;
    quantity: number;
};

const MyFridge = () => {
    const [items, setItems] = useState<PantryItem[]>([]);

    useEffect(() => {
        fetch("http://localhost:8000/pantry") // May need to be changed
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(err => console.error("Error fetching pantry items:", err));
    }, []);

    return (
        <div>
            <h1>My Fridge</h1>
            <ul>
                {items.map((item, index) => (
                    <li key={index}>
                        <Text>{item.food_name} - {item.quantity}</Text>
                    </li>
                ))}
            </ul>
        </div>
    )
};

export default MyFridge;