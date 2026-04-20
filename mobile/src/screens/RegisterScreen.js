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
        <View className="flex-1 px-7 pt-14 pb-12">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-6 w-10.5 h-10.5 items-center justify-center bg-surface border border-border rounded-full"
          >
            <ArrowLeft size={20} color="#94a3b8" />
          </TouchableOpacity>

          <Text className="text-3xl font-black text-text-primary tracking-tight">Create Account</Text>
          <Text className="text-text-secondary mt-1.5 text-base mb-7">Join the FindFix community today</Text>

          {/* Role Selection */}
          <View className="flex-row gap-3.5 mb-7">
            <TouchableOpacity 
              onPress={() => setRole('customer')}
              className={`flex-1 py-4.5 rounded-2xl items-center border-2 ${
                role === 'customer' ? 'border-accent bg-accent/10' : 'border-border bg-surface'
              }`}
            >
              <User size={24} color={role === 'customer' ? '#ff6b35' : '#64748b'} />
              <Text className={`mt-2 font-bold ${
                role === 'customer' ? 'text-accent' : 'text-text-secondary'
              }`}>Customer</Text>
              {role === 'customer' && (
                <View className="absolute top-2 right-2">
                  <CheckCircle2 size={16} color="#ff6b35" />
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setRole('technician')}
              className={`flex-1 py-4.5 rounded-2xl items-center border-2 ${
                role === 'technician' ? 'border-accent bg-accent/10' : 'border-border bg-surface'
              }`}
            >
              <Wrench size={24} color={role === 'technician' ? '#ff6b35' : '#64748b'} />
              <Text className={`mt-2 font-bold ${
                role === 'technician' ? 'text-accent' : 'text-text-secondary'
              }`}>Technician</Text>
              {role === 'technician' && (
                <View className="absolute top-2 right-2">
                  <CheckCircle2 size={16} color="#ff6b35" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          {[
            { label: 'Full Name', icon: User, placeholder: 'John Doe', value: name, setter: setName, keyboardType: 'default' },
            { label: 'Email', icon: Mail, placeholder: 'john@example.com', value: email, setter: setEmail, keyboardType: 'email-address' },
            { label: 'Phone', icon: Phone, placeholder: '+254 700 000000', value: phone, setter: setPhone, keyboardType: 'phone-pad' },
            { label: 'Password', icon: Lock, placeholder: '••••••••', value: password, setter: setPassword, secure: true },
          ].map((field, index) => {
            const Icon = field.icon;
            return (
              <View key={index} className="mb-4">
                <Text className="text-text-secondary text-[13px] font-medium mb-2">{field.label}</Text>
                <View className="flex-row items-center bg-surface-2 border border-border rounded-xl px-4 py-3.5">
                  <Icon size={18} color="#64748b" style={{ marginRight: 12 }} />
                  <TextInput
                    placeholder={field.placeholder}
                    placeholderTextColor="#64748b"
                    className="flex-1 text-text-primary text-[15px]"
                    keyboardType={field.keyboardType || 'default'}
                    autoCapitalize={field.keyboardType === 'email-address' ? 'none' : 'words'}
                    secureTextEntry={field.secure || false}
                    value={field.value}
                    onChangeText={field.setter}
                  />
                </View>
              </View>
            );
          })}

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
            className={`mt-3 py-4 rounded-xl flex-row items-center justify-center bg-accent shadow-lg shadow-accent/40 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-[17px] font-extrabold tracking-wide">Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View className="mt-7 items-center">
            <View className="flex-row items-center">
              <Text className="text-text-secondary text-[15px]">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-accent font-bold text-[15px]">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
