import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import api from '../services/api';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    pendingRequests: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsRes, lowStockRes, requestsRes] = await Promise.all([
        api.getItems(),
        api.getLowStock(),
        api.getRequests({ status: 'pending' }),
      ]);

      setStats({
        totalItems: itemsRes.data.length,
        lowStock: lowStockRes.data.length,
        pendingRequests: requestsRes.data.length,
      });

      setLowStockItems(lowStockRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.blueCard]}>
          <Text style={styles.statValue}>{stats.totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>

        <View style={[styles.statCard, styles.orangeCard]}>
          <Text style={styles.statValue}>{stats.lowStock}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>

        <View style={[styles.statCard, styles.greenCard]}>
          <Text style={styles.statValue}>{stats.pendingRequests}</Text>
          <Text style={styles.statLabel}>Pending Requests</Text>
        </View>
      </View>

      {lowStockItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Low Stock Alerts</Text>
          {lowStockItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>{item.location_name}</Text>
              </View>
              <View style={styles.itemStock}>
                <Text style={styles.stockValue}>{item.quantity}</Text>
                <Text style={styles.stockUnit}>{item.unit}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await api.logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  blueCard: {
    backgroundColor: '#4facfe',
  },
  orangeCard: {
    backgroundColor: '#f5576c',
  },
  greenCard: {
    backgroundColor: '#38ef7d',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemStock: {
    alignItems: 'flex-end',
  },
  stockValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f5576c',
  },
  stockUnit: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    margin: 15,
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
