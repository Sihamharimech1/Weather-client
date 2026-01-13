import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Button, 
  ActivityIndicator, 
  FlatList, 
  StyleSheet, 
  SafeAreaView,
  StatusBar 
} from "react-native";

type Forecast = { date: string; tavg: number; prcp: number; rhum: number };

export default function App() {
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split("T")[0];
      
      // IMPORTANT: Update this IP if your computer's IP changed
      const res = await fetch("http://192.168.11.102:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today }),
      });
      
      const data = (await res.json()) as Forecast[];
      
      if (!res.ok) {
        throw new Error((data as any)?.error || "API Error");
      }
      
      setForecast(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Casablanca Forecast</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Button title="Refresh Forecast" color="#2563eb" onPress={fetchForecast} />
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Fetching AI Predictions...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <FlatList<Forecast>
          data={forecast}
          keyExtractor={(item) => item.date}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.dateText}>{item.date}</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Avg Temp</Text>
                  <Text style={styles.statValue}>{item.tavg}°C</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Rain</Text>
                  <Text style={styles.statValue}>{item.prcp}mm</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Humidity</Text>
                  <Text style={styles.statValue}>{item.rhum}%</Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1e3a8a", // Dark Blue Header
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc", // Light Gray Body
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  buttonContainer: {
    marginBottom: 15,
  },
  center: {
    marginTop: 30,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#64748b",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: "#b91c1c",
    textAlign: "center",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
});