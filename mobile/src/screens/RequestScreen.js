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
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-surface border-b border-border">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-3.5 p-2 bg-surface-2 rounded-full border border-border"
        >
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
        <View>
          <Text className="text-text-primary text-base font-bold">New Request</Text>
          <Text className="text-accent text-xs font-medium">
            {technicianName ? `For ${technicianName}` : `Service: ${serviceName || 'General'}`}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View className="mb-5">
            <Text className="text-text-secondary text-[13px] font-medium mb-2">Request Title</Text>
            <View className="bg-surface-2 border border-border rounded-xl px-4">
              <TextInput
                placeholder="e.g., Leaking sink in kitchen"
                placeholderTextColor="#64748b"
                className="text-text-primary text-[15px] h-12"
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text className="text-text-secondary text-[13px] font-medium mb-2">Description</Text>
            <View className="bg-surface-2 border border-border rounded-xl px-4 py-3 min-h-[120px]">
              <TextInput
                placeholder="Describe the issue in detail..."
                placeholderTextColor="#64748b"
                className="text-text-primary text-[15px] text-justify"
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                style={{ textAlignVertical: 'top' }}
              />
            </View>
          </View>

          {/* Location & Budget */}
          <View className="flex-row gap-3 mb-5">
            <View className="flex-1">
              <Text className="text-text-secondary text-[13px] font-medium mb-2">Location</Text>
              <View className="flex-row items-center bg-surface-2 border border-border rounded-xl px-3.5 h-12">
                <MapPin size={16} color="#64748b" />
                <TextInput
                  placeholder="Street / Apt"
                  placeholderTextColor="#64748b"
                  className="flex-1 text-text-primary text-sm ml-2"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>
            <View className="flex-[0.7]">
              <Text className="text-text-secondary text-[13px] font-medium mb-2">Budget (KES)</Text>
              <View className="flex-row items-center bg-surface-2 border border-border rounded-xl px-3.5 h-12">
                <DollarSign size={16} color="#64748b" />
                <TextInput
                  placeholder="Amount"
                  placeholderTextColor="#64748b"
                  className="flex-1 text-text-primary text-sm ml-1.5"
                  keyboardType="numeric"
                  value={budget}
                  onChangeText={setBudget}
                />
              </View>
            </View>
          </View>

          {/* Urgency */}
          <View className="mb-7">
            <Text className="text-text-secondary text-[13px] font-medium mb-3">Urgency Level</Text>
            <View className="flex-row gap-2.5">
              {['low', 'normal', 'urgent'].map((level) => (
                <TouchableOpacity 
                  key={level}
                  onPress={() => setUrgency(level)}
                  className={`flex-1 py-3 items-center rounded-xl border ${
                    urgency === level ? 'bg-accent/10 border-accent' : 'bg-surface-2 border-border'
                  }`}
                >
                  <Text className={`capitalize font-bold text-[13px] ${
                    urgency === level ? 'text-accent' : 'text-text-secondary'
                  }`}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Image Upload Placeholder */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="border-2 border-dashed border-border/60 rounded-2xl p-8 items-center bg-surface mb-7"
          >
            <View className="w-14 h-14 rounded-full bg-surface-2 items-center justify-center mb-3">
              <Camera size={24} color="#64748b" />
            </View>
            <Text className="text-text-primary font-bold text-sm">Add photos of the issue</Text>
            <Text className="text-text-muted text-xs mt-1">PNG, JPG up to 10MB</Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
            className={`py-4 rounded-xl flex-row items-center justify-center bg-accent shadow-lg shadow-accent/40 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white text-[17px] font-extrabold mr-2">Submit Request</Text>
                <Send size={18} color="white" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
