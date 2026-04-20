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
      <View className={`mb-3.5 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <Image 
            source={{ uri: receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=1e3a5f&color=f1f5f9` }} 
            className="w-7.5 h-7.5 rounded-full self-end mr-2"
          />
        )}
        <View className={`max-w-[75%] px-4 py-3 rounded-2xl ${
          isMe ? 'bg-accent rounded-tr-sm rounded-tl-2xl' : 'bg-surface-2 rounded-tl-sm rounded-tr-2xl'
        }`}>
          <Text className={`text-[15px] font-medium ${isMe ? 'text-white' : 'text-text-primary'}`}>
            {item.content}
          </Text>
          <View className="flex-row items-center justify-end mt-1">
            <Text className={`text-[10px] mr-1 ${isMe ? 'text-white/60' : 'text-text-muted'}`}>
              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMe && <CheckCheck size={12} color="rgba(255,255,255,0.6)" />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-14 pb-3.5 bg-surface border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3.5 p-2 bg-surface-2 border border-border rounded-full"
          >
            <ArrowLeft size={20} color="#94a3b8" />
          </TouchableOpacity>
          <Image 
            source={{ uri: receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=1e3a5f&color=f1f5f9` }} 
            className="w-10.5 h-10.5 rounded-full border-2 border-surface-2"
          />
          <View className="ml-3">
            <Text className="text-text-primary text-base font-bold">{receiverName}</Text>
            <Text className={`text-xs font-medium ${isTyping ? 'text-accent' : 'text-success'}`}>
              {isTyping ? 'typing...' : 'Active now'}
            </Text>
          </View>
        </View>
        <TouchableOpacity className="p-2.5 bg-surface-2 border border-border rounded-full">
          <Phone size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <ActivityIndicator color="#ff6b35" size="large" className="flex-1" />
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
        <View className="px-5 py-3.5 pb-8 bg-surface border-t border-border flex-row items-center">
          <View className="flex-1 bg-surface-2 border border-border rounded-3xl px-4.5 py-3 mr-3">
            <TextInput
              placeholder="Message..."
              placeholderTextColor="#64748b"
              className="text-text-primary text-[15px] max-h-24 p-0 outline-none"
              value={newMessage}
              onChangeText={handleTyping}
              multiline
            />
          </View>
          <TouchableOpacity 
            onPress={handleSend}
            activeOpacity={0.8}
            className="w-12 h-12 bg-accent rounded-full items-center justify-center shadow-md shadow-accent/30"
          >
            <Send size={20} color="white" style={{ marginLeft: -2 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
