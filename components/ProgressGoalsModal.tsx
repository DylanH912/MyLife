import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";

export type GoalKey =
  | "maintain"
  | "lose"
  | "gain"
  | "protein"
  | "fiber"
  | "balancedCarbs"
  | "lowerFat"
  | "consistency";

type Props = {
  visible: boolean;
  selectedGoals: GoalKey[];
  onClose: () => void;
  onSave: (goals: GoalKey[]) => void;
};

type GoalOption = {
  key: GoalKey;
  title: string;
  subtitle: string;
};

const baseTargets = {
  calories: 2000,
  protein: 140,
  carbs: 220,
  fat: 65,
  fiber: 28,
};

const outcomeGoals: GoalOption[] = [
  {
    key: "maintain",
    title: "Maintain Weight",
    subtitle: "Keep intake balanced around maintenance.",
  },
  {
    key: "lose",
    title: "Lose Weight",
    subtitle: "Shift targets slightly lower for a deficit.",
  },
  {
    key: "gain",
    title: "Build Muscle",
    subtitle: "Raise calories and protein to support growth.",
  },
];

const nutritionGoals: GoalOption[] = [
  {
    key: "protein",
    title: "Higher Protein",
    subtitle: "Emphasize recovery and muscle support.",
  },
  {
    key: "fiber",
    title: "More Fiber",
    subtitle: "Support fullness and overall nutrition quality.",
  },
  {
    key: "balancedCarbs",
    title: "Balanced Carbs",
    subtitle: "Keep carb intake steady and performance-friendly.",
  },
  {
    key: "lowerFat",
    title: "Lower Fat",
    subtitle: "Tighten fat intake to stay within goal range.",
  },
  {
    key: "consistency",
    title: "Consistent Logging",
    subtitle: "Weight consistency more heavily in the score.",
  },
];

export const deriveNutritionTargets = (selectedGoals: GoalKey[]) => {
  const targets = { ...baseTargets };

  if (selectedGoals.includes("lose")) {
    targets.calories -= 250;
    targets.carbs -= 20;
    targets.fat -= 5;
  }

  if (selectedGoals.includes("gain")) {
    targets.calories += 250;
    targets.protein += 15;
    targets.carbs += 25;
  }

  if (selectedGoals.includes("protein")) {
    targets.protein += 20;
  }

  if (selectedGoals.includes("fiber")) {
    targets.fiber += 7;
  }

  if (selectedGoals.includes("balancedCarbs")) {
    targets.carbs = 210;
  }

  if (selectedGoals.includes("lowerFat")) {
    targets.fat -= 10;
  }

  return targets;
};

export default function ProgressGoalsModal({
  visible,
  selectedGoals,
  onClose,
  onSave,
}: Props) {
  const [draftGoals, setDraftGoals] = useState<GoalKey[]>(selectedGoals);

  useEffect(() => {
    if (visible) {
      setDraftGoals(selectedGoals);
    }
  }, [visible, selectedGoals]);

  const toggleGoal = (goal: GoalKey) => {
    setDraftGoals((current) =>
      current.includes(goal)
        ? current.filter((item) => item !== goal)
        : [...current, goal]
    );
  };

  const selectedTargets = useMemo(
    () => deriveNutritionTargets(draftGoals),
    [draftGoals]
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.eyebrow}>Adjust Goals</Text>
          <Text style={styles.title}>What are you working toward right now?</Text>
          <Text style={styles.description}>
            Choose as many goals as you want. Anything already selected will stay
            highlighted so it’s easy to update your preferences.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Primary goal</Text>
            {outcomeGoals.map((goal) => {
              const selected = draftGoals.includes(goal.key);

              return (
                <Pressable
                  key={goal.key}
                  style={[styles.optionCard, selected && styles.optionCardSelected]}
                  onPress={() => toggleGoal(goal.key)}
                >
                  <View style={styles.optionTopRow}>
                    <Text
                      style={[
                        styles.optionTitle,
                        selected && styles.optionTitleSelected,
                      ]}
                    >
                      {goal.title}
                    </Text>

                    <View
                      style={[styles.statusPill, selected && styles.statusPillSelected]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          selected && styles.statusPillTextSelected,
                        ]}
                      >
                        {selected ? "Selected" : "Tap to select"}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.optionSubtitle,
                      selected && styles.optionSubtitleSelected,
                    ]}
                  >
                    {goal.subtitle}
                  </Text>
                </Pressable>
              );
            })}

            <Text style={styles.sectionTitle}>Nutrition focus</Text>
            {nutritionGoals.map((goal) => {
              const selected = draftGoals.includes(goal.key);

              return (
                <Pressable
                  key={goal.key}
                  style={[styles.optionCard, selected && styles.optionCardSelected]}
                  onPress={() => toggleGoal(goal.key)}
                >
                  <View style={styles.optionTopRow}>
                    <Text
                      style={[
                        styles.optionTitle,
                        selected && styles.optionTitleSelected,
                      ]}
                    >
                      {goal.title}
                    </Text>

                    <View
                      style={[styles.statusPill, selected && styles.statusPillSelected]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          selected && styles.statusPillTextSelected,
                        ]}
                      >
                        {selected ? "Selected" : "Tap to select"}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.optionSubtitle,
                      selected && styles.optionSubtitleSelected,
                    ]}
                  >
                    {goal.subtitle}
                  </Text>
                </Pressable>
              );
            })}

            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Updated daily targets</Text>
              <Text style={styles.previewText}>
                Calories: {selectedTargets.calories}
              </Text>
              <Text style={styles.previewText}>
                Protein: {selectedTargets.protein}g
              </Text>
              <Text style={styles.previewText}>
                Carbs: {selectedTargets.carbs}g
              </Text>
              <Text style={styles.previewText}>
                Fat: {selectedTargets.fat}g
              </Text>
              <Text style={styles.previewText}>
                Fiber: {selectedTargets.fiber}g
              </Text>
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <Pressable style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={styles.primaryButton}
              onPress={() => onSave(draftGoals)}
            >
              <Text style={styles.primaryButtonText}>Save Goals</Text>
            </Pressable>
          </View>
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
    borderRadius: 24,
    padding: 20,
    maxHeight: "88%",
    borderWidth: 1,
    borderColor: "#E6ECF5",
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
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#14213D",
    marginBottom: 10,
    marginTop: 4,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },
  optionCardSelected: {
    backgroundColor: "#EAF1FB",
    borderColor: "#4E6FAE",
  },
  optionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  optionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: "#14213D",
  },
  optionTitleSelected: {
    color: "#14213D",
  },
  optionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5C677D",
  },
  optionSubtitleSelected: {
    color: "#355070",
  },
  statusPill: {
    backgroundColor: "#EEF3FB",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusPillSelected: {
    backgroundColor: "#14213D",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#355070",
  },
  statusPillTextSelected: {
    color: "#FFFFFF",
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    marginTop: 4,
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#14213D",
    marginBottom: 10,
  },
  previewText: {
    fontSize: 14,
    color: "#5C677D",
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#EEF3FB",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#355070",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#14213D",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
