
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  addCheckIn,
  getCheckIns,
} from '@/database/CheckInRepository';

// Локальная дата в формате YYYY-MM-DD
function getToday(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function HomeScreen() {
  const [totalDays, setTotalDays] = useState(0);
  const [checkedToday, setCheckedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Загружаем отметки из SQLite
  const loadCheckIns = useCallback(async () => {
    try {
      const checkIns = await getCheckIns();
      const today = getToday();

      setTotalDays(checkIns.length);
      setCheckedToday(
        checkIns.some((item) => item.date === today)
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not load your check-ins.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCheckIns();
    }, [loadCheckIns])
  );

  // Нажатие на кнопку
  async function handleCheckIn() {
    if (saving || checkedToday) return;

    setSaving(true);

    try {
      await addCheckIn(getToday());
      await loadCheckIns();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save your check-in.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#718C76" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>still here.</Text>
        <Text style={styles.subtitle}>
          A little reminder that you matter.
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.caption}>
          DAYS YOU'VE BEEN HERE
        </Text>

        <Text style={styles.counter}>
          {totalDays}
        </Text>

        <Text style={styles.description}>
          No goals. No pressure. Just you.
        </Text>

        <Pressable
          style={[
            styles.button,
            checkedToday && styles.buttonChecked,
          ]}
          onPress={handleCheckIn}
          disabled={saving || checkedToday}
        >
          <Text style={styles.buttonText}>
            {checkedToday ? "You're here ✓" : "I'm here"}
          </Text>
        </Pressable>

        <Text style={styles.message}>
          {checkedToday
            ? "I'm glad you're here. 💚"
            : "Whenever you're ready."}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Showing up is enough.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5EF',
    paddingHorizontal: 28,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F7F5EF',
  },
  header: {
    alignItems: 'center',
    paddingTop: 36,
  },
  appName: {
    fontSize: 30,
    fontWeight: '700',
    color: '#344D3B',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#89958B',
    marginTop: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontSize: 12,
    letterSpacing: 2,
    color: '#89958B',
    fontWeight: '600',
  },
  counter: {
    fontSize: 84,
    fontWeight: '300',
    color: '#344D3B',
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    color: '#89958B',
    marginTop: 8,
    marginBottom: 52,
  },
  button: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#A8C5A2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#55755C',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  buttonChecked: {
    backgroundColor: '#C9D9C5',
  },
  buttonText: {
    fontSize: 27,
    fontWeight: '600',
    color: '#344D3B',
  },
  message: {
    fontSize: 17,
    color: '#718C76',
    marginTop: 36,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#A1AAA1',
  },
});