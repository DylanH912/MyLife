import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ListRenderItem,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context"; // TODO: Install this on other screens



import { workouts } from "../../assets/workouts.js";

export default function WorkoutListScreen() {
  //TODO: REPLACE THIS WITH REAL USER DATA
  const USER_GOAL = "strength";

  type Workout = {
    id: string;
    name: string;
    category: string;
    muscle: string;
    difficulty: string;
    goals: string[];
    image: string | null;
  };

  // Sort workouts based on goal relevance
  const sortedWorkouts = useMemo<Workout[]>(() => {
    if (!workouts) {
        console.error("Workouts data is undefined");
        return [];
    }

  return [...workouts].sort((a: Workout, b: Workout) => {
      const score  = (workout: Workout) => {
        let s = 0;

        if (workout.goals.includes(USER_GOAL)) s+= 1;
        if (workout.difficulty === "beginner") s+= 1; // Add future logic to adjust based on user's experience level

        return s;
      }

        return score(b) - score(a);
    });
  }, [USER_GOAL]);

  const renderItem: ListRenderItem<Workout> = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text>{item.category}</Text>
      <Text>{item.muscle}</Text>

      {/* Image here */}
      {/*
      <Image source={{ uri: item.image }} style={styles.image} /> */}
    </TouchableOpacity>
  );

  return (
  <SafeAreaView style={styles.container} edges={['top']}>
    <Text style={styles.header}>Workouts</Text>

    <FlatList
      data={sortedWorkouts}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
  </SafeAreaView>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#eee",
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});