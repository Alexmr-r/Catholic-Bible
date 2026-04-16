import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useNetwork, useIsOnline } from '../contexts/NetworkContext';
import { aiService, Message } from '../services/ai.service';
import MessageParser from '../components/MessageParser';
import { AIAssistantScreenProps } from '../navigation/AppNavigator';

export default function AIAssistantScreen({ navigation, route }: AIAssistantScreenProps) {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const isOnline = useIsOnline();
  
  // Context properties if opened from another screen:
  const contextBook = route?.params?.bookName;
  const contextChapter = route?.params?.chapter;
  const contextVerse = route?.params?.verseText;

  // Construct initial message dynamically
  const initialText = contextBook && contextChapter 
    ? `Hello! I see you are reading ${contextBook} ${contextChapter}. How can I help you with this passage?`
    : "Hello! I am your virtual biblical assistant. I am here to help you better understand the scriptures, find passages, or answer theological questions. How can I help you today?";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: initialText,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    // Añadir mensaje del usuario
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Llamar al mock service (próximamente llamará al Spring Boot RAG via Ollama)
      const aiResponseText = await aiService.sendMessage(userText);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("[AIAssistant] Error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[
        styles.messageWrapper, 
        isUser ? styles.messageWrapperUser : styles.messageWrapperAI
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? { backgroundColor: colors.primary.DEFAULT } : { backgroundColor: isDarkMode ? colors.surface.highlight : colors.surface.light },
          !isUser && { borderWidth: 1, borderColor: colors.ivory.border }
        ]}>
          {isUser ? (
             <Text style={[styles.messageText, { color: colors.surface.light }]}>
               {item.text}
             </Text>
          ) : (
             <MessageParser text={item.text} />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: isDarkMode ? colors.background.dark : colors.cream, paddingTop: insets.top }]}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderBottomColor: colors.ivory.border, backgroundColor: isDarkMode ? colors.background.dark : colors.cream }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
             <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.DEFAULT} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.charcoal.DEFAULT }]}>
            AI Assistant
          </Text>
          <View style={{width: 40}} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isTyping && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
            <Text style={[styles.typingText, { color: colors.charcoal.muted }]}> Typing...</Text>
          </View>
        )}

        {!isOnline && (
          <View style={[styles.offlineNotice, { backgroundColor: isDarkMode ? `${colors.burgundy.DEFAULT}30` : `${colors.burgundy.DEFAULT}10` }]}>
            <MaterialIcons name="cloud-off" size={16} color={colors.burgundy.DEFAULT} />
            <Text style={[styles.offlineNoticeText, { color: colors.burgundy.DEFAULT }]}>
              The virtual assistant is only available with an internet connection.
            </Text>
          </View>
        )}

        <View style={[
          styles.inputContainer, 
          { 
            backgroundColor: isDarkMode ? colors.surface.dark : colors.surface.light, 
            borderTopColor: colors.ivory.border,
            paddingBottom: Math.max(insets.bottom + 10, 25)
          },
          !isOnline && { opacity: 0.6 }
        ]}>
          <TextInput
            style={[styles.input, { color: colors.charcoal.DEFAULT, backgroundColor: isDarkMode ? colors.background.dark : colors.cream }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isOnline ? "Type your biblical question..." : "No connection..."}
            placeholderTextColor={colors.charcoal.muted}
            multiline
            maxLength={500}
            editable={isOnline && !isTyping}
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: (inputText.trim() && isOnline) ? colors.primary.DEFAULT : colors.charcoal.muted }]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping || !isOnline}
          >
            <MaterialIcons name="send" size={20} color={colors.surface.light} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 15,
    width: '100%',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperAI: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 15,
    borderRadius: 20,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 2, // Alinear con la parte inferior del input
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 10,
  },
  offlineNoticeText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
