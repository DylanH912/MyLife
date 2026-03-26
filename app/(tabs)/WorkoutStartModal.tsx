// Lot of this code was taken by https://www.youtube.com/watch?v=cPgB8GkH_d4 and other tutorials by him
import React, { useState } from "react"; //It is spelled Modal not model. Learned that the hard way :)
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const workoutPlans = [
  "Full Body",
  "Upper Body",
  "Lower Body",
  "Push Day",
  "Pull Day",
  "Leg Day",
];

const muscleOptions = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Glutes",
  "Quads",
  "Hamstrings",
  "Calves",
  "Core",
];

export default function WorkoutStartModal({ visible, onClose }: Props) {
  const [step, setStep] = useState<"ask" | "plans" | "muscles" | "done">("ask");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleStart = () => setStep("plans");
  const handleNo = () => {
    console.log("To be implemented");
    onClose();
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    setStep("muscles");
  };

  const handleMuscleSelect = (muscle: string) => {
    console.log("User selected plan:", selectedPlan);
    console.log("User selected muscle:", muscle);
    setStep("done");
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

                <TouchableOpacity style={styles.button} onPress={handleNo}>
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
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => handlePlanSelect(item)}
                  >
                    <Text>{item}</Text>
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
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => handleMuscleSelect(item)}
                  >
                    <Text>{item}</Text>
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