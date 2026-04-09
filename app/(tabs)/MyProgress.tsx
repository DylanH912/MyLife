import React, { useMemo, useState } from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Line,
  Polyline,
  Text as SvgText
} from "react-native-svg";

type NutritionMetric = {
  key: string;
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
};

type WeightEntry = {
  date: string;
  weight: number;
};

type CalorieEntry = {
  date: string;
  calories: number;
};

const todayNutritionFromDb = {
  calories: 1820,
  protein: 126,
  carbs: 198,
  fat: 58,
  fiber: 24,
};
// Simulated historical data for the past 6 days (including today)
const calorieHistoryFromDb: CalorieEntry[] = [
  { date: "Apr 1", calories: 1740 },
  { date: "Apr 2", calories: 1890 },
  { date: "Apr 3", calories: 1810 },
  { date: "Apr 4", calories: 1930 },
  { date: "Apr 5", calories: 1770 },
  { date: "Apr 6", calories: 1820 },
];

// Simulated weight history for the past 6 days (including today)
const initialWeightHistoryFromDb: WeightEntry[] = [
  { date: "Apr 1", weight: 187.4 },
  { date: "Apr 2", weight: 186.9 },
  { date: "Apr 3", weight: 186.8 },
  { date: "Apr 4", weight: 186.3 },
  { date: "Apr 5", weight: 186.1 },
  { date: "Apr 6", weight: 185.9 },
];

// Standard nutrition targets for a moderately active adult aiming for weight maintenance
const nutritionTargets = {
  calories: 2000,
  protein: 140,
  carbs: 220,
  fat: 65,
  fiber: 28,
};

// Utility function to clamp a value between a min and max
const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

// Utility function to format today's date as "Apr 6"
const formatTodayLabel = () => {
  const today = new Date();
  return today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Calculate progress towards a metric as a percentage (0 to 1)
const getMetricProgress = (consumed: number, target: number) => {
  if (!target) return 0;
  return clamp(consumed / target);
};

// Calculate a "health score" for a metric based on how close the consumed value is to the target
const getSmartMetricScore = (consumed: number, target: number) => {
  if (!target) return 0;

  const ratio = consumed / target;

  if (ratio >= 0.9 && ratio <= 1.1) return 100;
  if (ratio < 0.9) return Math.round(clamp(ratio / 0.9) * 100);

  const overshootPenalty = 1 - (ratio - 1.1) / 0.5;
  return Math.round(clamp(overshootPenalty) * 100);
};

function DonutChart({
  label,
  value,
  target,
  unit,
  color,
  size,
  strokeWidth,
  isCenter = false,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  size: number;
  strokeWidth: number;
  isCenter?: boolean;
}) {
  const progress = getMetricProgress(value, target);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={styles.donutWrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E6ECF5"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={[styles.donutCenter, { width: size, height: size }]}>
        <Text style={[styles.donutLabel, isCenter && styles.centerDonutLabel]}>
          {label}
        </Text>
        <Text style={[styles.donutValue, isCenter && styles.centerDonutValue]}>
          {value}
        </Text>
        <Text style={styles.donutSubtext}>
          / {target}
          {unit}
        </Text>
      </View>
    </View>
  );
}

function LollipopChart({
  data,
  valueKey,
  lineColor,
  valueSuffix = "",
}: {
  data: Array<{ date: string; [key: string]: string | number }>;
  valueKey: string;
  lineColor: string;
  valueSuffix?: string;
}) {
  const chartWidth = 320;
  const chartHeight = 170;
  const left = 24;
  const right = 18;
  const top = 18;
  const bottom = 34;

  const numericValues = data.map((item) => Number(item[valueKey]));
  const maxValue = Math.max(...numericValues, 1);
  const minValue = Math.min(...numericValues);
  const range = Math.max(maxValue - minValue, 1);

  const stepX =
    data.length > 1 ? (chartWidth - left - right) / (data.length - 1) : 0;

  const points = data.map((item, index) => {
    const value = Number(item[valueKey]);
    const x = left + index * stepX;
    const y =
      top + (1 - (value - minValue) / range) * (chartHeight - top - bottom);

    return {
      x,
      y,
      value,
      label: String(item.date),
    };
  });

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
      <Line
        x1={left}
        y1={chartHeight - bottom}
        x2={chartWidth - right}
        y2={chartHeight - bottom}
        stroke="#D7E0EE"
        strokeWidth="1"
      />

      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={lineColor}
        strokeWidth="3"
      />

      {points.map((point) => (
        <React.Fragment key={`${point.label}-${point.value}`}>
          <Line
            x1={point.x}
            y1={chartHeight - bottom}
            x2={point.x}
            y2={point.y}
            stroke="#B9C8DF"
            strokeWidth="2"
          />
          <Circle cx={point.x} cy={point.y} r="5.5" fill={lineColor} />
          <SvgText
            x={point.x}
            y={point.y - 10}
            fontSize="10"
            fontWeight="700"
            fill="#355070"
            textAnchor="middle"
          >
            {point.value}
            {valueSuffix}
          </SvgText>
          <SvgText
            x={point.x}
            y={chartHeight - 12}
            fontSize="10"
            fontWeight="600"
            fill="#5C677D"
            textAnchor="middle"
          >
            {point.label}
          </SvgText>
        </React.Fragment>
      ))}
    </Svg>
  );
}

export default function ProgressionScreen() {
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(
    initialWeightHistoryFromDb
  );
  const [showWeightEntry, setShowWeightEntry] = useState(false);
  const [weightInput, setWeightInput] = useState("");

  const metrics: NutritionMetric[] = [
    {
      key: "protein",
      label: "Protein",
      consumed: todayNutritionFromDb.protein,
      target: nutritionTargets.protein,
      unit: "g",
      color: "#4E6FAE",
    },
    {
      key: "carbs",
      label: "Carbs",
      consumed: todayNutritionFromDb.carbs,
      target: nutritionTargets.carbs,
      unit: "g",
      color: "#D99A00",
    },
    {
      key: "calories",
      label: "Calories",
      consumed: todayNutritionFromDb.calories,
      target: nutritionTargets.calories,
      unit: "",
      color: "#14213D",
    },
    {
      key: "fat",
      label: "Fat",
      consumed: todayNutritionFromDb.fat,
      target: nutritionTargets.fat,
      unit: "g",
      color: "#1F8A5B",
    },
    {
      key: "fiber",
      label: "Fiber",
      consumed: todayNutritionFromDb.fiber,
      target: nutritionTargets.fiber,
      unit: "g",
      color: "#D9534F",
    },
  ];

  const centerMetric = metrics[2];
  const sideMetricsTop = metrics.slice(0, 2);
  const sideMetricsBottom = metrics.slice(3, 5);

  const averageCalories = useMemo(() => {
    if (!calorieHistoryFromDb.length) return 0;
    const total = calorieHistoryFromDb.reduce(
      (sum, item) => sum + item.calories,
      0
    );
    return Math.round(total / calorieHistoryFromDb.length);
  }, []);

  const latestWeight =
    weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : null;

  const healthScore = useMemo(() => {
    const caloriesScore = getSmartMetricScore(
      todayNutritionFromDb.calories,
      nutritionTargets.calories
    );
    const proteinScore = getSmartMetricScore(
      todayNutritionFromDb.protein,
      nutritionTargets.protein
    );
    const carbsScore = getSmartMetricScore(
      todayNutritionFromDb.carbs,
      nutritionTargets.carbs
    );
    const fatScore = getSmartMetricScore(
      todayNutritionFromDb.fat,
      nutritionTargets.fat
    );
    const fiberScore = getSmartMetricScore(
      todayNutritionFromDb.fiber,
      nutritionTargets.fiber
    );

    const consistencyScore = Math.round(
      clamp(calorieHistoryFromDb.length / 7) * 100
    );

    const weighted =
      caloriesScore * 0.28 +
      proteinScore * 0.22 +
      carbsScore * 0.14 +
      fatScore * 0.14 +
      fiberScore * 0.14 +
      consistencyScore * 0.08;

    return Math.round(weighted);
  }, []);

  const goodHabits = useMemo(() => {
    const habits: string[] = [];

    if (
      todayNutritionFromDb.calories >= nutritionTargets.calories * 0.9 &&
      todayNutritionFromDb.calories <= nutritionTargets.calories * 1.1
    ) {
      habits.push("Stayed close to the daily calorie target.");
    }

    if (todayNutritionFromDb.protein >= nutritionTargets.protein * 0.9) {
      habits.push("Hit a strong protein intake for recovery and muscle support.");
    }

    if (todayNutritionFromDb.fiber >= nutritionTargets.fiber * 0.8) {
      habits.push("Fiber intake is in a healthy range today.");
    }

    if (calorieHistoryFromDb.length >= 5) {
      habits.push("Nutrition logging has been consistent across the week.");
    }

    if (weightHistory.length >= 3) {
      habits.push("Weight tracking is active, which improves progress accuracy.");
    }

    return habits.length ? habits : ["You logged your intake today, which is a strong start."];
  }, [weightHistory]);

  const improvements = useMemo(() => {
    const items: string[] = [];

    if (todayNutritionFromDb.calories < nutritionTargets.calories * 0.9) {
      items.push("Calories are a bit low today. A balanced meal or snack could help.");
    }

    if (todayNutritionFromDb.calories > nutritionTargets.calories * 1.1) {
      items.push("Calories are trending above target. Watch portion sizes later today.");
    }

    if (todayNutritionFromDb.protein < nutritionTargets.protein * 0.9) {
      items.push("Protein is below target. Add a lean protein source to the next meal.");
    }

    if (todayNutritionFromDb.fiber < nutritionTargets.fiber * 0.8) {
      items.push("Fiber is low. Add fruit, vegetables, beans, or oats.");
    }

    if (todayNutritionFromDb.fat > nutritionTargets.fat * 1.15) {
      items.push("Fat intake is a little high relative to goal. Keep later meals lighter.");
    }

    if (weightHistory.length < 4) {
      items.push("Log weight more often for a clearer progress trend.");
    }

    return items.length ? items : ["No major issues stand out today. Keep repeating these habits."];
  }, [weightHistory]);

  const saveWeightForToday = () => {
    const parsedWeight = Number(weightInput);

    if (!parsedWeight || parsedWeight < 50 || parsedWeight > 700) {
      Alert.alert("Invalid weight", "Please enter a realistic weight.");
      return;
    }

    const todayLabel = formatTodayLabel();

    const alreadyLoggedToday = weightHistory.some((entry) => entry.date === todayLabel);

    if (alreadyLoggedToday) {
      Alert.alert("Already logged", "You already saved a weight for today.");
      return;
    }

    setWeightHistory((current) => [
      ...current,
      { date: todayLabel, weight: parsedWeight },
    ]);
    setWeightInput("");
    setShowWeightEntry(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Progression</Text>
          <Text style={styles.header}>Track nutrition, weight, and health trends</Text>
          <Text style={styles.description}>
            Today's nutrition breakdown, weight progress, and personalized insights to keep you on track.
          </Text>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Today’s nutrition breakdown</Text>

            <View style={styles.donutGrid}>
              <View style={styles.sideColumn}>
                {sideMetricsTop.map((item) => (
                  <DonutChart
                    key={item.key}
                    label={item.label}
                    value={item.consumed}
                    target={item.target}
                    unit={item.unit}
                    color={item.color}
                    size={95}
                    strokeWidth={11}
                  />
                ))}
              </View>

              <DonutChart
                label={centerMetric.label}
                value={centerMetric.consumed}
                target={centerMetric.target}
                unit={centerMetric.unit}
                color={centerMetric.color}
                size={151}
                strokeWidth={14}
                isCenter
              />

              <View style={styles.sideColumn}>
                {sideMetricsBottom.map((item) => (
                  <DonutChart
                    key={item.key}
                    label={item.label}
                    value={item.consumed}
                    target={item.target}
                    unit={item.unit}
                    color={item.color}
                    size={95}
                    strokeWidth={11}
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.titleRow}>
              <Text style={styles.summaryTitle}>Weight progress</Text>

              <Pressable
                style={styles.addButton}
                onPress={() => setShowWeightEntry((current) => !current)}
              >
                <Text style={styles.addButtonText}>
                  {showWeightEntry ? "Close" : "Add Weight"}
                </Text>
              </Pressable>
            </View>

            {showWeightEntry ? (
              <View style={styles.weightEntryRow}>
                <TextInput
                  value={weightInput}
                  onChangeText={setWeightInput}
                  placeholder="Enter today's weight"
                  placeholderTextColor="#7A869A"
                  keyboardType="decimal-pad"
                  style={styles.weightInput}
                />
                <Pressable style={styles.saveButton} onPress={saveWeightForToday}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </View>
            ) : null}

            {latestWeight ? (
              <Text style={styles.summaryHint}>
                Latest weight:{" "}
                <Text style={styles.summaryHintBold}>{latestWeight} lb</Text>
              </Text>
            ) : null}

            <View style={styles.chartWrap}>
              <LollipopChart
                data={weightHistory}
                valueKey="weight"
                lineColor="#4E6FAE"
                valueSuffix=" lb"
              />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.summaryTitle}>Average calories</Text>
            <Text style={styles.summaryHint}>
              Weekly average:{" "}
              <Text style={styles.summaryHintBold}>{averageCalories} cal</Text>
            </Text>

            <View style={styles.chartWrap}>
              <LollipopChart
                data={calorieHistoryFromDb}
                valueKey="calories"
                lineColor="#D99A00"
              />
            </View>
          </View>

          <View style={styles.scoreCard}>
            <View style={styles.scoreTopRow}>
              <View>
                <Text style={styles.summaryTitle}>Health score</Text>
                <Text style={styles.summaryHint}>
                  Built from calories, macro balance, fiber, and logging consistency.
                </Text>
              </View>

              <View style={styles.scorePill}>
                <Text style={styles.scorePillText}>{healthScore}/100</Text>
              </View>
            </View>

            <View style={styles.scoreBarTrack}>
              <View
                style={[
                  styles.scoreBarFill,
                  { width: `${healthScore}%` },
                  healthScore >= 80
                    ? styles.scoreBarGood
                    : healthScore >= 60
                    ? styles.scoreBarMid
                    : styles.scoreBarLow,
                ]}
              />
            </View>
          </View>

          <Text style={styles.resultsLabel}>Good habits</Text>
          <View style={styles.listCard}>
            {goodHabits.map((item) => (
              <View key={item} style={styles.feedbackRow}>
                <View style={[styles.feedbackDot, { backgroundColor: "#1F8A5B" }]} />
                <Text style={styles.feedbackText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.resultsLabel}>Needs improvement</Text>
          <View style={styles.listCard}>
            {improvements.map((item) => (
              <View key={item} style={styles.feedbackRow}>
                <View style={[styles.feedbackDot, { backgroundColor: "#D9534F" }]} />
                <Text style={styles.feedbackText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    marginBottom: 16,
  },
  scoreCard: {
    backgroundColor: "#EAF1FB",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D8E3F4",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#14213D",
    marginBottom: 12,
  },
  donutGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideColumn: {
    justifyContent: "space-between",
    gap: 14,
  },
  donutWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  donutLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#355070",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  centerDonutLabel: {
    fontSize: 12,
  },
  donutValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#14213D",
  },
  centerDonutValue: {
    fontSize: 28,
  },
  donutSubtext: {
    fontSize: 11,
    color: "#5C677D",
    marginTop: 2,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#14213D",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  weightEntryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  weightInput: {
    flex: 1,
    backgroundColor: "#F4F7FB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#14213D",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E1E8F2",
  },
  saveButton: {
    backgroundColor: "#4E6FAE",
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  summaryHint: {
    fontSize: 14,
    color: "#5C677D",
  },
  summaryHintBold: {
    color: "#14213D",
    fontWeight: "700",
  },
  chartWrap: {
    marginTop: 10,
  },
  scoreTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "center",
    marginBottom: 14,
  },
  scorePill: {
    backgroundColor: "#14213D",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  scorePillText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  scoreBarTrack: {
    height: 14,
    backgroundColor: "#DCE6F4",
    borderRadius: 999,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  scoreBarGood: {
    backgroundColor: "#1F8A5B",
  },
  scoreBarMid: {
    backgroundColor: "#D99A00",
  },
  scoreBarLow: {
    backgroundColor: "#D9534F",
  },
  resultsLabel: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "800",
    color: "#14213D",
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    marginBottom: 16,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  feedbackDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 5,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#24324A",
  },
});