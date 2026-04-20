import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Wrench, Mail, Lock, ArrowRight } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigation.replace('Home');
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-8 pt-24 pb-12">
          {/* Logo Section */}
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center shadow-xl shadow-primary/30">
              <Wrench size={40} color="white" />
            </View>
            <Text className="text-4xl font-bold text-text-primary mt-6 tracking-tight">Fix-it</Text>
            <Text className="text-text-secondary mt-2 text-lg">Your neighborhood technician</Text>
          </View>

          {/* Form Section */}
          <View className="space-y-6">
            <View>
              <Text className="text-text-primary font-bold mb-2 ml-1">Email Address</Text>
              <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                <Mail size={20} color="#94a3b8" className="mr-3" />
                <TextInput
                  placeholder="name@example.com"
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
              <Text className="text-text-primary font-bold mb-2 ml-1">Password</Text>
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
              <TouchableOpacity className="mt-4 self-end bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <Text className="text-primary font-bold text-xs">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              className={`bg-[#4f46e5] mt-6 py-4 rounded-2xl flex-row items-center justify-center shadow-xl shadow-indigo-500/40 ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-extrabold tracking-wide mr-2">Sign In to Fix-it</Text>
                  <ArrowRight size={22} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-auto items-center">
            <View className="flex-row items-center">
              <Text className="text-text-secondary text-base">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-primary font-bold text-base">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
