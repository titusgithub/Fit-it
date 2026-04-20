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
      style={{ flex: 1, backgroundColor: '#0a0f1a' }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 100, paddingBottom: 48 }}>
          {/* Logo Section */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <View style={{
              width: 72, height: 72,
              backgroundColor: 'rgba(255, 107, 53, 0.12)',
              borderRadius: 22,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: 'rgba(255, 107, 53, 0.25)',
            }}>
              <Wrench size={36} color="#ff6b35" />
            </View>
            <Text style={{
              fontSize: 32, fontWeight: '900', color: '#f1f5f9',
              marginTop: 20, letterSpacing: -1,
            }}>FindFix</Text>
            <Text style={{
              color: '#94a3b8', marginTop: 6, fontSize: 16,
            }}>Kenya's #1 Technician Marketplace</Text>
          </View>

          {/* Glass Card */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 20,
            padding: 28,
            borderWidth: 1,
            borderColor: 'rgba(148, 163, 184, 0.1)',
          }}>
            <Text style={{
              fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 4,
            }}>Welcome Back</Text>
            <Text style={{
              color: '#94a3b8', marginBottom: 28, fontSize: 14,
            }}>Sign in to your FindFix account</Text>

            {/* Email */}
            <View style={{ marginBottom: 18 }}>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Email Address</Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: '#1a2332',
                borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.1)',
                borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
              }}>
                <Mail size={18} color="#64748b" style={{ marginRight: 12 }} />
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor="#64748b"
                  style={{ flex: 1, color: '#f1f5f9', fontSize: 15 }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ marginBottom: 8 }}>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Password</Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: '#1a2332',
                borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.1)',
                borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
              }}>
                <Lock size={18} color="#64748b" style={{ marginRight: 12 }} />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  style={{ flex: 1, color: '#f1f5f9', fontSize: 15 }}
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
              style={{
                marginTop: 24,
                paddingVertical: 16,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ff6b35',
                shadowColor: '#ff6b35',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 16,
                elevation: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={{
                    color: '#fff', fontSize: 17, fontWeight: '800',
                    letterSpacing: 0.3, marginRight: 6,
                  }}>Sign In</Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={{ marginTop: 'auto', alignItems: 'center', paddingTop: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#94a3b8', fontSize: 15 }}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={{ color: '#ff6b35', fontWeight: '700', fontSize: 15 }}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
