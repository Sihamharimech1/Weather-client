import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, SafeAreaView, StatusBar, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { CloudRain, Wind, Droplets, Sun, MapPin, Search, Calendar, BarChart2 } from 'lucide-react-native';
import { WeatherTrendChart } from './components/WeatherChart';

type Forecast = { date: string; tavg: number; prcp: number; rhum: number; tmax: number; tmin: number };

export default function App() {
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(false);
  // State to switch between Home and Charts
  const [activeTab, setActiveTab] = useState<'home' | 'charts'>('home');

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch("http://192.168.100.192:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today }),
      });
      const data = await res.json();
      setForecast(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForecast(); }, []);

  const current = forecast[0] || { tavg: 0, prcp: 0, rhum: 0 };

  // --- RENDERING LOGIC ---
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {activeTab === 'home' ? (
        <>
          <LinearGradient colors={['#323337', '#1a1b1e']} style={styles.topSection}>
            <SafeAreaView>
              <View style={styles.headerRow}>
                 <View>
                    <Text style={styles.locationTitle}>Casablanca, Morocco</Text>
                    <Text style={styles.dateSubtitle}>January 13, 2026</Text>
                 </View>
                 <TouchableOpacity onPress={fetchForecast}><Search color="white" size={24} /></TouchableOpacity>
              </View>
              <View style={styles.mainWeatherRow}>
                <Text style={styles.mainTemp}>{Math.round(current.tavg)}°</Text>
                <View style={styles.weatherConditionBox}>
                    <CloudRain color="#FFD700" size={48} />
                    <Text style={styles.conditionText}>Rainy</Text>
                </View>
              </View>
              <Text style={styles.feelsLike}>Feels like {Math.round(current.tavg - 1)}°</Text>
            </SafeAreaView>
          </LinearGradient>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.statsGrid}>
              <StatCard icon={<Wind color="#94a3b8" size={20}/>} label="Rain" value={`${current.prcp}mm`} trend="Forecasted" />
              <StatCard icon={<Droplets color="#94a3b8" size={20}/>} label="Humidity" value={`${current.rhum}%`} trend="Normal" />
            </View>

            <Text style={styles.sectionTitle}>Daily Forecast</Text>
            {forecast.map((item, index) => (
              <View key={index} style={styles.forecastRow}>
                <Text style={styles.forecastDate}>{index === 0 ? "Today" : item.date}</Text>
                <View style={styles.forecastDetails}>
                   <Text style={styles.forecastTemp}>{Math.round(item.tavg)}°</Text>
                   <Sun color="white" size={20} />
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        /* --- CHART PAGE VIEW --- */
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
          <Text style={styles.headerText}>Weather Trends</Text>
          <WeatherTrendChart data={forecast} />
          <View style={styles.chartInfoCard}>
             <Text style={styles.chartInfoTitle}>Weekly Outlook</Text>
             <Text style={styles.chartInfoText}>
               The graph above shows the temperature variance predicted by our LSTM model. 
               Expect stable conditions with peak temperatures mid-week.
             </Text>
          </View>
        </SafeAreaView>
      )}

      {/* --- SHARED BOTTOM NAVIGATION --- */}
      <View style={styles.bottomNav}>
         <NavIcon 
            icon={<Sun color={activeTab === 'home' ? "white" : "#64748b"} />} 
            label="Weather" 
            active={activeTab === 'home'} 
            onPress={() => setActiveTab('home')} 
         />
         <NavIcon 
            icon={<BarChart2 color={activeTab === 'charts' ? "white" : "#64748b"} />} 
            label="Trends" 
            active={activeTab === 'charts'} 
            onPress={() => setActiveTab('charts')} 
         />
         <NavIcon icon={<MapPin color="#64748b" />} label="Location" />
      </View>
    </View>
  );
}

const StatCard = ({ icon, label, value, trend }: any) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>{icon}<Text style={styles.statLabel}>{label}</Text></View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTrend}>{trend}</Text>
  </View>
);

const NavIcon = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    {icon}
    <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000' },
  topSection: { padding: 20, height: 320, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  dateSubtitle: { color: '#94a3b8', fontSize: 13 },
  mainWeatherRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, alignItems: 'center' },
  mainTemp: { color: 'white', fontSize: 90, fontWeight: '200' },
  weatherConditionBox: { alignItems: 'center' },
  conditionText: { color: 'white', fontSize: 16, marginTop: 5 },
  feelsLike: { color: '#94a3b8', fontSize: 14, marginTop: 10 },
  contentScroll: { flex: 1, marginTop: -20, paddingHorizontal: 20 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, marginTop: 10 },
  statCard: { backgroundColor: '#1a1b1e', width: '48%', padding: 15, borderRadius: 20 },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statLabel: { color: '#94a3b8', marginLeft: 8, fontSize: 12 },
  statValue: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  statTrend: { color: '#6366f1', fontSize: 11, marginTop: 4 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1a1b1e', padding: 18, borderRadius: 20, marginBottom: 10, alignItems: 'center' },
  forecastDate: { color: 'white', fontSize: 14 },
  forecastDetails: { flexDirection: 'row', alignItems: 'center' },
  forecastTemp: { color: 'white', fontSize: 16, marginRight: 12, fontWeight: 'bold' },
  bottomNav: { flexDirection: 'row', backgroundColor: '#000', paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: '#333' },
  navItem: { flex: 1, alignItems: 'center' },
  navText: { color: '#64748b', fontSize: 10, marginTop: 4 },
  navTextActive: { color: 'white' },
  headerText: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  chartInfoCard: { backgroundColor: '#1a1b1e', padding: 20, borderRadius: 25, marginTop: 20 },
  chartInfoTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  chartInfoText: { color: '#94a3b8', fontSize: 14, lineHeight: 20 }
});