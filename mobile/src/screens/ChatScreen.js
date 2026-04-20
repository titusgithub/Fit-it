import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, Phone, CheckCheck } from 'lucide-react-native';
import io from 'socket.io-client';
import api, { SOCKET_URL } from '../services/api';

export default function ChatScreen({ route, navigation }) {
  const { requestId, receiverId, receiverName, receiverAvatar } = route.params;
  const { user, token } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const socketRef = useRef();
  const flatListRef = useRef();

  useEffect(() => {
    fetchMessages();

    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.emit('join', user.id);
    socketRef.current.emit('joinChat', requestId);

    socketRef.current.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    });

    socketRef.current.on('userTyping', (data) => {
      if (data.userId !== user.id) setIsTyping(true);
    });

    socketRef.current.on('userStoppedTyping', (data) => {
      if (data.userId !== user.id) setIsTyping(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/${requestId}`);
      setMessages(response.data.messages || []);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    } catch (e) {
      console.error('Fetch messages error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      request_id: requestId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: newMessage.trim(),
    };

    socketRef.current.emit('sendMessage', messageData);
    setNewMessage('');
    socketRef.current.emit('stopTyping', { request_id: requestId, userId: user.id });
  };

  const handleTyping = (text) => {
    setNewMessage(text);
    if (text.length > 0) {
      socketRef.current.emit('typing', { request_id: requestId, userId: user.id, name: user.name });
    } else {
      socketRef.current.emit('stopTyping', { request_id: requestId, userId: user.id });
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === user.id;
    return (
      <View style={{
        marginBottom: 14,
        flexDirection: 'row',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
      }}>
        {!isMe && (
          <Image 
            source={{ uri: receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=1e3a5f&color=f1f5f9` }} 
            style={{ width: 30, height: 30, borderRadius: 15, alignSelf: 'flex-end', marginRight: 8 }}
          />
        )}
        <View style={{
          maxWidth: '75%',
          paddingHorizontal: 16, paddingVertical: 12,
          borderRadius: 16,
          backgroundColor: isMe ? '#ff6b35' : '#1a2332',
          borderTopRightRadius: isMe ? 4 : 16,
          borderTopLeftRadius: isMe ? 16 : 4,
        }}>
          <Text style={{
            color: isMe ? '#fff' : '#f1f5f9',
            fontSize: 15, fontWeight: '500',
          }}>
            {item.content}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 }}>
            <Text style={{
              fontSize: 10,
              color: isMe ? 'rgba(255,255,255,0.6)' : '#64748b',
              marginRight: 4,
            }}>
              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMe && <CheckCheck size={12} color="rgba(255,255,255,0.6)" />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f1a' }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: 24, paddingTop: 56, paddingBottom: 14,
        backgroundColor: '#111827',
        borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.1)',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
          <Image 
            source={{ uri: receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=1e3a5f&color=f1f5f9` }} 
            style={{
              width: 42, height: 42, borderRadius: 21,
              borderWidth: 2, borderColor: '#1a2332',
            }}
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700' }}>{receiverName}</Text>
            <Text style={{ color: isTyping ? '#ff6b35' : '#10b981', fontSize: 12, fontWeight: '500' }}>
              {isTyping ? 'typing...' : 'Active now'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={{
          padding: 10, backgroundColor: '#1a2332', borderRadius: 99,
          borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
        }}>
          <Phone size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <ActivityIndicator color="#ff6b35" size="large" style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ padding: 20, paddingBottom: 10 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{
          paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 32,
          backgroundColor: '#111827',
          borderTopWidth: 1, borderTopColor: 'rgba(148,163,184,0.1)',
          flexDirection: 'row', alignItems: 'center',
        }}>
          <View style={{
            flex: 1,
            backgroundColor: '#1a2332',
            borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)',
            borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12,
            marginRight: 12,
          }}>
            <TextInput
              placeholder="Message..."
              placeholderTextColor="#64748b"
              style={{ color: '#f1f5f9', fontSize: 15, maxHeight: 96 }}
              value={newMessage}
              onChangeText={handleTyping}
              multiline
            />
          </View>
          <TouchableOpacity 
            onPress={handleSend}
            activeOpacity={0.8}
            style={{
              width: 48, height: 48,
              backgroundColor: '#ff6b35', borderRadius: 24,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#ff6b35', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
            }}
          >
            <Send size={20} color="white" style={{ marginLeft: -2 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
