import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBackground } from '../../src/components/AppBackground';
import { askCurator } from '../../src/lib/claude';
import { ChatMessage } from '../../src/lib/types';

const INTRO_MSG: ChatMessage = {
  role: 'assistant',
  text: 'Сәлем! Мен BilimAI AI Кураторымын 🧠\n\nҰБТ-ға дайындалуда кез келген сұрағыңды қой. Теория, формула, тест сұрақтары — бәрінде көмектесемін!',
  timestamp: new Date().toISOString(),
};

export default function CuratorTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', text, timestamp: new Date().toISOString() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const reply = await askCurator(next.map((m) => ({ role: m.role, text: m.text })));
      const assistantMsg: ChatMessage = { role: 'assistant', text: reply, timestamp: new Date().toISOString() };
      setMessages([...next, assistantMsg]);
    } catch {
      setMessages([
        ...next,
        { role: 'assistant', text: 'Қате пайда болды. Қайтадан көріңіз 🔄', timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    setMessages([
      {
        role: 'assistant',
        text: 'Жаңа чат басталды! Сұрағыңды қой 🚀',
        timestamp: new Date().toISOString(),
      },
    ]);
    setInput('');
  }

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF' }}>AI Куратор 🧠</Text>
          <TouchableOpacity
            onPress={newChat}
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text style={{ color: '#6C63FF', fontSize: 13, fontWeight: '600' }}>✨ Жаңа чат</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, paddingBottom: 8 }}>
            {messages.map((m, i) => (
              <View
                key={i}
                style={{
                  marginBottom: 12,
                  maxWidth: '85%',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {m.role === 'assistant' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: 'rgba(108,99,255,0.3)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 6,
                      }}
                    >
                      <Text style={{ fontSize: 12 }}>🧠</Text>
                    </View>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>BilimAI</Text>
                  </View>
                )}
                <View
                  style={{
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor:
                      m.role === 'user' ? '#6C63FF' : 'rgba(255,255,255,0.08)',
                    borderWidth: m.role === 'assistant' ? 1 : 0,
                    borderColor: 'rgba(255,255,255,0.12)',
                  }}
                >
                  <Text style={{ color: '#FFF', lineHeight: 20 }}>{m.text}</Text>
                </View>
              </View>
            ))}
            {loading && (
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <ActivityIndicator color="#6C63FF" size="small" />
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Ойланып жатырмын...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingBottom: 12,
              paddingTop: 4,
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Хабарлама жазыңыз..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginRight: 8,
                color: '#FFF',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
              }}
            />
            <TouchableOpacity
              onPress={() => send(input)}
              disabled={loading || !input.trim()}
            >
              <LinearGradient
                colors={loading || !input.trim() ? ['rgba(108,99,255,0.4)', 'rgba(108,99,255,0.3)'] : ['#FF8C00', '#9B59B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 18 }}>➤</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
  );
}
