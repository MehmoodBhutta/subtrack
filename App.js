// Entry point. Mirrors lib/main.dart: boots the DB + notifications + premium
// state, loads icon fonts, shows onboarding until finished, then the tabbed
// app. Errors during boot render the crash screen instead of force-closing.
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { usePremiumStore } from './src/stores/premium';
import { useCurrencyStore } from './src/stores/currency';
import { useSubsStore } from './src/stores/subs';
import { useProfileStore } from './src/stores/profile';
import { initNotifications, requestPermission } from './src/services/notifications';

import OnboardingScreen from './src/screens/Onboarding';
import DashboardScreen from './src/screens/Dashboard';
import AddEditScreen from './src/screens/AddEdit';
import InsightsScreen from './src/screens/Insights';
import PaywallScreen from './src/screens/Paywall';
import SettingsScreen from './src/screens/Settings';
import CrashScreen from './src/screens/Crash';

import { BRAND, INK, MUTED, BG } from './src/theme';
import Icon from './src/components/Icon';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const load = useSubsStore((s) => s.load);
  useEffect(() => { load(); }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: BG },
        headerTitleStyle: { color: INK, fontWeight: '700' },
        tabBarActiveTintColor: BRAND,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: { backgroundColor: '#fff' },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Subscriptions', tabBarLabel: 'Subscriptions', tabBarIcon: ({ color, size }) => <Icon name="wallet" size={size} color={color} /> }} />
      <Tab.Screen
        name="Insights"
        component={isPremium ? InsightsScreen : PaywallScreen}
        options={{ title: 'Insights', tabBarLabel: 'Insights', tabBarIcon: ({ color, size }) => <Icon name="barChart" size={size} color={color} /> }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!isPremium) {
              e.preventDefault();
              navigation.navigate('Paywall');
            }
          },
        })}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Icon name="person" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

function Root() {
  const hasOnboarded = usePremiumStore((s) => s.hasOnboarded);
  const finishOnboarding = usePremiumStore((s) => s.finishOnboarding);
  const loadPremium = usePremiumStore((s) => s.load);
  const loadCurrency = useCurrencyStore((s) => s.load);
  const loadProfile = useProfileStore((s) => s.load);
  const [ready, setReady] = useState(false);
  const [crash, setCrash] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await initNotifications();
        await requestPermission();
        await loadPremium();
        await loadCurrency();
        await loadProfile();
        setReady(true);
      } catch (e) {
        setCrash(e);
      }
    })();
  }, []);

  if (crash) return <CrashScreen error={crash.message} stack={crash.stack} />;
  if (!ready) return <View style={{ flex: 1, backgroundColor: BG }} />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasOnboarded ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onDone={finishOnboarding} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main" component={Tabs} />
        )}
        <Stack.Screen name="AddEdit" component={AddEditScreen} options={{ title: 'Subscription', headerShown: true, headerStyle: { backgroundColor: BG }, headerTitleStyle: { color: INK, fontWeight: '700' } }} />
        <Stack.Screen name="Paywall" component={PaywallScreen} options={{ title: 'SubTrack Premium', headerShown: true, headerStyle: { backgroundColor: BG }, headerTitleStyle: { color: INK, fontWeight: '700' } }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (<><Root /><StatusBar style="dark" /></>);
}
