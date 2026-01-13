import React, { useEffect, useState } from "react";
import { 
  View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, 
  TouchableOpacity, ImageBackground, LayoutAnimation, Platform, 
  UIManager, TextInput, ActivityIndicator, Alert 
} from "react-native";
import { 
  CloudRain, Wind, Droplets, Sun, MapPin, Search, 
  BarChart, Eye, ChevronLeft, ChevronRight, Thermometer 
} from 'lucide-react-native';
import { WeatherTrendChart } from './components/WeatherChart';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Forecast = { date: string; tavg: number; prcp: number; rhum: number; tmax: number; tmin: number };
type TimeFilter = 'Hourly' | '10 Days' | 'Monthly';

export default function App() {
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'charts' | 'location'>('home');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('10 Days');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  
  // City Search States
  const [city, setCity] = useState<string>("Casablanca"); 
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // FETCH LOGIC: Sends both Date and City to your Flask Backend
  const fetchForecast = async (targetCity: string) => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch("http://192.168.100.192:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // DYNAMIC: Passing the city name to the backend ML model
        body: JSON.stringify({ 
          date: today, 
          city: targetCity 
        }), 
      });

      if (!res.ok) throw new Error("City not found or server error");

      const data = await res.json();
      setForecast(data);
      setCity(targetCity); // Update the UI to show the new city name
    } catch (err) { 
      console.error("Fetch error:", err);
      Alert.alert("Error", "Could not fetch weather for " + targetCity);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForecast(city); }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchForecast(searchQuery.trim());
      setSearchQuery("");
      setActiveTab('home'); // Switch back home to see the new results
    }
  };

  const toggleExpand = (date: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDate(expandedDate === date ? null : date);
  };

  const current = forecast[0] || { tavg: 0, prcp: 0, rhum: 0, tmax: 0, tmin: 0 };
  const isRainy = current.prcp > 0;
  const HeroIcon = isRainy ? CloudRain : Sun;
  
  const heroImage = isRainy 
    ? 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1000' 
    : 'https://images.unsplash.com/photo-1516912481808-34061f8bc9a2?q=80&w=1000';

  const ForecastCard = ({ item, index }: { item: Forecast, index: number }) => {
    const isExpanded = expandedDate === item.date;
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => toggleExpand(item.date)}
        style={[styles.forecastRow, isExpanded && styles.forecastRowActive]}>
        <View style={styles.rowMain}>
          <Text style={styles.forecastDate}>{index === 0 ? "Today" : item.date}</Text>
          <View style={styles.rowRight}>
            <Text style={styles.tempRange}>{Math.round(item.tmax)}° / {Math.round(item.tmin)}°</Text>
            {item.prcp > 0 ? <CloudRain color={isExpanded ? "#fff" : "#60a5fa"} size={20} /> : <Sun color={isExpanded ? "#fff" : "#fbbf24"} size={20} />}
          </View>
        </View>
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}><Droplets color="#94a3b8" size={16}/><Text style={styles.detailLabel}>Humidity</Text><Text style={styles.detailValue}>{item.rhum}%</Text></View>
              <View style={styles.detailItem}><Wind color="#94a3b8" size={16}/><Text style={styles.detailLabel}>Precip.</Text><Text style={styles.detailValue}>{item.prcp}mm</Text></View>
              <View style={styles.detailItem}><Thermometer color="#94a3b8" size={16}/><Text style={styles.detailLabel}>Avg Temp</Text><Text style={styles.detailValue}>{Math.round(item.tavg)}°</Text></View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* HERO SECTION UPDATES DYNAMICALLY */}
      <ImageBackground source={{ uri: heroImage }} style={styles.heroBackground}>
        <View style={styles.darkOverlay} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.locationTitle}>{city}</Text>
              <Text style={styles.dateSubtitle}>{new Date().toDateString()}</Text>
            </View>
            <TouchableOpacity style={styles.glassIcon} onPress={() => setActiveTab('location')}>
              <Search color="white" size={20} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.mainWeatherDisplay}>
            {loading ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <>
                <Text style={styles.heroTemp}>{Math.round(current.tavg)}°</Text>
                <View style={styles.conditionContainer}>
                  <HeroIcon color="#fbbf24" size={48}/>
                  <Text style={styles.conditionText}>{isRainy ? "Rainy" : "Clear"}</Text>
                  <Text style={styles.feelsLikeText}>Hum: {current.rhum}%</Text>
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </ImageBackground>

      <View style={styles.contentLayer}>
        <View style={styles.pillContainer}>
          {(['Hourly', '10 Days', 'Monthly'] as TimeFilter[]).map((item) => (
            <TouchableOpacity key={item} onPress={() => setTimeFilter(item)} style={[styles.pill, timeFilter === item && styles.pillActive]}>
              <Text style={[styles.pillText, timeFilter === item && styles.pillTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {activeTab === 'home' && forecast.map((item, index) => <ForecastCard key={item.date} item={item} index={index} />)}
          
          {activeTab === 'location' && (
            <View>
              <View style={styles.searchBar}>
                <Search color="#94a3b8" size={18} />
                <TextInput 
                  style={styles.input}
                  placeholder="Type city name (e.g. Marrakech)..."
                  placeholderTextColor="#94a3b8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
              </View>
              <TouchableOpacity style={styles.locCard} onPress={() => fetchForecast(city)}>
                <View>
                  <Text style={styles.locCity}>{city}</Text>
                  <Text style={styles.locCondition}>{isRainy ? 'Rainy' : 'Clear'}</Text>
                </View>
                <Text style={styles.locTemp}>{Math.round(current.tavg)}°</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {activeTab === 'charts' && <WeatherTrendChart data={forecast} />}
        </ScrollView>
      </View>

      <View style={styles.bottomNav}>
         <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
           <Sun color={activeTab === 'home' ? "white" : "#64748b"}/><Text style={[styles.navText, activeTab === 'home' && {color:'white'}]}>Weather</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('location')}>
           <MapPin color={activeTab === 'location' ? "white" : "#64748b"}/><Text style={[styles.navText, activeTab === 'location' && {color:'white'}]}>Location</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('charts')}>
           <BarChart color={activeTab === 'charts' ? "white" : "#64748b"}/><Text style={[styles.navText, activeTab === 'charts' && {color:'white'}]}>Trends</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000' },
  heroBackground: { height: 420, width: '100%' },
  darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, alignItems: 'center' },
  locationTitle: { color: 'white', fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  dateSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  glassIcon: { width: 45, height: 45, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  mainWeatherDisplay: { marginTop: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroTemp: { color: 'white', fontSize: 110, fontWeight: '200', letterSpacing: -5 },
  conditionContainer: { alignItems: 'flex-end' },
  conditionText: { color: 'white', fontSize: 24, fontWeight: '600', marginTop: 10 },
  feelsLikeText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  contentLayer: { flex: 1, backgroundColor: '#000', borderTopLeftRadius: 40, borderTopRightRadius: 40, marginTop: -50, paddingHorizontal: 20, paddingTop: 25 },
  pillContainer: { flexDirection: 'row', backgroundColor: '#1a1b1e', borderRadius: 30, padding: 6, marginBottom: 25 },
  pill: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 25 },
  pillActive: { backgroundColor: '#4a3b61' },
  pillText: { color: '#94a3b8', fontWeight: '600' },
  pillTextActive: { color: 'white' },
  forecastRow: { backgroundColor: '#111214', padding: 20, borderRadius: 28, marginBottom: 12 },
  forecastRowActive: { backgroundColor: '#4a3b61' },
  rowMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forecastDate: { color: 'white', fontSize: 16 },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  tempRange: { color: 'white', marginRight: 15, fontWeight: '600' },
  expandedContent: { marginTop: 15 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
  detailGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { alignItems: 'center', flex: 1 },
  detailLabel: { color: '#94a3b8', fontSize: 10, marginTop: 5 },
  detailValue: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  searchBar: { flexDirection: 'row', backgroundColor: '#1a1b1e', padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  input: { flex: 1, color: 'white', marginLeft: 10, fontSize: 16 },
  locCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 25, borderRadius: 30, backgroundColor: '#111214', alignItems: 'center' },
  locCity: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  locCondition: { color: '#94a3b8' },
  locTemp: { color: 'white', fontSize: 36, fontWeight: '200' },
  bottomNav: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.95)', paddingVertical: 20, borderTopWidth: 0.5, borderTopColor: '#222', position: 'absolute', bottom: 0, width: '112%' },
  navItem: { flex: 1, alignItems: 'center' },
  navText: { color: '#64748b', fontSize: 11, marginTop: 6 }
});