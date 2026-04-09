import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void; // Called when the user cancels or completes the flow
  onComplete: (planTags: string[], muscle: string) => void; // Called when the user completes the flow with their selections
};

// Plan tags are used to match workouts to the user's selected plan. For example, 
// if they select "Full Body", we want to prioritize workouts that target "full body", "core", "glutes", etc. 
// This is a simplified mapping and can be expanded with more plans and tags as needed.
const PLAN_TAGS: Record<string, string[]> = {
  "Full Body": ["full body", "core", "glutes", "hamstrings", "quads", "shoulders"],
  "Upper Body": ["chest", "back", "shoulders", "arms", "triceps", "biceps"],
  "Lower Body": ["quads", "glutes", "hamstrings", "calves"],
  "Push Day": ["chest", "shoulders", "triceps"],
  "Pull Day": ["back", "rear delts", "biceps"],
  "Leg Day": ["quads", "glutes", "hamstrings", "calves"],
};

const workoutPlans = Object.keys(PLAN_TAGS).map((label) => ({
  label,
  value: PLAN_TAGS[label],
}));

const muscleOptions = [ 
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

export default function WorkoutStartModal({ visible, onClose, onComplete }: Props) {
  const [step, setStep] = useState<"ask" | "plans" | "muscles">("ask");
  const [selectedPlanTags, setSelectedPlanTags] = useState<string[] | null>(null);

  const handleStart = () => setStep("plans");

  const handlePlanSelect = (plan: { label: string; value: string[] }) => {
    setSelectedPlanTags(plan.value);
    setStep("muscles");
  };

  const handleMuscleSelect = (muscle: { label: string; value: string }) => {
    if (selectedPlanTags) {
      onComplete(selectedPlanTags, muscle.value);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {step === "ask" && (
            <>
              <Text style={styles.title}>Start a workout?</Text>
              <View style={styles.row}>
                <TouchableOpacity style={styles.button} onPress={handleStart}>
                  <Text style={styles.buttonText}>Yes</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={onClose}>
                  <Text style={styles.buttonText}>No</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === "plans" && (
            <>
              <Text style={styles.title}>Choose a workout plan</Text>
              <FlatList
                data={workoutPlans}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => handlePlanSelect(item)}
                  >
                    <Text>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {step === "muscles" && (
            <>
              <Text style={styles.title}>Which muscles do you want to work?</Text>
              <FlatList
                data={muscleOptions}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => handleMuscleSelect(item)}
                  >
                    <Text>{item.label}</Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    maxHeight: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  listItem: {
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
  },
});