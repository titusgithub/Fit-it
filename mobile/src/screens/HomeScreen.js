import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Bell, Star, ChevronRight, Settings, LogOut, Package, Zap, Droplets, Hammer, PenTool, Radio, ShieldCheck } from 'lucide-react-native';
import api from '../services/api';

const SERVICE_CATEGORIES = [
  { id: '1', name: 'Plumbing', icon: Droplets, color: '#3b82f6' },
  { id: '2', name: 'Electrical', icon: Zap, color: '#eab308' },
  { id: '3', name: 'Carpentry', icon: Hammer, color: '#f97316' },
  { id: '4', name: 'Painting', icon: PenTool, color: '#a855f7' },
  { id: '5', name: 'Cleaning', icon: ShieldCheck, color: '#10b981' },
  { id: '6', name: 'Electronics', icon: Radio, color: '#ef4444' },
];

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [services, setServices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesRes, techsRes] = await Promise.all([
        api.get('/services'),
        api.get('/technicians?limit=5')
      ]);
      setServices(servicesRes.data);
      setTechnicians(techsRes.data.technicians || []);
    } catch (e) {
      console.error('Fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View className="px-6 pt-16 pb-6 bg-surface border-b border-slate-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center border border-primary/20">
            <Image 
              source={{ uri: user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff` }} 
              className="w-10 h-10 rounded-xl"
            />
          </View>
          <View className="ml-3">
            <Text className="text-text-secondary text-sm font-medium">Good Morning,</Text>
            <Text className="text-text-primary text-xl font-bold">{user?.name?.split(' ')[0]}</Text>
          </View>
        </View>
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity className="p-2 bg-slate-50 rounded-xl border border-slate-100">
            <Bell size={22} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} className="p-2 bg-red-50 rounded-xl border border-red-100">
            <LogOut size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-8">
        <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 shadow-sm">
          <Search size={20} color="#94a3b8" className="mr-3" />
          <TextInput
            placeholder="Search for services or technicians..."
            placeholderTextColor="#94a3b8"
            className="flex-1 text-text-primary text-base"
          />
        </View>
      </View>
    </View>
  );

  const renderCategory = ({ item }) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity className="items-center mr-6">
        <View 
          className="w-16 h-16 rounded-2xl items-center justify-center mb-2 shadow-sm"
          style={{ backgroundColor: `${item.color}15`, borderContent: `1px solid ${item.color}30` }}
        >
          <Icon size={28} color={item.color} />
        </View>
        <Text className="text-text-primary text-xs font-semibold">{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {renderHeader()}
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View className="mt-8 px-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-text-primary text-xl font-bold">Categories</Text>
            <TouchableOpacity><Text className="text-primary font-semibold">See All</Text></TouchableOpacity>
          </View>
          <FlatList
            data={SERVICE_CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pb-2"
          />
        </View>

        {/* Promo Section */}
        <TouchableOpacity activeOpacity={0.9} className="mx-6 mt-8 rounded-3xl bg-[#4f46e5] overflow-hidden relative shadow-2xl shadow-indigo-500/40 h-[180px]">
          {/* Decorative Elements */}
          <View className="absolute right-[-30] top-[-30] w-56 h-56 rounded-full bg-white/10" />
          <View className="absolute left-[-20] bottom-[-40] w-32 h-32 rounded-full bg-white/10" />
          
          <View className="p-8 z-10 flex-1 justify-center">
            <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-3">
              <Text className="text-white text-xs font-bold tracking-widest uppercase">Special Offer</Text>
            </View>
            <Text className="text-white text-3xl font-extrabold tracking-tight">20% OFF</Text>
            <Text className="text-indigo-100 text-sm mt-1 mb-4 font-medium">on your first plumbing repair</Text>
            
            <View className="bg-white py-2.5 px-6 rounded-2xl self-start shadow-sm flex-row items-center">
              <Text className="text-primary font-bold mr-1">Claim Now</Text>
              <ChevronRight size={16} color="#4f46e5" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Featured Section */}
        <View className="mt-10 px-6 pb-12">
          <Text className="text-text-primary text-xl font-bold mb-6">Popular Technicians</Text>
          
          {loading ? (
            <ActivityIndicator color="#4f46e5" size="large" className="py-20" />
          ) : technicians.length > 0 ? (
            <View className="space-y-4">
              {technicians.map((tech) => (
                <TouchableOpacity key={tech.id} className="bg-surface rounded-3xl p-5 border border-slate-100 flex-row items-center shadow-sm">
                  <Image 
                    source={{ uri: tech.avatar_url || `https://ui-avatars.com/api/?name=${tech.name}&background=6366f1&color=fff` }} 
                    className="w-16 h-16 rounded-2xl"
                  />
                  <View className="ml-4 flex-1">
                    <Text className="text-text-primary text-lg font-bold">{tech.name}</Text>
                    <Text className="text-text-secondary text-sm" numberOfLines={1}>{tech.bio || 'Professional Technician'}</Text>
                    <View className="flex-row items-center mt-1">
                      <Star size={14} color="#eab308" fill="#eab308" className="mr-1" />
                      <Text className="text-text-primary text-xs font-bold mr-2">{Number(tech.avg_rating || 5).toFixed(1)}</Text>
                      <Text className="text-text-muted text-xs">• {tech.total_jobs || 0} jobs done</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#94a3b8" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="py-10 items-center justify-center">
              <Text className="text-text-secondary">No technicians available at the moment</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Floating Bar mockup */}
      <View className="absolute bottom-8 left-6 right-6 bg-surface h-16 rounded-full border border-slate-100 shadow-2xl flex-row items-center justify-around px-2">
        <TouchableOpacity className="w-12 h-12 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/40">
          <Zap size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="w-12 h-12 rounded-full items-center justify-center">
          <Package size={24} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity className="w-12 h-12 rounded-full items-center justify-center">
          <Search size={24} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity className="w-12 h-12 rounded-full items-center justify-center">
          <Settings size={24} color="#64748b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
