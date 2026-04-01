import React, { useMemo, useState } from "react";
import WorkoutStartModal from "../../components/WorkoutStartModal";
import {
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ListRenderItem,
  View,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import workouts from "../../assets/workouts.json";

// I moved the Workout type outside the component because it doesn't need to be
// recreated every render. This is a small cleanup that also makes the file easier to read.
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


const MAX_SCORE = 14;

export default function WorkoutListScreen() {
  // Make Modal visible when user presses "Adjust Goals" button, and hide it when they complete the flow or press outside.
  const [showModal, setShowModal] = useState(false);

  // These store what the user picked in the modal.
  const [selectedPlanTags, setSelectedPlanTags] = useState<string[] | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  //Choose a softer card color based on workout score.
  const getColorForScore = (score: number, maxScore: number) => {
    const ratio = Math.min(score / maxScore, 1);

    if (ratio < 0.33) return "#FFE2E2";
    if (ratio < 0.66) return "#FFF1CC";
    return "#DDF6E8";
  };

  // This is the stronger accent color used for the score pill.
  const getAccentColorForScore = (score: number, maxScore: number) => {
    const ratio = Math.min(score / maxScore, 1);

    if (ratio < 0.33) return "#D9534F";
    if (ratio < 0.66) return "#D99A00";
    return "#1F8A5B";
  };

  // User Tags 
  const userTags = [
    ...(selectedPlanTags ?? []),
    selectedMuscle?.toLowerCase(),
  ].filter(Boolean).map((t) => String(t).toLowerCase()) as string[];

  //recalculate the user's selected tags change.
  const sortedWorkouts = useMemo<Workout[]>(() => {
    return [...(workouts as Workout[])]
      .map((w) => {
        // Simple scoring: integer points per match, capped at MAX_SCORE
        let score = 0;

        // muscles: 3 points per matching muscle
        const muscleMatches = (w.muscles || []).filter((m) =>
          userTags.includes(String(m).toLowerCase())
        ).length;
        score += muscleMatches * 3;

        // goals: 2 points per matching goal
        const goalMatches = (w.goals || []).filter((g) =>
          userTags.includes(String(g).toLowerCase())
        ).length;
        score += goalMatches * 2;

        // category and movement_pattern: 2 and 1 points respectively
        if (userTags.includes(String(w.category).toLowerCase())) score += 2;
        if (userTags.includes(String(w.movement_pattern).toLowerCase())) score += 1;

        // programs: 1 point per match
        const programMatches = (w.programs || []).filter((p) =>
          userTags.includes(String(p).toLowerCase())
        ).length;
        score += programMatches * 1;

        // single-field matches: force_type, mechanics, difficulty -> +1 each
        if (userTags.includes(String(w.force_type).toLowerCase())) score += 1;
        if (userTags.includes(String(w.mechanics).toLowerCase())) score += 1;
        if (userTags.includes(String(w.difficulty).toLowerCase())) score += 1;

        // equipment: treat bodyweight specially
        const equip = String(w.equipment).toLowerCase();
        if (equip === "bodyweight") {
          if (userTags.includes("bodyweight")) score += 1;
        } else if (userTags.includes(equip)) score += 1;

        // Cap to MAX_SCORE
        const capped = Math.min(score, MAX_SCORE);

        return { ...w, score: capped };
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [userTags]);

  const topWorkout = sortedWorkouts[0];

  // This helper builds a little pill for the selected goals section.
  // I made it a function because it keeps the JSX cleaner lower down.
  const renderChip = (label: string) => (
    <View key={label} style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );

  // This is where we would have the user press a workout to add to their day or see details.
  const showWorkoutDetails = (item: Workout) => {
    Alert.alert(
      item.name,
      [
        `Category: ${item.category}`,
        `Difficulty: ${item.difficulty}`,
        `Muscles: ${item.muscles.join(", ")}`,
        `Programs: ${item.programs.join(", ")}`,
        `Goals: ${item.goals.join(", ")}`,
        `Equipment: ${item.equipment}`,
        `Movement Pattern: ${item.movement_pattern}`,
        `Mechanics: ${item.mechanics}`,
        `Force Type: ${item.force_type}`,
        `MET: ${item.met}`,
        `Compatibility Score: ${item.score ?? 0}/${MAX_SCORE}`,
      ].join("\n")
    );
  };

  const renderItem: ListRenderItem<Workout> = ({ item, index }) => {
    const score = item.score ?? 0;
    const accentColor = getAccentColorForScore(score, MAX_SCORE);

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => showWorkoutDetails(item)}
        style={[
          styles.card,
          { backgroundColor: getColorForScore(score, MAX_SCORE) },
        ]}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>#{index + 1}</Text>
          </View>

          <View style={[styles.scorePill, { backgroundColor: accentColor }]}>
            <Text style={styles.scorePillText}>{score}/{MAX_SCORE}</Text>
          </View>
        </View>

        <Text style={styles.title}>{item.name}</Text>

        <Text style={styles.subtitle}>
          {item.category} • {item.difficulty} • MET {item.met}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Targets</Text>
          <Text style={styles.sectionText}>{item.muscles.join(", ")}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Equipment</Text>
            <Text style={styles.metaValue}>{item.equipment}</Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Movement</Text>
            <Text style={styles.metaValue}>{item.movement_pattern}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Mechanics</Text>
            <Text style={styles.metaValue}>{item.mechanics}</Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Force Type</Text>
            <Text style={styles.metaValue}>{item.force_type}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Programs</Text>
          <Text style={styles.sectionText}>{item.programs.join(", ")}</Text>
        </View>

        <Text style={styles.tapHint}>Tap for full details</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <WorkoutStartModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onComplete={(planTags, muscle) => {
          setSelectedPlanTags(planTags);
          setSelectedMuscle(muscle);
          setShowModal(false);
        }}
      />

      <FlatList
        data={sortedWorkouts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Workout Planner</Text>
            <Text style={styles.header}>Find the best-fit workout for today</Text>
            <Text style={styles.description}>
              Your workouts are ranked by compatibility with your current goals.
            </Text>

            <Pressable
              style={styles.adjustButton}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.adjustButtonText}>Adjust Goals</Text>
            </Pressable>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Current focus</Text>

              <View style={styles.chipWrap}>
                {selectedPlanTags?.length
                  ? selectedPlanTags.map(renderChip)
                  : renderChip("No plan selected")}

                {selectedMuscle
                  ? renderChip(selectedMuscle)
                  : renderChip("No muscle selected")}
              </View>

              {topWorkout ? (
                <Text style={styles.summaryHint}>
                  Top match: <Text style={styles.summaryHintBold}>{topWorkout.name}</Text>
                </Text>
              ) : null}
            </View>

            <Text style={styles.resultsLabel}>Recommended workouts</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  hero: {
    paddingTop: 8,
    paddingBottom: 18,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4E6FAE",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  header: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: "#14213D",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5C677D",
    marginTop: 10,
    marginBottom: 18,
  },
  adjustButton: {
    backgroundColor: "#14213D",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignSelf: "flex-start",
    shadowColor: "#14213D",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  adjustButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  summaryCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#14213D",
    marginBottom: 12,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#EEF3FB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  chipText: {
    color: "#355070",
    fontSize: 13,
    fontWeight: "600",
  },
  summaryHint: {
    marginTop: 14,
    fontSize: 14,
    color: "#5C677D",
  },
  summaryHintBold: {
    color: "#14213D",
    fontWeight: "700",
  },
  resultsLabel: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "800",
    color: "#14213D",
  },
  card: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(20,33,61,0.06)",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  rankBadge: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#14213D",
  },
  scorePill: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  scorePillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#14213D",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#4F5D75",
    marginBottom: 14,
  },
  section: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#355070",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#24324A",
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  metaBlock: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    padding: 12,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#5C677D",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#14213D",
  },
  tapHint: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: "700",
    color: "#355070",
  },
});
