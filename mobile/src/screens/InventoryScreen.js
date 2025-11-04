import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import api from '../services/api';

export default function InventoryScreen() {
  const [inventory, setInventory] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      loadInventory();
    }
  }, [selectedLocation]);

  const loadLocations = async () => {
    try {
      const response = await api.getLocations();
      setLocations(response.data);
      if (response.data.length > 0) {
        setSelectedLocation(response.data[0].id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load locations');
    }
  };

  const loadInventory = async () => {
    try {
      const response = await api.getInventoryByLocation(selectedLocation);
      setInventory(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load inventory');
    }
  };

  const handleAdjust = async () => {
    if (!adjustQty || adjustQty === '0') {
      Alert.alert('Error', 'Please enter a quantity');
      return;
    }

    try {
      await api.adjustInventory({
        item_id: adjustItem.item_id,
        location_id: selectedLocation,
        quantity_change: parseInt(adjustQty),
        transaction_type: parseInt(adjustQty) > 0 ? 'add' : 'remove',
        notes: 'Mobile adjustment',
      });

      setShowAdjustModal(false);
      loadInventory();
      Alert.alert('Success', 'Inventory updated!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update');
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity === 0) return { text: 'Out', color: '#e74c3c' };
    if (item.quantity <= item.reorder_point) return { text: 'Low', color: '#f39c12' };
    return { text: 'Good', color: '#27ae60' };
  };

  const renderItem = ({ item }) => {
    const status = getStockStatus(item);
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        </View>
        <Text style={styles.itemSku}>SKU: {item.sku || 'N/A'}</Text>
        <View style={styles.itemFooter}>
          <Text style={styles.stockText}>
            Stock: {item.quantity} {item.unit}
          </Text>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => {
              setAdjustItem(item);
              setAdjustQty('');
              setShowAdjustModal(true);
            }}
          >
            <Text style={styles.adjustButtonText}>Adjust</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.locationSelector}>
        <Text style={styles.label}>Location:</Text>
        <View style={styles.locationButtons}>
          {locations.map((loc) => (
            <TouchableOpacity
              key={loc.id}
              style={[
                styles.locationButton,
                selectedLocation === loc.id && styles.locationButtonActive,
              ]}
              onPress={() => setSelectedLocation(loc.id)}
            >
              <Text
                style={[
                  styles.locationButtonText,
                  selectedLocation === loc.id && styles.locationButtonTextActive,
                ]}
              >
                {loc.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={inventory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No inventory items</Text>
        }
      />

      <Modal visible={showAdjustModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Adjust Stock</Text>
            {adjustItem && (
              <>
                <Text style={styles.modalItemName}>{adjustItem.name}</Text>
                <Text style={styles.modalStock}>
                  Current: {adjustItem.quantity} {adjustItem.unit}
                </Text>

                <Text style={styles.inputLabel}>Quantity Change (+/-)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., +10 or -5"
                  keyboardType="numeric"
                  value={adjustQty}
                  onChangeText={setAdjustQty}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setShowAdjustModal(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleAdjust}
                  >
                    <Text style={styles.buttonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  locationSelector: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  locationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  locationButtonActive: {
    backgroundColor: '#4CAF50',
  },
  locationButtonText: {
    fontSize: 14,
    color: '#666',
  },
  locationButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 15,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
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
  itemSku: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
  },
  adjustButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  modalStock: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
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
