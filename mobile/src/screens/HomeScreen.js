import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Star, ChevronRight, LogOut, Wrench, Zap, Droplets, Hammer, PenTool, Tv, Smartphone, Snowflake, Sparkles, Camera, KeyRound, Home, Flame } from 'lucide-react-native';
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
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-14 pb-5 bg-surface border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-11 h-11 rounded-2xl bg-accent/10 items-center justify-center border border-accent/25">
              <Image 
                source={{ uri: user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=1e3a5f&color=f1f5f9` }} 
                className="w-9.5 h-9.5 rounded-xl"
              />
            </View>
            <View className="ml-3">
              <Text className="text-text-secondary text-[13px] font-medium">Good Morning,</Text>
              <Text className="text-text-primary text-lg font-extrabold">{user?.name?.split(' ')[0] || 'User'}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2.5">
            <TouchableOpacity className="p-2.5 bg-surface-2 rounded-xl border border-border">
              <Bell size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} className="p-2.5 bg-danger/10 rounded-xl border border-danger/15">
              <LogOut size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="px-6 pt-7 pb-2">
          <View className="self-start px-3.5 py-1.5 bg-accent/10 border border-accent/20 rounded-full mb-4">
            <Text className="text-accent text-[13px] font-semibold">🇰🇪 Kenya's #1 Technician Marketplace</Text>
          </View>
          
          <Text className="text-[30px] font-black text-text-primary leading-9 tracking-tighter mb-2.5">
            Find Verified{'\n'}
            <Text className="text-accent">Technicians</Text> Near You
          </Text>
          <Text className="text-text-secondary text-[15px] leading-6 mb-6 max-w-[320px]">
            From plumbing to electronics — connect with skilled, verified professionals. Pay securely with M-Pesa.
          </Text>

          {/* Search Bar */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.8}
            className="flex-row items-center bg-surface border border-border rounded-2xl px-4.5 py-4 shadow-lg shadow-black/30"
          >
            <Search size={20} color="#64748b" />
            <Text className="flex-1 text-text-muted text-[15px] ml-3">
              Search services or technicians...
            </Text>
            <View className="bg-accent rounded-xl px-4 py-2">
              <Text className="text-white font-bold text-[13px]">Search</Text>
            </View>
          </TouchableOpacity>

          {/* Popular Tags */}
          <View className="flex-row items-center flex-wrap gap-2 mt-4">
            <Text className="text-text-muted text-[13px]">Popular:</Text>
            {['Plumbing', 'Electrical', 'Phone Repair', 'Cleaning'].map((tag) => (
              <TouchableOpacity key={tag} className="px-3 py-1.5 bg-white/5 border border-border rounded-full">
                <Text className="text-text-secondary text-[12px]">{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Row */}
        <View className="px-6 mt-7">
          <View className="flex-row flex-wrap gap-2.5">
            {STATS.map((stat, i) => (
              <View key={i} className="flex-1 min-w-[45%] bg-surface border border-border rounded-2xl p-4.5 items-center">
                <Text className="text-xl font-extrabold text-accent">{stat.number}</Text>
                <Text className="text-[11px] text-text-secondary mt-1">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Services Grid */}
        <View className="px-6 mt-9">
          <View className="items-center mb-6">
            <Text className="text-2xl font-extrabold text-text-primary">Our Services</Text>
            <Text className="text-text-secondary text-sm mt-1.5 text-center">
              Browse through our professional services
            </Text>
          </View>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {SERVICES.map((service, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => navigation.navigate('Search', { service: service.name })}
                activeOpacity={0.7}
                className="w-[48%] bg-surface border border-border rounded-2xl p-4.5"
              >
                <Text className="text-2xl mb-2.5">{service.emoji}</Text>
                <Text className="text-sm font-bold text-text-primary mb-1">{service.name}</Text>
                <Text className="text-xs text-text-secondary leading-4">{service.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View className="mt-9 py-9 px-6 bg-surface border-y border-border">
          <View className="items-center mb-6">
            <Text className="text-2xl font-extrabold text-text-primary">How It Works</Text>
            <Text className="text-text-secondary text-sm mt-1.5 text-center">
              Getting your problems fixed is easy
            </Text>
          </View>
          <View className="gap-4">
            {STEPS.map((item, i) => (
              <View key={i} className="bg-background border border-border rounded-2xl p-5 flex-row items-center">
                <Text className="text-3xl font-black text-accent/15 mr-4">{item.step}</Text>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-xl">{item.emoji}</Text>
                    <Text className="text-base font-bold text-text-primary">{item.title}</Text>
                  </View>
                  <Text className="text-[13px] text-text-secondary leading-5">{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Popular Technicians */}
        <View className="px-6 mt-9">
          <Text className="text-2xl font-extrabold text-text-primary mb-4.5">Popular Technicians</Text>
          
          {loading ? (
            <ActivityIndicator color="#ff6b35" size="large" className="py-10" />
          ) : technicians.length > 0 ? (
            <View className="gap-3.5">
              {technicians.map((tech) => (
                <TouchableOpacity
                  key={tech.id}
                  activeOpacity={0.7}
                  className="bg-surface border border-border rounded-2xl p-4.5 flex-row items-center"
                >
                  <View className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-2">
                    <Image
                      source={{ uri: tech.avatar_url || `https://ui-avatars.com/api/?name=${tech.name}&background=1e3a5f&color=f1f5f9` }}
                      className="w-14 h-14"
                    />
                  </View>
                  <View className="ml-3.5 flex-1">
                    <Text className="text-base font-bold text-text-primary">{tech.name}</Text>
                    <Text className="text-[13px] text-text-secondary mt-0.5" numberOfLines={1}>
                      {tech.bio || 'Professional Technician'}
                    </Text>
                    <View className="flex-row items-center mt-1.5 gap-1.5">
                      <Star size={13} color="#f59e0b" fill="#f59e0b" />
                      <Text className="text-xs font-bold text-text-primary">
                        {Number(tech.avg_rating || 5).toFixed(1)}
                      </Text>
                      <Text className="text-xs text-text-muted">
                        • {tech.total_jobs || 0} jobs done
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#64748b" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="py-10 items-center">
              <Text className="text-text-secondary">No technicians available yet</Text>
            </View>
          )}
        </View>

        {/* CTA Section */}
        <View className="px-6 mt-9 mb-10">
          <View className="rounded-3xl p-8 items-center bg-accent/5 border border-accent/15">
            <Text className="text-2xl font-extrabold text-text-primary text-center mb-2">
              Ready to Get Started?
            </Text>
            <Text className="text-sm text-text-secondary text-center mb-6">
              Join thousands of satisfied customers and verified technicians on FindFix
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => navigation.navigate('Search')}
                className="bg-accent rounded-2xl py-3.5 px-5.5 shadow-lg shadow-accent/30"
              >
                <Text className="text-white font-bold text-sm">Find a Tech</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                className="rounded-2xl py-3.5 px-5.5 border-2 border-accent"
              >
                <Text className="text-accent font-bold text-sm">Join as Tech</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
