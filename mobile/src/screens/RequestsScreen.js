import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import api from '../services/api';

export default function RequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    item_id: '',
    requesting_location_id: '',
    quantity: '1',
    priority: 'normal',
    reason: '',
  });

  useEffect(() => {
    loadRequests();
    loadItems();
    loadLocations();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await api.getRequests();
      setRequests(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load requests');
    }
  };

  const loadItems = async () => {
    try {
      const response = await api.getItems();
      setItems(response.data);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await api.getLocations();
      setLocations(response.data);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.item_id || !formData.requesting_location_id) {
      Alert.alert('Error', 'Please select item and location');
      return;
    }

    try {
      await api.createRequest({
        ...formData,
        quantity: parseInt(formData.quantity),
      });
      setShowModal(false);
      loadRequests();
      Alert.alert('Success', 'Request submitted!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create request');
    }
  };

  const renderItem = ({ item }) => {
    const statusColors = {
      pending: '#f39c12',
      approved: '#3498db',
      fulfilled: '#27ae60',
      rejected: '#e74c3c',
    };

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text style={styles.itemName}>{item.item_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.requestDetail}>Location: {item.location_name}</Text>
        <Text style={styles.requestDetail}>
          Quantity: {item.quantity} {item.unit}
        </Text>
        <Text style={styles.requestDetail}>
          Requested: {new Date(item.created_at).toLocaleDateString()}
        </Text>
        {item.reason && (
          <Text style={styles.requestReason}>{item.reason}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.addButtonText}>+ New Request</Text>
      </TouchableOpacity>

      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No requests yet</Text>
        }
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Request</Text>

            <Text style={styles.label}>Item *</Text>
            <View style={styles.picker}>
              {items.slice(0, 3).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.pickerButton,
                    formData.item_id === item.id.toString() && styles.pickerButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, item_id: item.id.toString() })}
                >
                  <Text style={styles.pickerButtonText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Location *</Text>
            <View style={styles.picker}>
              {locations.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={[
                    styles.pickerButton,
                    formData.requesting_location_id === loc.id.toString() && styles.pickerButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, requesting_location_id: loc.id.toString() })
                  }
                >
                  <Text style={styles.pickerButtonText}>{loc.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
            />

            <Text style={styles.label}>Reason</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              value={formData.reason}
              onChangeText={(text) => setFormData({ ...formData, reason: text })}
              placeholder="Why do you need this?"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 15,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  requestReason: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  pickerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  pickerButtonActive: {
    backgroundColor: '#4CAF50',
  },
  pickerButtonText: {
    fontSize: 14,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
