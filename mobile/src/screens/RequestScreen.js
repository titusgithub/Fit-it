import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, DollarSign, Calendar, Info, Camera, Send } from 'lucide-react-native';
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
      <View className="px-6 pt-16 pb-4 bg-white/90 border-b border-slate-100 flex-row items-center shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-2 bg-slate-50 rounded-full border border-slate-100">
          <ArrowLeft size={20} color="#475569" />
        </TouchableOpacity>
        <View>
          <Text className="text-slate-800 text-base font-bold">New Request</Text>
          <Text className="text-[#4f46e5] font-medium text-xs font-medium">
            {technicianName ? `For ${technicianName}` : `Service: ${serviceName || 'General'}`}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 pt-8 pb-12" showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View className="mb-6">
            <Text className="text-slate-800 font-bold mb-2 ml-1">Request Title</Text>
            <View className="bg-white border border-slate-100 rounded-2xl px-5 py-2 shadow-sm">
              <TextInput
                placeholder="e.g., Leaking sink in kitchen"
                placeholderTextColor="#cbd5e1"
                className="text-slate-800 text-base font-medium h-12"
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-slate-800 font-bold mb-2 ml-1">Description</Text>
            <View className="bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm min-h-[120px]">
              <TextInput
                placeholder="Describe the issue in detail..."
                placeholderTextColor="#cbd5e1"
                className="text-slate-800 text-base font-medium"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Location & Budget */}
          <View className="flex-row space-x-4 mb-6">
            <View className="flex-1">
              <Text className="text-slate-800 font-bold mb-2 ml-1">Location</Text>
              <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm h-[56px]">
                <MapPin size={18} color="#94a3b8" className="mr-2" />
                <TextInput
                  placeholder="Street / Apt"
                  placeholderTextColor="#cbd5e1"
                  className="flex-1 text-slate-800 text-base font-medium p-0"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>
            <View className="flex-[0.8]">
              <Text className="text-slate-800 font-bold mb-2 ml-1">Budget</Text>
              <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm h-[56px]">
                <DollarSign size={18} color="#94a3b8" className="mr-1" />
                <TextInput
                  placeholder="Amount"
                  placeholderTextColor="#cbd5e1"
                  className="flex-1 text-slate-800 text-base font-medium p-0"
                  keyboardType="numeric"
                  value={budget}
                  onChangeText={setBudget}
                />
              </View>
            </View>
          </View>

          {/* Urgency */}
          <View className="mb-8">
            <Text className="text-slate-800 font-bold mb-4 ml-1">Urgency Level</Text>
            <View className="flex-row space-x-3">
              {['low', 'normal', 'urgent'].map((level) => (
                <TouchableOpacity 
                  key={level}
                  onPress={() => setUrgency(level)}
                  className={`flex-1 py-3 items-center rounded-2xl border ${urgency === level ? 'bg-[#4f46e5]/10 border-[#4f46e5]' : 'bg-white border-slate-100 shadow-sm'}`}
                >
                  <Text className={`capitalize font-bold ${urgency === level ? 'text-[#4f46e5]' : 'text-slate-500'}`}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Image Upload Placeholder */}
          <TouchableOpacity activeOpacity={0.7} className="border-2 border-dashed border-slate-200 rounded-3xl p-8 items-center bg-white mb-8 shadow-sm">
            <View className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center mb-3">
              <Camera size={28} color="#94a3b8" />
            </View>
            <Text className="text-slate-800 mt-2 font-bold">Add photos of the issue</Text>
            <Text className="text-slate-400 text-xs mt-1 font-medium">PNG, JPG up to 10MB</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
            className={`bg-[#4f46e5] py-4 rounded-2xl flex-row items-center justify-center shadow-xl shadow-indigo-500/40 mb-12 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white text-lg font-extrabold tracking-wide mr-2">Submit Request</Text>
                <Send size={18} color="white" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
