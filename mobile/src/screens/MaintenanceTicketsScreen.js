import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';
import notificationService from '../services/notificationService';

export default function MaintenanceTicketsScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    checkAuthAndLoadTickets();
    setupNotifications();

    // Poll for new tickets every 5 minutes
    const intervalId = setInterval(() => {
      checkForNewTicketsInBackground();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
      notificationService.removeNotificationListeners();
    };
  }, []);

  const setupNotifications = async () => {
    await notificationService.requestPermissions();

    notificationService.setupNotificationListeners(
      (notification) => {
        console.log('New notification:', notification);
      },
      (response) => {
        const ticketId = response.notification.request.content.data.ticketId;
        if (ticketId) {
          navigation.navigate('MaintenanceTicketDetail', {
            ticket: { id: ticketId },
          });
        }
      }
    );
  };

  const checkForNewTicketsInBackground = async () => {
    try {
      const response = await api.getMaintenanceTickets();
      const newTickets = response.data;

      const lastCount = await notificationService.getLastTicketCount();
      if (newTickets.length > lastCount) {
        const diff = newTickets.length - lastCount;
        await notificationService.scheduleTicketNotification({
          id: 'new',
          title: `${diff} new ticket${diff > 1 ? 's' : ''} available`,
        });
      }

      await notificationService.saveLastTicketCount(newTickets.length);
    } catch (error) {
      console.error('Background check error:', error);
    }
  };

  const checkAuthAndLoadTickets = async () => {
    try {
      const authResponse = await api.getMaintenanceAuthStatus();
      setAuthenticated(authResponse.data.authenticated);
      setUsername(authResponse.data.username || '');

      if (authResponse.data.authenticated) {
        loadTickets();
      } else {
        // Automatically login with stored credentials
        navigation.navigate('MaintenanceLogin');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setLoading(false);
      navigation.navigate('MaintenanceLogin');
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await api.getMaintenanceTickets();
      setTickets(response.data);
    } catch (error) {
      console.error('Load tickets error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to load tickets');

      if (error.response?.status === 401) {
        navigation.navigate('MaintenanceLogin');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#3498db',
      pending: '#f39c12',
      in_progress: '#9b59b6',
      resolved: '#27ae60',
      closed: '#95a5a6',
      unknown: '#7f8c8d',
    };
    return colors[status] || colors.unknown;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#e74c3c',
      normal: '#3498db',
      low: '#95a5a6',
    };
    return colors[priority] || colors.normal;
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => navigation.navigate('MaintenanceTicketDetail', { ticket: item })}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle} numberOfLines={2}>
          {item.title || `Ticket #${item.id}`}
        </Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.badgeText}>{item.priority || 'normal'}</Text>
        </View>
      </View>

      <Text style={styles.ticketDescription} numberOfLines={3}>
        {item.description || 'No description available'}
      </Text>

      <View style={styles.ticketFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status || 'unknown'}</Text>
        </View>
        <Text style={styles.ticketDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading tickets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Maintenance Tickets</Text>
        {username && (
          <Text style={styles.headerSubtitle}>Logged in as: {username}</Text>
        )}
      </View>

      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tickets found</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadTickets}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
    opacity: 0.9,
  },
  list: {
    padding: 15,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ticketDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
