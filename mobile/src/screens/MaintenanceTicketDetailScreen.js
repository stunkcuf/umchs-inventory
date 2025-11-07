import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../services/api';

export default function MaintenanceTicketDetailScreen({ route, navigation }) {
  const { ticket: initialTicket } = route.params;
  const [ticket, setTicket] = useState(initialTicket);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (initialTicket.id !== 'sample') {
      loadTicketDetails();
    }
  }, []);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getMaintenanceTicketDetails(initialTicket.id);
      setTicket(response.data);
    } catch (error) {
      console.error('Load ticket details error:', error);
      Alert.alert('Error', 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!responseMessage.trim()) {
      Alert.alert('Error', 'Please enter a response message');
      return;
    }

    try {
      setSending(true);
      await api.respondToMaintenanceTicket(ticket.id, responseMessage.trim());
      Alert.alert('Success', 'Response sent successfully!');
      setResponseMessage('');
      loadTicketDetails(); // Reload to see the new comment
    } catch (error) {
      console.error('Send response error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to send response');
    } finally {
      setSending(false);
    }
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
              <Text style={styles.statusText}>{ticket.status || 'unknown'}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority) }]}>
              <Text style={styles.badgeText}>{ticket.priority || 'normal'} priority</Text>
            </View>
          </View>

          <Text style={styles.ticketId}>Ticket #{ticket.id}</Text>
          <Text style={styles.title}>{ticket.title || 'No Title'}</Text>
          <Text style={styles.date}>
            Created: {new Date(ticket.created_at).toLocaleString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{ticket.description || 'No description available'}</Text>
        </View>

        {ticket.comments && ticket.comments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comments ({ticket.comments.length})</Text>
            {ticket.comments.map((comment) => (
              <View key={comment.id} style={styles.comment}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.author || 'Unknown'}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))}
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#667eea" />
            <Text style={styles.loadingText}>Loading details...</Text>
          </View>
        )}

        {ticket.raw_html && (
          <View style={styles.debugSection}>
            <Text style={styles.debugText}>Debug Info: Connected to maintenance system</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.responseSection}>
        <Text style={styles.responseSectionTitle}>Add Response</Text>
        <TextInput
          style={styles.responseInput}
          placeholder="Type your response here..."
          value={responseMessage}
          onChangeText={setResponseMessage}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendResponse}
          disabled={sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? 'Sending...' : 'Send Response'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ticketId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: '#999',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  comment: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  debugSection: {
    backgroundColor: '#fff3cd',
    padding: 12,
    margin: 10,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#856404',
  },
  responseSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  responseSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  responseInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
