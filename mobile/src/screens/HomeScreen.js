import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Star, ChevronRight, LogOut, Wrench, Zap, Droplets, Hammer, PenTool, Tv, Smartphone, Snowflake, Sparkles, Camera, KeyRound, Home, Flame, Truck } from 'lucide-react-native';
import api from '../services/api';

const SERVICES = [
  { name: 'Plumbing', icon: Droplets, emoji: '🔧', desc: 'Pipes, taps & water systems', color: '#3b82f6' },
  { name: 'Electrical', icon: Zap, emoji: '⚡', desc: 'Wiring & electrical repairs', color: '#eab308' },
  { name: 'Carpentry', icon: Hammer, emoji: '🪚', desc: 'Furniture & woodwork', color: '#f97316' },
  { name: 'Painting', icon: PenTool, emoji: '🎨', desc: 'Interior & exterior painting', color: '#a855f7' },
  { name: 'Appliance Repair', icon: Tv, emoji: '📺', desc: 'TVs, fridges & electronics', color: '#ef4444' },
  { name: 'Phone Repair', icon: Smartphone, emoji: '📱', desc: 'Screens & phone fixes', color: '#10b981' },
  { name: 'AC & Refrigeration', icon: Snowflake, emoji: '❄️', desc: 'Cooling systems', color: '#06b6d4' },
  { name: 'Cleaning', icon: Sparkles, emoji: '🧹', desc: 'Deep cleaning services', color: '#8b5cf6' },
  { name: 'CCTV Installation', icon: Camera, emoji: '📹', desc: 'Security cameras', color: '#64748b' },
  { name: 'Locksmith', icon: KeyRound, emoji: '🔐', desc: 'Locks & security', color: '#f43f5e' },
  { name: 'Roofing', icon: Home, emoji: '🏠', desc: 'Roof repair & installation', color: '#0ea5e9' },
  { name: 'Welding', icon: Flame, emoji: '🔥', desc: 'Metal fabrication', color: '#fb923c' },
];

const STATS = [
  { number: '2,500+', label: 'Verified Technicians' },
  { number: '15,000+', label: 'Jobs Completed' },
  { number: '4.8★', label: 'Average Rating' },
  { number: '47', label: 'Counties Covered' },
];

const STEPS = [
  { step: '01', title: 'Search', desc: 'Find the right technician by service type and your location.', emoji: '🔍' },
  { step: '02', title: 'Request', desc: 'Describe your problem, set a budget, and post your request.', emoji: '📝' },
  { step: '03', title: 'Connect', desc: 'Chat with technicians, compare quotes, and choose the best fit.', emoji: '💬' },
  { step: '04', title: 'Pay Securely', desc: 'Pay via M-Pesa only when the job is done to your satisfaction.', emoji: '💰' },
];

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/technicians?limit=5');
      setTechnicians(res.data.technicians || []);
    } catch (e) {
      console.error('Fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f1a' }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20,
        backgroundColor: '#111827',
        borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.1)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: 'rgba(255,107,53,0.12)', alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: 'rgba(255,107,53,0.25)',
            }}>
              <Image 
                source={{ uri: user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=1e3a5f&color=f1f5f9` }} 
                style={{ width: 38, height: 38, borderRadius: 12 }}
              />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500' }}>Good Morning,</Text>
              <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '800' }}>{user?.name?.split(' ')[0] || 'User'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity style={{
              padding: 10, backgroundColor: '#1a2332', borderRadius: 12,
              borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
            }}>
              <Bell size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={{
              padding: 10, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12,
              borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)',
            }}>
              <LogOut size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 8 }}>
          <View style={{
            alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6,
            backgroundColor: 'rgba(255,107,53,0.1)',
            borderWidth: 1, borderColor: 'rgba(255,107,53,0.2)',
            borderRadius: 999, marginBottom: 16,
          }}>
            <Text style={{ color: '#ff6b35', fontSize: 13, fontWeight: '600' }}>🇰🇪 Kenya's #1 Technician Marketplace</Text>
          </View>
          
          <Text style={{
            fontSize: 30, fontWeight: '900', color: '#f1f5f9',
            lineHeight: 36, letterSpacing: -1, marginBottom: 10,
          }}>
            Find Verified{'\n'}
            <Text style={{ color: '#ff6b35' }}>Technicians</Text> Near You
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 15, lineHeight: 24, marginBottom: 24, maxWidth: 320 }}>
            From plumbing to electronics — connect with skilled, verified professionals. Pay securely with M-Pesa.
          </Text>

          {/* Search Bar */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#111827',
              borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
              borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16,
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
            }}
          >
            <Search size={20} color="#64748b" />
            <Text style={{ flex: 1, color: '#64748b', fontSize: 15, marginLeft: 12 }}>
              Search services or technicians...
            </Text>
            <View style={{
              backgroundColor: '#ff6b35', borderRadius: 10,
              paddingHorizontal: 16, paddingVertical: 8,
            }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Search</Text>
            </View>
          </TouchableOpacity>

          {/* Popular Tags */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
            <Text style={{ color: '#64748b', fontSize: 13 }}>Popular:</Text>
            {['Plumbing', 'Electrical', 'Phone Repair', 'Cleaning'].map((tag) => (
              <TouchableOpacity key={tag} style={{
                paddingHorizontal: 12, paddingVertical: 6,
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
                borderRadius: 999,
              }}>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Row */}
        <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {STATS.map((stat, i) => (
              <View key={i} style={{
                flex: 1, minWidth: '45%',
                backgroundColor: '#111827',
                borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
                borderRadius: 16, padding: 18, alignItems: 'center',
              }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#ff6b35' }}>{stat.number}</Text>
                <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Services Grid */}
        <View style={{ paddingHorizontal: 24, marginTop: 36 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#f1f5f9' }}>Our Services</Text>
            <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 6, textAlign: 'center' }}>
              Browse through our professional services
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {SERVICES.map((service, i) => {
              const Icon = service.icon;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => navigation.navigate('Search', { service: service.name })}
                  activeOpacity={0.7}
                  style={{
                    width: '47%',
                    backgroundColor: '#111827',
                    borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
                    borderRadius: 16, padding: 18,
                  }}
                >
                  <Text style={{ fontSize: 28, marginBottom: 10 }}>{service.emoji}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 }}>{service.name}</Text>
                  <Text style={{ fontSize: 12, color: '#94a3b8', lineHeight: 18 }}>{service.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* How It Works */}
        <View style={{
          marginTop: 36, paddingVertical: 36, paddingHorizontal: 24,
          backgroundColor: '#111827',
          borderTopWidth: 1, borderBottomWidth: 1,
          borderColor: 'rgba(148,163,184,0.1)',
        }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#f1f5f9' }}>How It Works</Text>
            <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 6, textAlign: 'center' }}>
              Getting your problems fixed is easy
            </Text>
          </View>
          <View style={{ gap: 16 }}>
            {STEPS.map((item, i) => (
              <View key={i} style={{
                backgroundColor: '#0a0f1a',
                borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
                borderRadius: 16, padding: 20,
                flexDirection: 'row', alignItems: 'center',
              }}>
                <Text style={{ fontSize: 32, fontWeight: '900', color: 'rgba(255,107,53,0.15)', marginRight: 16 }}>{item.step}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#f1f5f9' }}>{item.title}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: '#94a3b8', lineHeight: 20 }}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Popular Technicians */}
        <View style={{ paddingHorizontal: 24, marginTop: 36 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 18 }}>Popular Technicians</Text>
          
          {loading ? (
            <ActivityIndicator color="#ff6b35" size="large" style={{ paddingVertical: 40 }} />
          ) : technicians.length > 0 ? (
            <View style={{ gap: 14 }}>
              {technicians.map((tech) => (
                <TouchableOpacity
                  key={tech.id}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: '#111827',
                    borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
                    borderRadius: 16, padding: 18,
                    flexDirection: 'row', alignItems: 'center',
                  }}
                >
                  <View style={{
                    width: 56, height: 56, borderRadius: 16, overflow: 'hidden',
                    backgroundColor: '#1a2332',
                  }}>
                    <Image
                      source={{ uri: tech.avatar_url || `https://ui-avatars.com/api/?name=${tech.name}&background=1e3a5f&color=f1f5f9` }}
                      style={{ width: 56, height: 56 }}
                    />
                  </View>
                  <View style={{ marginLeft: 14, flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#f1f5f9' }}>{tech.name}</Text>
                    <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }} numberOfLines={1}>
                      {tech.bio || 'Professional Technician'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 }}>
                      <Star size={13} color="#f59e0b" fill="#f59e0b" />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#f1f5f9' }}>
                        {Number(tech.avg_rating || 5).toFixed(1)}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>
                        • {tech.total_jobs || 0} jobs done
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#64748b" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ color: '#94a3b8' }}>No technicians available yet</Text>
            </View>
          )}
        </View>

        {/* CTA Section */}
        <View style={{ paddingHorizontal: 24, marginTop: 36, marginBottom: 40 }}>
          <View style={{
            borderRadius: 20, padding: 32, alignItems: 'center',
            backgroundColor: 'rgba(255,107,53,0.06)',
            borderWidth: 1, borderColor: 'rgba(255,107,53,0.15)',
          }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#f1f5f9', textAlign: 'center', marginBottom: 8 }}>
              Ready to Get Started?
            </Text>
            <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 24 }}>
              Join thousands of satisfied customers and verified technicians on FindFix
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Search')}
                style={{
                  backgroundColor: '#ff6b35', borderRadius: 14,
                  paddingVertical: 14, paddingHorizontal: 22,
                  shadowColor: '#ff6b35', shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Find a Technician</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={{
                  borderRadius: 14, paddingVertical: 14, paddingHorizontal: 22,
                  borderWidth: 2, borderColor: '#ff6b35',
                }}
              >
                <Text style={{ color: '#ff6b35', fontWeight: '700', fontSize: 14 }}>Join as Tech</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
