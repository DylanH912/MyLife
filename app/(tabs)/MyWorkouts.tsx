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
  const userTags = ["strength", "endurance", "weight loss", "calves", "bodyweight", "beginner", "glutes"];

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
    score?: number;
  };

  const MAX_SCORE = 16;

  const getColorForScore = (score: number, maxScore: number) => {
    const ratio = score / maxScore;

    // Red → Yellow → Green gradient
    const r = ratio < 0.5 ? 255 : Math.floor(255 - (ratio - 0.5) * 2 * 255);
    const g = ratio < 0.5 ? Math.floor(ratio * 2 * 255) : 255;

    return `rgb(${r}, ${g}, 0)`;
  };

  const sortedWorkouts = useMemo<Workout[]>(() => {
    if (!workouts) return [];

    return [...workouts]
      .map((w: Workout) => {
        let score = 0;

        // 1. Goals match (strong signal)
        if (w.goals.some((g) => userTags.includes(g))) score += 3;

        // 2. Muscles match
        if (w.muscles.some((m) => userTags.includes(m))) score += 4;

        // 3. Category match
        if (userTags.includes(w.category)) score += 2;

        // 4. Movement pattern match
        if (userTags.includes(w.movement_pattern)) score += 1;

        // 5. Programs match
        if (w.programs.some((p) => userTags.includes(p))) score += 1;

        // 6. Force type match
        if (userTags.includes(w.force_type)) score += 2;

        // 7. Mechanics match
        if (userTags.includes(w.mechanics)) score += 1;

        // 8. Equipment match
        if (w.equipment !== "bodyweight" && userTags.includes(w.equipment)) {
          score += 1;
        }

        // 9. Difficulty match
        if (userTags.includes(w.difficulty)) score += 1;

        return { ...w, score };
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [userTags]);

  const renderItem: ListRenderItem<Workout> = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: getColorForScore(item.score ?? 0, MAX_SCORE) },
      ]}
    >
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

      <Text style={{ marginTop: 6, fontWeight: "bold" }}>
        Compatibility Score: {item.score}
      </Text>
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
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
