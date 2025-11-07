import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import ScanScreen from './src/screens/ScanScreen';
import RequestsScreen from './src/screens/RequestsScreen';
import MaintenanceTicketsScreen from './src/screens/MaintenanceTicketsScreen';
import MaintenanceTicketDetailScreen from './src/screens/MaintenanceTicketDetailScreen';
import MaintenanceLoginScreen from './src/screens/MaintenanceLoginScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📱</Text>,
        }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsScreen}
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📝</Text>,
        }}
      />
      <Tab.Screen
        name="MaintenanceTickets"
        component={MaintenanceTicketsScreen}
        options={{
          tabBarLabel: 'Tickets',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔧</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: '#667eea' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {!isLoggedIn ? (
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
          >
            {(props) => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MaintenanceTicketDetail"
              component={MaintenanceTicketDetailScreen}
              options={{ title: 'Ticket Details' }}
            />
            <Stack.Screen
              name="MaintenanceLogin"
              component={MaintenanceLoginScreen}
              options={{ title: 'Maintenance Login' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
