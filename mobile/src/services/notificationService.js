import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push notification permissions');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleTicketNotification(ticket) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'New Maintenance Ticket',
          body: ticket.title || `Ticket #${ticket.id}`,
          data: { ticketId: ticket.id, type: 'maintenance_ticket' },
        },
        trigger: null, // Immediate notification
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async notifyNewTicket(ticket) {
    return this.scheduleTicketNotification(ticket);
  }

  async notifyTicketUpdate(ticket, message) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Ticket #${ticket.id} Updated`,
          body: message || 'Your ticket has been updated',
          data: { ticketId: ticket.id, type: 'maintenance_ticket_update' },
        },
        trigger: null,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling update notification:', error);
      return null;
    }
  }

  setupNotificationListeners(onNotification, onResponse) {
    // Listen for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        if (onNotification) {
          onNotification(notification);
        }
      }
    );

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        if (onResponse) {
          onResponse(response);
        }
      }
    );
  }

  removeNotificationListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  async checkForNewTickets(oldTickets, newTickets) {
    // Compare ticket lists and notify of new tickets
    const oldIds = new Set(oldTickets.map((t) => t.id));
    const newTicketsOnly = newTickets.filter((t) => !oldIds.has(t.id));

    for (const ticket of newTicketsOnly) {
      await this.notifyNewTicket(ticket);
    }

    return newTicketsOnly;
  }

  async saveLastTicketCount(count) {
    try {
      await AsyncStorage.setItem('lastTicketCount', count.toString());
    } catch (error) {
      console.error('Error saving ticket count:', error);
    }
  }

  async getLastTicketCount() {
    try {
      const count = await AsyncStorage.getItem('lastTicketCount');
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting ticket count:', error);
      return 0;
    }
  }
}

export default new NotificationService();
