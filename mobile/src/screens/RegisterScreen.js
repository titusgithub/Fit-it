import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Wrench, Mail, Lock, User, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, phone, password, role });
      Alert.alert('Success', 'Account created! Please sign in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (e) {
      Alert.alert('Registration Failed', e.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-8 pt-16 pb-12">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6 w-10 h-10 items-center justify-center bg-surface border border-slate-100 rounded-full">
            <ArrowLeft size={20} color="#475569" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-text-primary tracking-tight">Create Account</Text>
          <Text className="text-text-secondary mt-2 text-lg">Join the Fix-it community today</Text>

          {/* Role Selection */}
          <View className="flex-row mt-8 space-x-4">
            <TouchableOpacity 
              onPress={() => setRole('customer')}
              className={`flex-1 py-4 rounded-2xl border-2 items-center ${role === 'customer' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-surface'}`}
            >
              <User size={24} color={role === 'customer' ? '#4f46e5' : '#64748b'} />
              <Text className={`mt-2 font-bold ${role === 'customer' ? 'text-primary' : 'text-text-secondary'}`}>Customer</Text>
              {role === 'customer' && <View className="absolute top-2 right-2"><CheckCircle2 size={16} color="#4f46e5" /></View>}
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setRole('technician')}
              className={`flex-1 py-4 rounded-2xl border-2 items-center ${role === 'technician' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-surface'}`}
            >
              <Wrench size={24} color={role === 'technician' ? '#4f46e5' : '#64748b'} />
              <Text className={`mt-2 font-bold ${role === 'technician' ? 'text-primary' : 'text-text-secondary'}`}>Technician</Text>
              {role === 'technician' && <View className="absolute top-2 right-2"><CheckCircle2 size={16} color="#4f46e5" /></View>}
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View className="mt-8 space-y-4">
            <View>
              <Text className="text-slate-800 font-bold mb-2 ml-1">Full Name</Text>
              <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                <User size={20} color="#94a3b8" className="mr-3" />
                <TextInput
                  placeholder="John Doe"
                  placeholderTextColor="#cbd5e1"
                  className="flex-1 text-slate-800 text-base font-medium"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-slate-800 font-bold mb-2 ml-1">Email</Text>
              <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                <Mail size={20} color="#94a3b8" className="mr-3" />
                <TextInput
                  placeholder="john@example.com"
                  placeholderTextColor="#cbd5e1"
                  className="flex-1 text-slate-800 text-base font-medium"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-slate-800 font-bold mb-2 ml-1">Phone</Text>
              <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                <Phone size={20} color="#94a3b8" className="mr-3" />
                <TextInput
                  placeholder="+254 700 000000"
                  placeholderTextColor="#cbd5e1"
                  className="flex-1 text-slate-800 text-base font-medium"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-slate-800 font-bold mb-2 ml-1">Password</Text>
              <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                <Lock size={20} color="#94a3b8" className="mr-3" />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#cbd5e1"
                  className="flex-1 text-slate-800 text-base font-medium"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
              className={`bg-[#4f46e5] mt-8 py-4 rounded-2xl flex-row items-center justify-center shadow-xl shadow-indigo-500/40 ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-extrabold tracking-wide">Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-8 items-center">
            <View className="flex-row items-center">
              <Text className="text-text-secondary text-base">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-primary font-bold text-base">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
