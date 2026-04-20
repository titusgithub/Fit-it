import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { ArrowLeft, Search, Star, MapPin, ChevronRight } from 'lucide-react-native';
import api from '../services/api';

function StarRating({ rating }) {
  return (
    <View className="flex-row gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} className={`text-xs ${i <= Math.round(rating) ? 'text-warning' : 'text-text-muted'}`}>★</Text>
      ))}
    </View>
  );
}

export default function SearchScreen({ route, navigation }) {
  const initialService = route?.params?.service || '';
  const [services, setServices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    service: initialService,
    location: '',
    search: '',
  });

  useEffect(() => {
    fetchServices();
    fetchTechnicians();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.service) params.set('service', filters.service);
      if (filters.location) params.set('location', filters.location);
      if (filters.search) params.set('search', filters.search);
      params.set('verified', 'true');

      const res = await api.get(`/technicians?${params.toString()}`);
      setTechnicians(res.data.technicians || []);
    } catch (e) {
      console.error(e);
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-surface border-b border-border">
        <View className="flex-row items-center mb-4.5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3.5 p-2 bg-surface-2 rounded-full border border-border"
          >
            <ArrowLeft size={20} color="#94a3b8" />
          </TouchableOpacity>
          <View>
            <Text className="text-text-primary text-xl font-extrabold">Find Technicians</Text>
            <Text className="text-text-secondary text-[13px]">Browse verified professionals near you</Text>
          </View>
        </View>

        {/* Search Input */}
        <View className="flex-row items-center bg-surface-2 border border-border rounded-xl px-3.5 py-3 mb-3">
          <Search size={18} color="#64748b" />
          <TextInput
            placeholder="Search by name..."
            placeholderTextColor="#64748b"
            className="flex-1 text-text-primary text-sm ml-2.5"
            value={filters.search}
            onChangeText={(t) => setFilters({ ...filters, search: t })}
            onSubmitEditing={fetchTechnicians}
          />
        </View>

        {/* Filters Row */}
        <View className="flex-row gap-2.5">
          <View className="flex-1 flex-row items-center bg-surface-2 border border-border rounded-xl px-3.5 py-3">
            <MapPin size={16} color="#64748b" />
            <TextInput
              placeholder="Location..."
              placeholderTextColor="#64748b"
              className="flex-1 text-text-primary text-[13px] ml-2"
              value={filters.location}
              onChangeText={(t) => setFilters({ ...filters, location: t })}
            />
          </View>
          <TouchableOpacity
            onPress={fetchTechnicians}
            className="bg-accent rounded-xl px-5 justify-center shadow-md shadow-accent/30"
          >
            <Text className="text-white font-bold text-sm">Search</Text>
          </TouchableOpacity>
        </View>

        {/* Service Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3.5 pt-1">
          <TouchableOpacity
            onPress={() => { setFilters({ ...filters, service: '' }); }}
            className={`px-3.5 py-2 mr-2 rounded-full border ${
              !filters.service ? 'bg-accent border-accent' : 'bg-surface-2 border-border'
            }`}
          >
            <Text className={`text-xs font-semibold ${!filters.service ? 'text-white' : 'text-text-secondary'}`}>All</Text>
          </TouchableOpacity>
          {services.slice(0, 8).map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => { setFilters({ ...filters, service: s.name }); }}
              className={`px-3.5 py-2 mr-2 rounded-full border ${
                filters.service === s.name ? 'bg-accent border-accent' : 'bg-surface-2 border-border'
              }`}
            >
              <Text className={`text-xs font-semibold ${
                filters.service === s.name ? 'text-white' : 'text-text-secondary'
              }`}>{s.icon} {s.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        {loading ? (
          <View className="gap-4">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="bg-surface rounded-2xl p-5 border border-border flex-row items-center">
                <View className="w-15 h-15 rounded-full bg-surface-2" />
                <View className="ml-3.5 flex-1 gap-2">
                  <View className="w-1/2 h-4 bg-surface-2 rounded-md" />
                  <View className="w-3/4 h-3 bg-surface-2 rounded-md" />
                  <View className="w-1/3 h-3 bg-surface-2 rounded-md" />
                </View>
              </View>
            ))}
          </View>
        ) : technicians.length > 0 ? (
          <>
            <Text className="text-text-secondary text-[13px] mb-4">
              {technicians.length} technician{technicians.length > 1 ? 's' : ''} found
            </Text>
            <View className="gap-3.5">
              {technicians.map((tech) => (
                <TouchableOpacity
                  key={tech.id}
                  activeOpacity={0.7}
                  className="bg-surface border border-border rounded-2xl p-4.5"
                >
                  <View className="flex-row items-center">
                    <View className="w-15 h-15 rounded-full overflow-hidden bg-surface-2">
                      <Image
                        source={{ uri: tech.avatar_url || `https://ui-avatars.com/api/?name=${tech.name}&background=1e3a5f&color=f1f5f9` }}
                        className="w-15 h-15"
                      />
                    </View>
                    <View className="ml-3.5 flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-base font-bold text-text-primary">{tech.name}</Text>
                        {tech.is_verified && (
                          <View className="bg-success/15 rounded-full px-1.5 py-0.5">
                            <Text className="text-[10px] text-success font-bold">✓</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-text-secondary mt-1">📍 {tech.location || 'Kenya'}</Text>
                      <View className="flex-row items-center mt-1.5 gap-1.5">
                        <StarRating rating={tech.avg_rating || 0} />
                        <Text className="text-xs text-text-secondary">
                          {tech.avg_rating ? `${Number(tech.avg_rating).toFixed(1)}` : 'New'} ({tech.total_reviews || 0})
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color="#64748b" />
                  </View>
                  
                  {tech.bio && (
                    <Text className="text-[13px] text-text-muted mt-3 leading-5" numberOfLines={2}>
                      {tech.bio}
                    </Text>
                  )}

                  <View className="flex-row mt-3 gap-2">
                    <View className="bg-accent/10 rounded-full px-2.5 py-1">
                      <Text className="text-[11px] text-accent font-semibold">
                        {tech.years_experience || 0} yrs exp
                      </Text>
                    </View>
                    <View className="bg-primary-light/20 rounded-full px-2.5 py-1">
                      <Text className="text-[11px] text-primary-light font-semibold">
                        {tech.total_jobs || 0} jobs
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
               ))}
            </View>
          </>
        ) : (
          <View className="items-center py-15">
            <Text className="text-4xl mb-4">🔍</Text>
            <Text className="text-lg font-bold text-text-primary mb-2">No technicians found</Text>
            <Text className="text-text-secondary text-center">Try adjusting your search filters or check back later</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
