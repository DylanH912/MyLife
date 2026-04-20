import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onComplete: (mealTags: string[]) => void;
};

type MealTagOption = {
  label: string;
  subtitle: string;
};

const mealTagOptions: MealTagOption[] = [
  { label: "High Protein", subtitle: "Meals with more protein." },
  { label: "Balanced", subtitle: "Well-rounded everyday meals." },
  { label: "Gluten-Free", subtitle: "Meals without gluten." },
  { label: "Healthy Fats", subtitle: "Options with good fat sources." },
  { label: "Quick", subtitle: "Faster meals for busy days." },
  { label: "Low Calorie", subtitle: "Lighter meal options." },
  { label: "High Fiber", subtitle: "Meals that support fullness." },
  { label: "Vegan", subtitle: "Plant-based recipes." },
  { label: "Low Fat", subtitle: "Lower fat meals." },
  { label: "Low Carb", subtitle: "Lower carbohydrate meals." },
  { label: "Healthy", subtitle: "General healthy choices." },
  { label: "Meal Prep", subtitle: "Good for preparing ahead." },
  { label: "Comfort", subtitle: "Warm, satisfying comfort meals." },
  { label: "Snack", subtitle: "Smaller snack-style options." },
];

export default function MealModal({
  visible,
  onClose,
  onComplete,
}: Props) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setSelectedTags([]);
    }
  }, [visible]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current: string[]) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
  };

  const handleComplete = () => {
    const tags: string[] = [...selectedTags];
    onComplete(tags);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.eyebrow}>Meal Planner</Text>
              <Text style={styles.title}>What kind of meal do you want?</Text>
              <Text style={styles.description}>
                Choose as many meal goals as you want and we’ll rank recipes to fit.
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>

          <FlatList
            data={mealTagOptions}
            keyExtractor={(item) => item.label}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const selected = selectedTags.includes(item.label);

              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[styles.largeCard, selected && styles.selectedCard]}
                  onPress={() => toggleTag(item.label)}
                >
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardTitle}>{item.label}</Text>
                    <View style={[styles.badge, selected && styles.selectedBadge]}>
                      <Text
                        style={[
                          styles.badgeText,
                          selected && styles.selectedBadgeText,
                        ]}
                      >
                        {selected ? "Selected" : "Tag"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </TouchableOpacity>
              );
            }}
          />

          <View style={styles.buttonRow}>
            <Pressable style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.primaryButton} onPress={handleComplete}>
              <Text style={styles.primaryButtonText}>Show Meals</Text>
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
  selectedCard: {
    backgroundColor: "#EAF1FB",
    borderColor: "#4E6FAE",
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
  selectedBadge: {
    backgroundColor: "#14213D",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#355070",
    textTransform: "uppercase",
  },
  selectedBadgeText: {
    color: "#FFFFFF",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
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
