import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { ArrowLeft, Search, Star, MapPin, ChevronRight, Filter } from 'lucide-react-native';
import api from '../services/api';

function StarRating({ rating }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: 12, color: i <= Math.round(rating) ? '#f59e0b' : '#64748b' }}>★</Text>
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
    <View style={{ flex: 1, backgroundColor: '#0a0f1a' }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16,
        backgroundColor: '#111827',
        borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.1)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              marginRight: 14, padding: 8,
              backgroundColor: '#1a2332', borderRadius: 99,
              borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
            }}
          >
            <ArrowLeft size={20} color="#94a3b8" />
          </TouchableOpacity>
          <View>
            <Text style={{ color: '#f1f5f9', fontSize: 20, fontWeight: '800' }}>Find Technicians</Text>
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>Browse verified professionals near you</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#1a2332',
          borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
          borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
          marginBottom: 12,
        }}>
          <Search size={18} color="#64748b" />
          <TextInput
            placeholder="Search by name..."
            placeholderTextColor="#64748b"
            style={{ flex: 1, color: '#f1f5f9', fontSize: 14, marginLeft: 10 }}
            value={filters.search}
            onChangeText={(t) => setFilters({ ...filters, search: t })}
            onSubmitEditing={fetchTechnicians}
          />
        </View>

        {/* Filters Row */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{
            flex: 1,
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#1a2332',
            borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
            borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
          }}>
            <MapPin size={16} color="#64748b" />
            <TextInput
              placeholder="Location..."
              placeholderTextColor="#64748b"
              style={{ flex: 1, color: '#f1f5f9', fontSize: 13, marginLeft: 8 }}
              value={filters.location}
              onChangeText={(t) => setFilters({ ...filters, location: t })}
            />
          </View>
          <TouchableOpacity
            onPress={fetchTechnicians}
            style={{
              backgroundColor: '#ff6b35', borderRadius: 12,
              paddingHorizontal: 20, justifyContent: 'center',
              shadowColor: '#ff6b35', shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Service Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
          <TouchableOpacity
            onPress={() => { setFilters({ ...filters, service: '' }); }}
            style={{
              paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
              borderRadius: 999,
              backgroundColor: !filters.service ? '#ff6b35' : '#1a2332',
              borderWidth: 1,
              borderColor: !filters.service ? '#ff6b35' : 'rgba(148,163,184,0.1)',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: !filters.service ? '#fff' : '#94a3b8' }}>All</Text>
          </TouchableOpacity>
          {services.slice(0, 8).map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => { setFilters({ ...filters, service: s.name }); }}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
                borderRadius: 999,
                backgroundColor: filters.service === s.name ? '#ff6b35' : '#1a2332',
                borderWidth: 1,
                borderColor: filters.service === s.name ? '#ff6b35' : 'rgba(148,163,184,0.1)',
              }}
            >
              <Text style={{
                fontSize: 12, fontWeight: '600',
                color: filters.service === s.name ? '#fff' : '#94a3b8',
              }}>{s.icon} {s.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        {loading ? (
          <View style={{ gap: 16 }}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={{
                backgroundColor: '#111827', borderRadius: 16, padding: 20,
                borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
                flexDirection: 'row', alignItems: 'center',
              }}>
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#1a2332' }} />
                <View style={{ marginLeft: 14, flex: 1, gap: 8 }}>
                  <View style={{ width: '50%', height: 16, backgroundColor: '#1a2332', borderRadius: 8 }} />
                  <View style={{ width: '75%', height: 12, backgroundColor: '#1a2332', borderRadius: 6 }} />
                  <View style={{ width: '35%', height: 12, backgroundColor: '#1a2332', borderRadius: 6 }} />
                </View>
              </View>
            ))}
          </View>
        ) : technicians.length > 0 ? (
          <>
            <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
              {technicians.length} technician{technicians.length > 1 ? 's' : ''} found
            </Text>
            <View style={{ gap: 14 }}>
              {technicians.map((tech) => (
                <TouchableOpacity
                  key={tech.id}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: '#111827',
                    borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
                    borderRadius: 16, padding: 18,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 60, height: 60, borderRadius: 30, overflow: 'hidden',
                      backgroundColor: '#1a2332',
                    }}>
                      <Image
                        source={{ uri: tech.avatar_url || `https://ui-avatars.com/api/?name=${tech.name}&background=1e3a5f&color=f1f5f9` }}
                        style={{ width: 60, height: 60 }}
                      />
                    </View>
                    <View style={{ marginLeft: 14, flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#f1f5f9' }}>{tech.name}</Text>
                        {tech.is_verified && (
                          <View style={{
                            backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 99,
                            paddingHorizontal: 6, paddingVertical: 2,
                          }}>
                            <Text style={{ fontSize: 10, color: '#10b981', fontWeight: '700' }}>✓</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>📍 {tech.location || 'Kenya'}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 }}>
                        <StarRating rating={tech.avg_rating || 0} />
                        <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                          {tech.avg_rating ? `${Number(tech.avg_rating).toFixed(1)}` : 'New'} ({tech.total_reviews || 0})
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color="#64748b" />
                  </View>
                  
                  {tech.bio && (
                    <Text style={{ fontSize: 13, color: '#64748b', marginTop: 12, lineHeight: 20 }} numberOfLines={2}>
                      {tech.bio}
                    </Text>
                  )}

                  <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                    <View style={{
                      backgroundColor: 'rgba(255,107,53,0.1)', borderRadius: 999,
                      paddingHorizontal: 10, paddingVertical: 4,
                    }}>
                      <Text style={{ fontSize: 11, color: '#ff6b35', fontWeight: '600' }}>
                        {tech.years_experience || 0} yrs exp
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: 'rgba(30,58,95,0.2)', borderRadius: 999,
                      paddingHorizontal: 10, paddingVertical: 4,
                    }}>
                      <Text style={{ fontSize: 11, color: '#2a5280', fontWeight: '600' }}>
                        {tech.total_jobs || 0} jobs
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🔍</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#f1f5f9', marginBottom: 8 }}>No technicians found</Text>
            <Text style={{ color: '#94a3b8', textAlign: 'center' }}>Try adjusting your search filters or check back later</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
