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
      style={{ flex: 1, backgroundColor: '#0a0f1a' }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 56, paddingBottom: 48 }}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              marginBottom: 24, width: 42, height: 42,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#111827',
              borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
              borderRadius: 99,
            }}
          >
            <ArrowLeft size={20} color="#94a3b8" />
          </TouchableOpacity>

          <Text style={{ fontSize: 28, fontWeight: '900', color: '#f1f5f9', letterSpacing: -0.5 }}>Create Account</Text>
          <Text style={{ color: '#94a3b8', marginTop: 6, fontSize: 16, marginBottom: 28 }}>Join the FindFix community today</Text>

          {/* Role Selection */}
          <View style={{ flexDirection: 'row', gap: 14, marginBottom: 28 }}>
            <TouchableOpacity 
              onPress={() => setRole('customer')}
              style={{
                flex: 1, paddingVertical: 18, borderRadius: 16, alignItems: 'center',
                borderWidth: 2,
                borderColor: role === 'customer' ? '#ff6b35' : 'rgba(148,163,184,0.1)',
                backgroundColor: role === 'customer' ? 'rgba(255,107,53,0.08)' : '#111827',
              }}
            >
              <User size={24} color={role === 'customer' ? '#ff6b35' : '#64748b'} />
              <Text style={{
                marginTop: 8, fontWeight: '700',
                color: role === 'customer' ? '#ff6b35' : '#94a3b8',
              }}>Customer</Text>
              {role === 'customer' && (
                <View style={{ position: 'absolute', top: 8, right: 8 }}>
                  <CheckCircle2 size={16} color="#ff6b35" />
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setRole('technician')}
              style={{
                flex: 1, paddingVertical: 18, borderRadius: 16, alignItems: 'center',
                borderWidth: 2,
                borderColor: role === 'technician' ? '#ff6b35' : 'rgba(148,163,184,0.1)',
                backgroundColor: role === 'technician' ? 'rgba(255,107,53,0.08)' : '#111827',
              }}
            >
              <Wrench size={24} color={role === 'technician' ? '#ff6b35' : '#64748b'} />
              <Text style={{
                marginTop: 8, fontWeight: '700',
                color: role === 'technician' ? '#ff6b35' : '#94a3b8',
              }}>Technician</Text>
              {role === 'technician' && (
                <View style={{ position: 'absolute', top: 8, right: 8 }}>
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
              <View key={index} style={{ marginBottom: 16 }}>
                <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>{field.label}</Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: '#1a2332',
                  borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.1)',
                  borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
                }}>
                  <Icon size={18} color="#64748b" style={{ marginRight: 12 }} />
                  <TextInput
                    placeholder={field.placeholder}
                    placeholderTextColor="#64748b"
                    style={{ flex: 1, color: '#f1f5f9', fontSize: 15 }}
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
            style={{
              marginTop: 12,
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
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 }}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={{ marginTop: 28, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#94a3b8', fontSize: 15 }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{ color: '#ff6b35', fontWeight: '700', fontSize: 15 }}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
