import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { score, total, topicName } = route.params;

  const percentage = Math.round((score / total) * 100);

  const getMessage = () => {
    if (percentage >= 80) return { text: 'Excellent! 🎉', color: '#4CAF50' };
    if (percentage >= 60) return { text: 'Good job! 👍', color: '#8BC34A' };
    if (percentage >= 40) return { text: 'Keep practicing! 💪', color: '#FFC107' };
    return { text: 'Don\'t give up! 📚', color: '#E74C3C' };
  };

  const message = getMessage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.topicName}>{topicName}</Text>

        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{score}/{total}</Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>

        <Text style={[styles.message, { color: message.color }]}>
          {message.text}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{score}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{total - score}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  topicName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 30,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  percentageText: {
    fontSize: 18,
    color: '#E0E0E0',
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
