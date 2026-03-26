import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ListRenderItem,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import workouts from "../../assets/workouts.json";

export default function WorkoutListScreen() {
  // User preference tags
  const userTags = ["strength", "endurance", "weight loss", "calves"];

  type Workout = {
    id: string;
    name: string;
    muscles: string[];
    equipment: string;
    movement_pattern: string;
    difficulty: string;
    category: string;
    mechanics: string;
    force_type: string;
    programs: string[];
    goals: string[];
    met: number;
    video_demo_url: string;
  };

  const sortedWorkouts = useMemo<Workout[]>(() => {
    if (!workouts) return [];

    return [...workouts]
      .map((w: Workout) => {
        let score = 0;

        // Match goals
        if (w.goals.some((g) => userTags.includes(g))) score += 2;

        // Match muscles
        if (w.muscles.some((m) => userTags.includes(m))) score += 1;

        // Match category
        if (userTags.includes(w.category)) score += 1;

        if (w.difficulty === "beginner") score += 1;

        return { workout: w, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((ws) => ws.workout);
  }, [userTags]);

  const renderItem: ListRenderItem<Workout> = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>

      <Text>Category: {item.category}</Text>
      <Text>Difficulty: {item.difficulty}</Text>
      <Text>Muscles: {item.muscles.join(", ")}</Text>
      <Text>Programs: {item.programs.join(", ")}</Text>
      <Text>Equipment: {item.equipment}</Text>
      <Text>Movement: {item.movement_pattern}</Text>
      <Text>Mechanics: {item.mechanics}</Text>
      <Text>Force Type: {item.force_type}</Text>
      <Text>MET: {item.met}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
