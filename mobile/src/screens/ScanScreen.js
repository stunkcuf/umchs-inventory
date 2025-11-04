import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

export default function ScanScreen() {
  const [sku, setSku] = useState('');

  const handleScan = () => {
    if (!sku) {
      Alert.alert('Error', 'Please enter a SKU');
      return;
    }

    Alert.alert(
      'Feature Coming Soon',
      'Barcode scanning and SKU lookup will be available in the next version!'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scan Item</Text>
        <Text style={styles.subtitle}>
          Enter SKU or scan barcode to quickly lookup items
        </Text>

        <View style={styles.scanArea}>
          <Text style={styles.scanIcon}>📷</Text>
          <Text style={styles.scanText}>Camera scanning coming soon</Text>
        </View>

        <View style={styles.manualSection}>
          <Text style={styles.label}>Manual SKU Entry</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter SKU"
            value={sku}
            onChangeText={setSku}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.lookupButton} onPress={handleScan}>
            <Text style={styles.buttonText}>Lookup Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📱 Coming Features:</Text>
          <Text style={styles.infoText}>• Barcode/QR code scanning</Text>
          <Text style={styles.infoText}>• Quick stock adjustments</Text>
          <Text style={styles.infoText}>• Item location finder</Text>
          <Text style={styles.infoText}>• Batch scanning</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  scanArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  scanIcon: {
    fontSize: 64,
    marginBottom: 10,
  },
  scanText: {
    fontSize: 16,
    color: '#999',
  },
  manualSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  lookupButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
