import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, Phone, MoreVertical, Check, CheckCheck } from 'lucide-react-native';
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
    // Fetch initial messages
    fetchMessages();

    // Setup socket
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
      <View className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <Image 
            source={{ uri: receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=cbd5e1&color=fff` }} 
            className="w-8 h-8 rounded-full self-end mr-2"
          />
        )}
        <View 
          className={`max-w-[75%] px-4 py-3 rounded-2xl ${isMe ? 'bg-primary rounded-tr-none' : 'bg-slate-100 rounded-tl-none'}`}
        >
          <Text className={`${isMe ? 'text-white' : 'text-text-primary'} text-base font-medium`}>
            {item.content}
          </Text>
          <View className="flex-row items-center justify-end mt-1">
            <Text className={`text-[10px] ${isMe ? 'text-white/70' : 'text-text-muted'} mr-1`}>
              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMe && <CheckCheck size={12} color="rgba(255,255,255,0.7)" />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-16 pb-4 bg-white/90 border-b border-slate-100 flex-row items-center justify-between shadow-sm z-10 w-full" style={{ position: 'absolute', top: 0 }}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-2 bg-slate-50 rounded-full border border-slate-100">
            <ArrowLeft size={20} color="#475569" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Image 
              source={{ uri: receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=4f46e5&color=fff` }} 
              className="w-11 h-11 rounded-full border-2 border-slate-50"
            />
            <View className="ml-3">
              <Text className="text-slate-800 text-base font-bold">{receiverName}</Text>
              <Text className="text-[#4f46e5] font-medium text-xs font-medium">{isTyping ? 'typing...' : 'Active now'}</Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity className="p-2.5 bg-slate-50 rounded-full border border-slate-100">
            <Phone size={18} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <ActivityIndicator color="#4f46e5" size="large" className="flex-1 mt-32" />
      ) : (
        <View className="flex-1 mt-[100px]">
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="px-5 py-4 bg-white border-t border-slate-100 flex-row items-center pb-8 shadow-2xl">
          <View className="flex-1 bg-slate-50 border border-slate-200 rounded-3xl px-5 py-3.5 flex-row items-center mr-3">
            <TextInput
              placeholder="Message..."
              placeholderTextColor="#cbd5e1"
              className="flex-1 text-slate-800 text-base font-medium max-h-24"
              value={newMessage}
              onChangeText={handleTyping}
              multiline
            />
          </View>
          <TouchableOpacity 
            onPress={handleSend}
            activeOpacity={0.8}
            className="w-12 h-12 bg-[#4f46e5] rounded-full items-center justify-center shadow-lg shadow-indigo-500/30"
          >
            <Send size={20} color="white" style={{ marginLeft: -2 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
