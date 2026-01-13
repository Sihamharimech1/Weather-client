import React, { useState } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

type DataType = 'Temperature' | 'Humidity' | 'Rain' | 'Pressure';

export const WeatherTrendChart = ({ data }: { data: any[] }) => {
  const [selectedType, setSelectedType] = useState<DataType>('Temperature');

  if (!data || data.length === 0) {
    return (
      <View style={styles.chartCard}>
        <Text style={{ color: '#94a3b8' }}>Awaiting forecast data...</Text>
      </View>
    );
  }

  // 1. Logic to switch data based on button selection
  const getActiveData = () => {
    const subset = data.slice(0, 7);
    switch (selectedType) {
      case 'Humidity':
        return {
          values: subset.map(d => d.rhum),
          suffix: '%',
          yAxisLabel: 'Humidity (%)',
          color: '#22d3ee' // Cyan
        };
      case 'Rain':
        return {
          values: subset.map(d => d.prcp),
          suffix: 'mm',
          yAxisLabel: 'Precipitation (mm)',
          color: '#60a5fa' // Blue
        };
      default:
        return {
          values: subset.map(d => d.tavg),
          suffix: '°',
          yAxisLabel: 'Temp (°C)',
          color: '#6366f1' // Indigo
        };
    }
  };

  const active = getActiveData();
  const labels = data.slice(0, 7).map(d => d.date.split('-')[2]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overview</Text>

      {/* 2. Interactive Toggle Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buttonRow}>
        {(['Temperature', 'Humidity', 'Rain'] as DataType[]).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setSelectedType(type)}
            style={[styles.chip, selectedType === type && styles.activeChip]}
          >
            <Text style={[styles.chipText, selectedType === type && styles.activeChipText]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 3. The Dynamic Chart */}
      <View style={styles.chartWrapper}>
        <Text style={styles.yAxisTitle}>{active.yAxisLabel}</Text>
        <LineChart
          data={{
            labels: labels,
            datasets: [{
              data: active.values,
              color: (opacity = 1) => active.color,
              strokeWidth: 3
            }]
          }}
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#1a1b1e',
            backgroundGradientFrom: '#1a1b1e',
            backgroundGradientTo: '#1a1b1e',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
            propsForBackgroundLines: { strokeDasharray: "", stroke: "#2d2e32" },
            propsForDots: { r: "4", strokeWidth: "2", stroke: active.color },
            fillShadowGradientFrom: active.color,
            fillShadowGradientTo: '#1a1b1e',
            fillShadowGradientOpacity: 0.15,
          }}
          bezier
          style={styles.chartStyle}
          yAxisSuffix={active.suffix}
        />
        <Text style={styles.xAxisTitle}>Days of the Month</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#1a1b1e', borderRadius: 30, padding: 20, marginTop: 10 },
  title: { color: 'white', fontSize: 24, fontWeight: '600', marginBottom: 15 },
  buttonRow: { flexDirection: 'row', marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'transparent', marginRight: 10, borderWidth: 1, borderColor: '#333' },
  activeChip: { backgroundColor: '#e2f3f5', borderColor: '#e2f3f5' },
  chipText: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
  activeChipText: { color: '#1a1b1e' },
  chartWrapper: { alignItems: 'center', width: '100%' },
  chartStyle: { borderRadius: 20, marginLeft: -10 },
  yAxisTitle: { color: '#64748b', fontSize: 10, alignSelf: 'flex-start', marginBottom: 5, marginLeft: 10, textTransform: 'uppercase' },
  xAxisTitle: { color: '#64748b', fontSize: 10, marginTop: 5, textTransform: 'uppercase' },
  chartCard: { backgroundColor: '#1a1b1e', borderRadius: 30, padding: 40, alignItems: 'center' }
});