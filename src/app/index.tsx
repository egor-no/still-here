
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  addCheckIn,
  getCheckIns,
} from '@/database/CheckInRepository';

function getToday(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const COLORS = ['#A8C5A2', '#E6C58A', '#E8B6A8', '#8EA9BD'];

function Celebration({
  visible,
  totalDays,
  onClose,
}: {
  visible: boolean;
  totalDays: number;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      animation.setValue(0);

      Animated.timing(animation, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      animation.stopAnimation();
    }
  }, [visible, animation]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.celebrationArea}>
            {Array.from({ length: 32 }, (_, index) => {
              const startX = (index * 43) % 160 - 80;
              const endX = (index * 79) % 300 - 150;
              const endY = (index * 53) % 180 - 90;

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.confetti,
                    {
                      backgroundColor: COLORS[index % COLORS.length],
                      left: '50%',
                      top: '50%',
                      opacity: animation.interpolate({
                        inputRange: [0, 0.1, 0.8, 1],
                        outputRange: [0, 1, 1, 0],
                      }),
                      transform: [
                        {
                          translateX: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [startX, endX],
                          }),
                        },
                        {
                          translateY: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, endY],
                          }),
                        },
                        {
                          rotate: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', `${index * 35}deg`],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              );
            })}

            <View style={styles.checkCircle}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
          </View>

          <Text style={styles.modalTitle}>
            Glad you're still here!
          </Text>

          <Text style={styles.modalDescription}>
            You showed up today. That's enough.
          </Text>

          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>
              Day {totalDays} · Checked in ✓
            </Text>
          </View>

          <Pressable
            style={styles.continueButton}
            onPress={onClose}
          >
            <Text style={styles.continueText}>
              Now go live your life →
            </Text>
          </Pressable>

          <Text style={styles.seeYou}>
            See you whenever.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

export default function HomeScreen() {
  const [totalDays, setTotalDays] = useState(0);
  const [checkedToday, setCheckedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const [testDayOffset, setTestDayOffset] = useState(0);
  const [testMode, setTestMode] = useState(false);

  function getCurrentDay() {
    const date = new Date();
    date.setDate(date.getDate() + testDayOffset);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const loadCheckIns = useCallback(async () => {
    try {
      const checkIns = await getCheckIns();

      setTotalDays(checkIns.length);
      setCheckedToday(
        checkIns.some((item) => item.date === getCurrentDay())
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not load your check-ins.');
    } finally {
      setLoading(false);
    }
}, [testDayOffset]);

  useFocusEffect(
    useCallback(() => {
      loadCheckIns();
    }, [loadCheckIns])
  );

  async function handleCheckIn() {
if (saving) return;

    setSaving(true);

    try {
      const inserted = await addCheckIn(getCurrentDay());
      await loadCheckIns();

        setShowCelebration(true);
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
disabled={saving} 
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
        {__DEV__ && (
          <View style={styles.testPanel}>
            <Text style={styles.testTitle}>
              TEST MODE
            </Text>

            <Text style={styles.testDate}>
              {getCurrentDay()}
            </Text>

            <View style={styles.testButtons}>
              <Pressable
                style={styles.testButton}
                onPress={() => {
                  setTestDayOffset((day) => day + 1);
                }}
              >
                <Text style={styles.testButtonText}>
                  Next day →
                </Text>
              </Pressable>

              <Pressable
                style={styles.testButton}
                onPress={() => {
                  setTestDayOffset(0);
                }}
              >
                <Text style={styles.testButtonText}>
                  Today
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <Text style={styles.footerText}>
          Showing up is enough.
        </Text>
      </View>

      <Celebration
        visible={showCelebration}
        totalDays={totalDays}
        onClose={() => setShowCelebration(false)}
      />
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

  // Поздравление
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 45, 35, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  celebrationArea: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2EDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    fontSize: 62,
    color: '#638B68',
    fontWeight: '600',
  },
  confetti: {
    position: 'absolute',
    width: 9,
    height: 5,
    borderRadius: 1,
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#344D3B',
    textAlign: 'center',
    marginTop: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: '#718C76',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  dayBadge: {
    backgroundColor: '#EAF1E6',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  dayBadgeText: {
    color: '#344D3B',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#A8C5A2',
    paddingVertical: 17,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#344D3B',
  },
  seeYou: {
    color: '#89958B',
    fontSize: 13,
    marginTop: 16,
  },
  testPanel: {
  alignItems: 'center',
  marginBottom: 20,
  padding: 14,
  backgroundColor: '#EAF1E6',
  borderRadius: 16,
  width: '100%',
},
testTitle: {
  fontSize: 11,
  fontWeight: '700',
  letterSpacing: 2,
  color: '#718C76',
},
testDate: {
  fontSize: 14,
  color: '#344D3B',
  marginVertical: 10,
},
testButtons: {
  flexDirection: 'row',
  gap: 12,
},
testButton: {
  backgroundColor: '#A8C5A2',
  paddingHorizontal: 18,
  paddingVertical: 10,
  borderRadius: 20,
},
testButtonText: {
  color: '#344D3B',
  fontWeight: '600',
},
});
