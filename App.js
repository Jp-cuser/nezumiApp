import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 💾 データを保存する魔法を追加！

// 💡 ここをあなたのTailscale IPアドレスに書き換えてちゅ！
const API_BASE_URL = 'http://100.90.184.110:3000'; 

// ==========================================
// 🔮 1. タロット占い画面
// ==========================================
function TarotScreen() {
  const [tarotData, setTarotData] = useState(null);
  const [loading, setLoading] = useState(false);

  const drawTarot = async () => {
    setLoading(true);
    try {
      // 💾 スマホに保存されている名前をこっそり読み込むちゅ！
      const savedName = await AsyncStorage.getItem('username') || 'ゲスト';
      
      // 読み込んだ名前をサーバーに送る！
      const response = await fetch(`${API_BASE_URL}/api/tarot?userId=app_user1&username=${encodeURIComponent(savedName)}`);
      const data = await response.json();
      setTarotData(data);
    } catch (error) {
      console.error(error);
      alert('サーバーと通信できなかったちゅ…。IPアドレスを確認してちゅ！');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🐭 今日の1枚を引くちゅ！</Text>
      
      <TouchableOpacity style={styles.drawButton} onPress={drawTarot}>
        <Text style={styles.drawButtonText}>カードを引く</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />}

      {tarotData && !loading && (
        <View style={styles.resultBox}>
          <Text style={styles.cardName}>{tarotData.card.name}</Text>
          <Text style={styles.orientation}>
            {tarotData.card.isReversed ? '▼ 逆位置' : '▲ 正位置'}
          </Text>

          <View style={styles.imageFrame}>
            <Image
              source={{ uri: `${API_BASE_URL}/images/${tarotData.card.imageName}` }}
              style={[styles.cardImage, tarotData.card.isReversed && styles.reversedImage]}
            />
          </View>

          <Text style={styles.subtitle}>✨ カードの意味</Text>
          <Text style={styles.text}>{tarotData.card.meaning}</Text>

          <Text style={styles.subtitle}>🐭 ねずみのささやき</Text>
          <Text style={styles.text}>{tarotData.messages.whisper}</Text>

          <Text style={styles.subtitle}>🔮 特別解説</Text>
          <Text style={styles.text}>{tarotData.messages.aiExplanation}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ==========================================
// 🌟 2. 星座占い画面
// ==========================================
function HoroscopeScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>🌟 星座占い</Text>
      <Text style={styles.text}>ここに星座占いの機能を追加していくちゅ！</Text>
    </View>
  );
}

// ==========================================
// ⚙️ 3. ユーザー設定画面
// ==========================================
function SettingsScreen() {
  const [name, setName] = useState('');

  // 画面が開いたときに、前に保存した名前を思い出す処理
  useEffect(() => {
    const loadSettings = async () => {
      const savedName = await AsyncStorage.getItem('username');
      if (savedName) setName(savedName);
    };
    loadSettings();
  }, []);

  // 名前を保存する処理
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('username', name);
      Alert.alert('保存完了！', 'ねずみさんが名前を覚えたよ！🐭✨');
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しちゃったちゅ…');
    }
  };

  return (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>⚙️ あなたのこと</Text>
      <Text style={styles.text}>ねずみさんに呼んでほしい名前を教えてちゅ！</Text>
      
      <TextInput
        style={styles.input}
        onChangeText={setName}
        value={name}
        placeholder="名前を入力してね (例: テイマー)"
        placeholderTextColor="#888888"
      />
      
      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>保存する</Text>
      </TouchableOpacity>
    </View>
  );
}

// ==========================================
// 📱 アプリの本体（メニューバーの設定）
// ==========================================
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: '#888888',
          tabBarStyle: { backgroundColor: '#2b2d31', borderTopWidth: 0 },
          headerStyle: { backgroundColor: '#1e1e24', shadowColor: 'transparent' },
          headerTintColor: '#FFD700',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Tab.Screen name="Tarot" component={TarotScreen} options={{ title: '🔮 タロット' }} />
        <Tab.Screen name="Horoscope" component={HoroscopeScreen} options={{ title: '🌟 星座' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: '⚙️ 設定' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ==========================================
// 🎨 可愛いデザイン設定
// ==========================================
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#1e1e24', alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20 },
  centerContainer: { flex: 1, backgroundColor: '#1e1e24', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginBottom: 20 },
  loader: { marginTop: 30 },
  
  // 🔘 タロットを引くボタンのデザイン
  drawButton: { backgroundColor: '#5865F2', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 5 },
  drawButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },

  // ⚙️ 設定画面の入力ボックスとボタン
  input: { height: 50, width: '90%', backgroundColor: '#2b2d31', borderColor: '#FFD700', borderWidth: 2, borderRadius: 10, color: '#ffffff', paddingHorizontal: 15, fontSize: 18, marginTop: 20, marginBottom: 20 },
  saveButton: { backgroundColor: '#00FA9A', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25 },
  saveButtonText: { color: '#1e1e24', fontSize: 18, fontWeight: 'bold' },

  resultBox: { marginTop: 30, backgroundColor: '#2b2d31', padding: 20, borderRadius: 20, width: '100%', alignItems: 'center', borderWidth: 2, borderColor: '#5865F2' },
  cardName: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  orientation: { fontSize: 18, color: '#ff6b6b', marginBottom: 15 },
  imageFrame: { padding: 10, backgroundColor: '#1e1e24', borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: '#FFD700' },
  cardImage: { width: 180, height: 320, resizeMode: 'contain', borderRadius: 10 },
  reversedImage: { transform: [{ rotate: '180deg' }] },
  subtitle: { fontSize: 18, fontWeight: 'bold', color: '#00FA9A', alignSelf: 'flex-start', marginTop: 15, marginBottom: 5 },
  text: { fontSize: 16, color: '#e0e0e0', alignSelf: 'flex-start', lineHeight: 24 },
});