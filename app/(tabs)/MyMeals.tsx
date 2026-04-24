import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import MealModal from "C:/MyLife/components/MealModal"; // or path to your modal

// Import your JSON (or load it via fetch if you prefer)
import recipesRaw from "C:/MyLife/assets/recipes.json"; // ts/tsx: import JSON directly
type Recipe = {
  name: string;
  tags: string[];
  prep_time_minutes: number;
  ingredients: string[];
  instructions: string;
};
const recipes: Recipe[] = recipesRaw;

export default function MealScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  // Open modal and reset tags
  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  // Called when user finishes selecting tags in the modal
  const handleMealsSelected = (mealTags: string[]) => {
    setSelectedTags(mealTags);
    closeModal();

    if (mealTags.length === 0) {
      setFilteredRecipes([]);
      return;
    }

    const matches = recipes.filter((recipe) =>
      mealTags.every((tag) => recipe.tags.includes(tag))
    );

    setFilteredRecipes(matches);
  };

  // Render a single recipe card
  const renderRecipe = ({ item }: { item: Recipe }) => (
    <View style={styles.recipeCard}>
      <Text style={styles.recipeName}>{item.name}</Text>
      <Text style={styles.recipeTags}>{item.tags.join(" • ")}</Text>
      <Text style={styles.recipeTime}>
        Prep: {item.prep_time_minutes} minutes
      </Text>
      <Text style={styles.recipeIngredients}>
        {item.ingredients.slice(0, 3).join(", ")}...
      </Text>
      <Text style={styles.recipeInstructions}>
        {item.instructions}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meal Planner</Text>

      {/* Tag status line */}
      {selectedTags.length > 0 ? (
        <View style={styles.tagRow}>
          <Text style={styles.tagLabel}>Selected:</Text>
          <Text style={styles.tagList}>{selectedTags.join(", ")}</Text>
        </View>
      ) : (
        <Text style={styles.subtitle}>
          Choose your meal goals to find recipes.
        </Text>
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={openModal}>
        <Text style={styles.primaryButtonText}>
          {selectedTags.length > 0 ? "Change Tags" : "Choose Meal Goals"}
        </Text>
      </TouchableOpacity>

      {/* Show results */}
      {filteredRecipes.length > 0 ? (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContent}
          renderItem={renderRecipe}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        selectedTags.length > 0 && (
          <Text style={styles.noResults}>
            No recipes match all selected tags.
          </Text>
        )
      )}

      {/* Modal */}
      <MealModal
        visible={isModalVisible}
        onClose={closeModal}
        onComplete={handleMealsSelected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFD",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#14213D",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#5C677D",
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tagLabel: {
    fontSize: 13,
    color: "#4E6FAE",
    fontWeight: "700",
    marginRight: 6,
  },
  tagList: {
    fontSize: 13,
    color: "#355070",
  },
  primaryButton: {
    backgroundColor: "#14213D",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 20,
  },
  recipeCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#14213D",
    marginBottom: 4,
  },
  recipeTags: {
    fontSize: 12,
    color: "#4E6FAE",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  recipeTime: {
    fontSize: 13,
    color: "#5C677D",
    marginBottom: 6,
  },
  recipeIngredients: {
    fontSize: 13,
    color: "#5C677D",
    marginBottom: 6,
  },
  recipeInstructions: {
    fontSize: 13,
    color: "#355070",
  },
  noResults: {
    fontSize: 14,
    color: "#DC3545",
    marginTop: 10,
  },
});