import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../api/client';
import { Subject } from '../types';

const ICONS: Record<string, string> = {
  calculator: '🧮',
  flask: '🔬',
  book: '📖',
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/subjects');
      setSubjects(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const renderSubject = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Topics', { subjectId: item.id, subjectName: item.name_si })}
    >
      <Text style={styles.icon}>{ICONS[item.icon] || '📚'}</Text>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name_si}</Text>
        <Text style={styles.subtitle}>{item.name_en}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={fetchSubjects} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>OL MCQ Practice</Text>
        <Text style={styles.headerSubtitle}>සාමාන්‍ය පෙළ විභාග පුරුදු</Text>
      </View>
      <FlatList
        data={subjects}
        renderItem={renderSubject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#4A90D9',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  error: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 50,
  },
  retryButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#4A90D9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
