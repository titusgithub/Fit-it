import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, DollarSign, Camera, Send } from 'lucide-react-native';
import api from '../services/api';

export default function RequestScreen({ route, navigation }) {
  const { serviceId, serviceName, technicianId, technicianName } = route.params || {};
  const { token } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !location || !budget) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/requests', {
        service_id: serviceId,
        technician_id: technicianId,
        title,
        description,
        location,
        budget: parseFloat(budget),
        urgency,
      });

      Alert.alert('Success', 'Your request has been submitted!', [
        { text: 'View My Requests', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f1a' }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16,
        backgroundColor: '#111827',
        borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.1)',
        flexDirection: 'row', alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            marginRight: 14, padding: 8,
            backgroundColor: '#1a2332', borderRadius: 99,
            borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
          }}
        >
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
        <View>
          <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700' }}>New Request</Text>
          <Text style={{ color: '#ff6b35', fontSize: 12, fontWeight: '500' }}>
            {technicianName ? `For ${technicianName}` : `Service: ${serviceName || 'General'}`}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Request Title</Text>
            <View style={{
              backgroundColor: '#1a2332',
              borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
              borderRadius: 12, paddingHorizontal: 16,
            }}>
              <TextInput
                placeholder="e.g., Leaking sink in kitchen"
                placeholderTextColor="#64748b"
                style={{ color: '#f1f5f9', fontSize: 15, height: 50 }}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Description */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Description</Text>
            <View style={{
              backgroundColor: '#1a2332',
              borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
              borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
              minHeight: 120,
            }}>
              <TextInput
                placeholder="Describe the issue in detail..."
                placeholderTextColor="#64748b"
                style={{ color: '#f1f5f9', fontSize: 15, textAlignVertical: 'top' }}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Location & Budget */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Location</Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: '#1a2332',
                borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
                borderRadius: 12, paddingHorizontal: 14, height: 50,
              }}>
                <MapPin size={16} color="#64748b" />
                <TextInput
                  placeholder="Street / Apt"
                  placeholderTextColor="#64748b"
                  style={{ flex: 1, color: '#f1f5f9', fontSize: 14, marginLeft: 8 }}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>
            <View style={{ flex: 0.7 }}>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Budget (KES)</Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: '#1a2332',
                borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
                borderRadius: 12, paddingHorizontal: 14, height: 50,
              }}>
                <DollarSign size={16} color="#64748b" />
                <TextInput
                  placeholder="Amount"
                  placeholderTextColor="#64748b"
                  style={{ flex: 1, color: '#f1f5f9', fontSize: 14, marginLeft: 6 }}
                  keyboardType="numeric"
                  value={budget}
                  onChangeText={setBudget}
                />
              </View>
            </View>
          </View>

          {/* Urgency */}
          <View style={{ marginBottom: 28 }}>
            <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 12 }}>Urgency Level</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {['low', 'normal', 'urgent'].map((level) => (
                <TouchableOpacity 
                  key={level}
                  onPress={() => setUrgency(level)}
                  style={{
                    flex: 1, paddingVertical: 12, alignItems: 'center',
                    borderRadius: 12,
                    borderWidth: 1,
                    backgroundColor: urgency === level ? 'rgba(255,107,53,0.1)' : '#1a2332',
                    borderColor: urgency === level ? '#ff6b35' : 'rgba(148,163,184,0.1)',
                  }}
                >
                  <Text style={{
                    textTransform: 'capitalize', fontWeight: '700', fontSize: 13,
                    color: urgency === level ? '#ff6b35' : '#94a3b8',
                  }}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Image Upload Placeholder */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              borderWidth: 2, borderStyle: 'dashed',
              borderColor: 'rgba(148,163,184,0.15)',
              borderRadius: 16, padding: 32, alignItems: 'center',
              backgroundColor: '#111827', marginBottom: 28,
            }}
          >
            <View style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: '#1a2332', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Camera size={24} color="#64748b" />
            </View>
            <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 14 }}>Add photos of the issue</Text>
            <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>PNG, JPG up to 10MB</Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              paddingVertical: 16, borderRadius: 14,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#ff6b35',
              shadowColor: '#ff6b35', shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800', marginRight: 8 }}>Submit Request</Text>
                <Send size={18} color="white" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
