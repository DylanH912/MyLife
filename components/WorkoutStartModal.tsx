import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList, Pressable } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void; // Called when the user cancels or completes the flow
  onComplete: (planTags: string[], muscle: string) => void; // Called when the user completes the flow with their selections
};

type WorkoutPlan = { label: string; value: string[]; subtitle?: string };
type MuscleOption = { label: string; value: string };
type Step = "plans" | "muscles";


const PLAN_TAGS: Record<string, string[]> = {
  "Full Body": ["full body", "core", "glutes", "hamstrings", "quads", "shoulders"],
  "Upper Body": ["chest", "back", "shoulders", "arms", "triceps", "biceps"],
  "Lower Body": ["quads", "glutes", "hamstrings", "calves"],
  "Push Day": ["chest", "shoulders", "triceps"],
  "Pull Day": ["back", "rear delts", "biceps"],
  "Leg Day": ["quads", "glutes", "hamstrings", "calves"],
};

const workoutPlans: WorkoutPlan[] = Object.keys(PLAN_TAGS).map((label) => ({
  label,
  value: PLAN_TAGS[label],
  subtitle: PLAN_TAGS[label].slice(0, 4).join(", "),
}));

const muscleOptions: MuscleOption[] = [ 
  { label: "Chest", value: "chest" },
  { label: "Back", value: "back" },
  { label: "Shoulders", value: "shoulders" },
  { label: "Arms", value: "arms" },
  { label: "Glutes", value: "glutes" },
  { label: "Quads", value: "quads" },
  { label: "Hamstrings", value: "hamstrings" },
  { label: "Calves", value: "calves" },
  { label: "Core", value: "core" },
];

const allMuscleOptions = muscleOptions;

export default function WorkoutStartModal({
  visible,
  onClose,
  onComplete,
}: Props) {
  const [step, setStep] = useState<Step>("plans");
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    if (visible) {
      setStep("plans");
      setSelectedPlan(null);
    }
  }, [visible]);

  const filteredMuscleOptions = useMemo(() => {
    if (!selectedPlan) return allMuscleOptions;

    return allMuscleOptions.filter((muscle) => {
      if (selectedPlan.label === "Upper Body") {
        return ["chest", "back", "shoulders", "arms"].includes(muscle.value);
      }

      if (selectedPlan.label === "Lower Body" || selectedPlan.label === "Leg Day") {
        return ["glutes", "quads", "hamstrings", "calves"].includes(muscle.value);
      }

      if (selectedPlan.label === "Push Day") {
        return ["chest", "shoulders", "arms"].includes(muscle.value);
      }

      if (selectedPlan.label === "Pull Day") {
        return ["back", "shoulders", "arms"].includes(muscle.value);
      }

      return selectedPlan.value.includes(muscle.value) || muscle.value === "core";
    });
  }, [selectedPlan]);

  const handlePlanSelect = (plan: WorkoutPlan) => {
    setSelectedPlan(plan);
    setStep("muscles");
  };

  const handleMuscleSelect = (muscle: MuscleOption) => {
    if (selectedPlan) {
      onComplete(selectedPlan.value, muscle.value);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {step === "plans" && (
            <>
              <View style={styles.headerRow}>
                <View style={styles.headerTextWrap}>
                  <Text style={styles.eyebrow}>Workout Planner</Text>
                  <Text style={styles.title}>What type of workout are you looking for?</Text>
                  <Text style={styles.description}>
                    Choose the workout structure you want for today.
                  </Text>
                </View>

                <Pressable onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </View>

              <FlatList
                data={workoutPlans}
                keyExtractor={(item) => item.label}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.largeCard}
                    onPress={() => handlePlanSelect(item)}
                  >
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardTitle}>{item.label}</Text>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Plan</Text>
                      </View>
                    </View>

                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {step === "muscles" && (
            <>
              <View style={styles.headerRow}>
                <View style={styles.headerTextWrap}>
                  <Text style={styles.eyebrow}>Muscle Focus</Text>
                  <Text style={styles.title}>Which muscles do you want to work?</Text>
                  <Text style={styles.description}>
                    Pick the main area you want this workout to focus on.
                  </Text>
                </View>

                <Pressable onPress={() => setStep("plans")} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Back</Text>
                </Pressable>
              </View>

              {selectedPlan ? (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>{selectedPlan.label}</Text>
                  <Text style={styles.summaryText}>{selectedPlan.subtitle}</Text>
                </View>
              ) : null}

              <FlatList
                data={filteredMuscleOptions}
                keyExtractor={(item) => item.label}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.largeCard}
                    onPress={() => handleMuscleSelect(item)}
                  >
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardTitle}>{item.label}</Text>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Focus</Text>
                      </View>
                    </View>

                    <Text style={styles.cardSubtitle}>
                      Use {item.label.toLowerCase()} as the main focus for today’s workout.
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#F8FAFD",
    padding: 20,
    borderRadius: 24,
    maxHeight: "84%",
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },
  headerRow: {
    marginBottom: 14,
  },
  headerTextWrap: {
    marginBottom: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4E6FAE",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#14213D",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#5C677D",
  },
  closeButton: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF3FB",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  closeButtonText: {
    color: "#355070",
    fontSize: 13,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 8,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#14213D",
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5C677D",
  },
  largeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    minHeight: 108,
    justifyContent: "center",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: "#14213D",
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5C677D",
  },
  badge: {
    backgroundColor: "#EEF3FB",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#355070",
    textTransform: "uppercase",
  },
});
