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
import { useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '../api/client';
import { Subject, Topic } from '../types';

export default function TopicsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { subjectId, subjectName } = route.params;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubject();
  }, []);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/subjects/${subjectId}`);
      setSubject(response.data);
      setTopics(response.data.topics || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const renderTopic = ({ item }: { item: Topic }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Practice', { topicId: item.id, topicName: item.name_si })}
    >
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name_si}</Text>
        <Text style={styles.subtitle}>{item.name_en}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
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
        <TouchableOpacity onPress={fetchSubject} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subjectName}</Text>
      </View>
      <FlatList
        data={topics}
        renderItem={renderTopic}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4A90D9',
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: '#4A90D9',
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
