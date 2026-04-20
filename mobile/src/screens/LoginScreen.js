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
        <View className="flex-1 px-7 pt-24 pb-12">
          {/* Logo Section */}
          <View className="items-center mb-12">
            <View className="w-18 h-18 bg-accent/10 rounded-2xl items-center justify-center border border-accent/20">
              <Wrench size={36} color="#ff6b35" />
            </View>
            <Text className="text-3xl font-black text-text-primary mt-5 tracking-tighter">
              FindFix
            </Text>
            <Text className="text-text-secondary mt-1.5 text-base">
              Kenya's #1 Technician Marketplace
            </Text>
          </View>

          {/* Glass Card */}
          <View className="bg-white/5 rounded-2xl p-7 border border-border">
            <Text className="text-2xl font-extrabold text-text-primary mb-1">
              Welcome Back
            </Text>
            <Text className="text-text-secondary mb-7 text-sm">
              Sign in to your FindFix account
            </Text>

            {/* Email */}
            <View className="mb-4.5">
              <Text className="text-text-secondary text-[13px] font-medium mb-2">Email Address</Text>
              <View className="flex-row items-center bg-surface-2 border border-border rounded-xl px-4 py-3.5">
                <Mail size={18} color="#64748b" style={{ marginRight: 12 }} />
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor="#64748b"
                  className="flex-1 text-text-primary text-[15px]"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View className="mb-2">
              <Text className="text-text-secondary text-[13px] font-medium mb-2">Password</Text>
              <View className="flex-row items-center bg-surface-2 border border-border rounded-xl px-4 py-3.5">
                <Lock size={18} color="#64748b" style={{ marginRight: 12 }} />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  className="flex-1 text-text-primary text-[15px]"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              className={`mt-6 py-4 rounded-xl flex-row items-center justify-center bg-accent shadow-lg shadow-accent/40 ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-extrabold tracking-wide mr-1.5">
                    Sign In
                  </Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-auto items-center pt-8">
            <View className="flex-row items-center">
              <Text className="text-text-secondary text-[15px]">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-accent font-bold text-[15px]">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
