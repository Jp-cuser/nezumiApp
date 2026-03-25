import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert, Animated, ImageBackground } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const API_BASE_URL = 'http://100.90.184.110:3000'; 

// ==========================================
// 🪄 共通パーツ1：星空の背景
// ==========================================
const StarryBackground = ({ children }) => (
  <ImageBackground
    source={{ uri: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1080&auto=format&fit=crop' }}
    style={styles.bgContainer}
    imageStyle={{ opacity: 0.3 }}
  >
    {children}
  </ImageBackground>
);

// ==========================================
// 🪄 共通パーツ2：くるっとめくれるカード！
// ==========================================
const FlipCard = ({ uri, isReversed, style }) => {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    flipAnim.setValue(0);
    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [uri]);

  const frontRotateY = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotateY = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <View style={{ position: 'relative', width: style.width, height: style.height }}>
      <Animated.View style={[style, { position: 'absolute', backgroundColor: '#2b2d31', borderColor: '#FFD700', borderWidth: 2, alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden', transform: [{ rotateY: frontRotateY }] }]}>
        <Text style={{ fontSize: style.width > 150 ? 60 : 30 }}>🐭</Text>
      </Animated.View>
      <Animated.View style={[style, { position: 'absolute', backfaceVisibility: 'hidden', transform: [{ rotateY: backRotateY }] }]}>
        <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: style.borderRadius || 10, transform: [{ rotate: isReversed ? '180deg' : '0deg' }] }} />
      </Animated.View>
    </View>
  );
};

// ==========================================
// 🔮 1. タロット1枚引き画面
// ==========================================
function TarotScreen() {
  const [tarotData, setTarotData] = useState(null);
  const [loading, setLoading] = useState(false);

  const drawTarot = async () => {
    setLoading(true);
    try {
      const savedName = await AsyncStorage.getItem('username') || 'ゲスト';
      const response = await fetch(`${API_BASE_URL}/api/tarot?userId=app_user1&username=${encodeURIComponent(savedName)}`);
      const data = await response.json();
      setTarotData(data);
    } catch (error) {
      Alert.alert('エラー', 'サーバーと通信できなかったちゅ…。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StarryBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🐭 今日の1枚を引くちゅ！</Text>
        <TouchableOpacity style={styles.drawButton} onPress={drawTarot}>
          <Text style={styles.drawButtonText}>カードを引く</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />}
        {tarotData && !loading && (
          <View style={styles.resultBox}>
            <Text style={styles.cardName}>{tarotData.card.name}</Text>
            <Text style={styles.orientation}>{tarotData.card.isReversed ? '▼ 逆位置' : '▲ 正位置'}</Text>
            
            <View style={styles.imageFrame}>
              {/* 💡 1:1の正方形スタイル(cardImage)を適用！ */}
              <FlipCard uri={`${API_BASE_URL}/images/${tarotData.card.imageName}`} isReversed={tarotData.card.isReversed} style={styles.cardImage} />
            </View>

            <Text style={styles.subtitle}>✨ カードの意味</Text>
            <Text style={styles.text}>{tarotData.card.meaning}</Text>
            <Text style={styles.subtitle}>🔮 特別解説</Text>
            <Text style={styles.text}>{tarotData.messages.aiExplanation}</Text>
          </View>
        )}
      </ScrollView>
    </StarryBackground>
  );
}

// ==========================================
// 🃏 2. タロット3枚引き画面 (✨横並び進化版✨)
// ==========================================
function Tarot3Screen() {
  const [tarotData, setTarotData] = useState(null);
  const [loading, setLoading] = useState(false);

  const drawTarot3 = async () => {
    setLoading(true);
    try {
      const savedName = await AsyncStorage.getItem('username') || 'ゲスト';
      const response = await fetch(`${API_BASE_URL}/api/tarot3?userId=app_user1&username=${encodeURIComponent(savedName)}`);
      const data = await response.json();
      setTarotData(data);
    } catch (error) {
      Alert.alert('エラー', '運命の糸が絡まっちゃったちゅ…。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StarryBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🃏 過去・現在・未来</Text>
        <TouchableOpacity style={styles.drawButton} onPress={drawTarot3}>
          <Text style={styles.drawButtonText}>3枚のカードを引く</Text>
        </TouchableOpacity>
        
        {loading && <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />}
        
        {tarotData && !loading && (
          <View style={styles.resultBox}>
            <Text style={styles.storyTitle}>📖 物語：{tarotData.story.type}</Text>
            <Text style={styles.text}>{tarotData.story.message}</Text>
            <View style={{ height: 20 }} />

            {/* 💡 3枚のカードを横並びにするコンテナ */}
            <View style={styles.cardsRowContainer}>
              {tarotData.cards.map((c, index) => (
                <View key={index} style={styles.card3Column}>
                  <Text style={styles.positionTextSmall}>{c.position}</Text>
                  <View style={styles.imageFrameSmall}>
                    {/* 💡 1:1の小さな正方形スタイル(cardImageRow)を適用！ */}
                    <FlipCard uri={`${API_BASE_URL}/images/${c.imageName}`} isReversed={c.isReversed} style={styles.cardImageRow} />
                  </View>
                  <Text style={styles.cardNameRow} numberOfLines={1}>{c.name}</Text>
                  <Text style={styles.orientationRow}>{c.isReversed ? '▼ 逆' : '▲ 正'}</Text>
                </View>
              ))}
            </View>

            {/* 💡 カードの意味は長くなるので下段にまとめて表示！ */}
            <View style={styles.meaningsBox}>
              {tarotData.cards.map((c, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <Text style={styles.subtitleSmall}>【{c.position}】{c.name}</Text>
                  <Text style={styles.textSmall}>{c.meaning}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.subtitle}>🔮 ねずみの統合リーディング</Text>
            <Text style={styles.text}>{tarotData.messages.aiExplanation}</Text>
          </View>
        )}
      </ScrollView>
    </StarryBackground>
  );
}

// ==========================================
// 🌟 3. 星座占い画面
// ==========================================
function HoroscopeScreen() {
  const [horoscopeData, setHoroscopeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mySign, setMySign] = useState('牡羊座');

  const getHoroscope = async () => {
    setLoading(true);
    try {
      const savedSign = await AsyncStorage.getItem('zodiacSign') || '牡羊座';
      setMySign(savedSign);
      const response = await fetch(`${API_BASE_URL}/api/horoscope`);
      const data = await response.json();
      setHoroscopeData(data);
    } catch (error) {
      Alert.alert('エラー', '星の声を聴けなかったちゅ…。');
    } finally {
      setLoading(false);
    }
  };

  const myRankData = horoscopeData ? horoscopeData.ranking.find(r => r.name === mySign) : null;

  return (
    <StarryBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🌟 今日の星占い</Text>
        <TouchableOpacity style={styles.drawButton} onPress={getHoroscope}>
          <Text style={styles.drawButtonText}>運勢を見る</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />}
        {horoscopeData && myRankData && !loading && (
          <View style={styles.resultBox}>
            <Text style={styles.cardName}>{myRankData.name} の運勢</Text>
            <Text style={styles.orientation}>本日の第 {myRankData.rank} 位！ (スコア: {myRankData.score}点)</Text>
            <Text style={styles.subtitle}>🍀 ラッキーアイテム</Text>
            <Text style={styles.text}>{myRankData.luckyItem}</Text>
            <Text style={styles.subtitle}>🐭 メッセージ</Text>
            <Text style={styles.text}>{myRankData.comment}</Text>
            <View style={{ height: 20 }} />
            <Text style={styles.subtitle}>✨ 今日のテーマ</Text>
            <Text style={styles.text}>{horoscopeData.overallMessage}</Text>
          </View>
        )}
      </ScrollView>
    </StarryBackground>
  );
}

// ==========================================
// 🪨 4. ルーン占い画面
// ==========================================
function RuneScreen() {
  const [runeData, setRuneData] = useState(null);
  const [loading, setLoading] = useState(false);

  const drawRune = async () => {
    setLoading(true);
    try {
      const savedName = await AsyncStorage.getItem('username') || 'ゲスト';
      const response = await fetch(`${API_BASE_URL}/api/rune?userId=app_user1&username=${encodeURIComponent(savedName)}`);
      const data = await response.json();
      setRuneData(data);
    } catch (error) {
      Alert.alert('エラー', '石のささやきが聞こえなかったちゅ…。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StarryBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🪨 ルーンを引くちゅ！</Text>
        <TouchableOpacity style={styles.drawButton} onPress={drawRune}>
          <Text style={styles.drawButtonText}>石をひとつ選ぶ</Text>
        </TouchableOpacity>
        
        {loading && <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />}
        
        {runeData && !loading && (
          <View style={styles.resultBox}>
            <Text style={styles.runeSymbol}>{runeData.rune.symbol}</Text>
            <Text style={styles.cardName}>{runeData.rune.name}</Text>
            <Text style={styles.orientation}>{runeData.rune.isReversed ? '▼ 逆位置' : '▲ 正位置'}</Text>
            
            <View style={styles.imageFrame}>
              {/* 💡 ルーンも正方形に！ */}
              <FlipCard uri={`${API_BASE_URL}/images/${runeData.rune.imageName}`} isReversed={runeData.rune.isReversed} style={styles.cardImage} />
            </View>

            <Text style={styles.subtitle}>📖 石の意味 ({runeData.rune.symbolMeaning})</Text>
            <Text style={styles.text}>{runeData.rune.stoneMeaning}</Text>
            <Text style={styles.subtitle}>🔮 特別解説</Text>
            <Text style={styles.text}>{runeData.messages.aiExplanation}</Text>
          </View>
        )}
      </ScrollView>
    </StarryBackground>
  );
}

// ==========================================
// ⚙️ 5. ユーザー設定画面
// ==========================================
function SettingsScreen() {
  const [name, setName] = useState('');
  const [sign, setSign] = useState('牡羊座');

  const signsList = [
    '牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座', 
    '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'
  ];

  useEffect(() => {
    const loadSettings = async () => {
      const savedName = await AsyncStorage.getItem('username');
      const savedSign = await AsyncStorage.getItem('zodiacSign');
      if (savedName) setName(savedName);
      if (savedSign) setSign(savedSign);
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('username', name);
      await AsyncStorage.setItem('zodiacSign', sign);
      Alert.alert('保存完了！', 'ねずみさんが名前と星座を覚えたよ！🐭✨');
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しちゃったちゅ…');
    }
  };

  return (
    <StarryBackground>
      <View style={styles.centerContainer}>
        <Text style={styles.title}>⚙️ あなたのこと</Text>
        <Text style={[styles.subtitle, { marginLeft: '5%', marginTop: 10 }]}>お名前</Text>
        <TextInput
          style={styles.input}
          onChangeText={setName}
          value={name}
          placeholder="例: テイマー"
          placeholderTextColor="#888888"
        />
        <Text style={[styles.subtitle, { marginLeft: '5%', marginTop: 20 }]}>星座</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={sign}
            onValueChange={(itemValue) => setSign(itemValue)}
            style={styles.picker}
            dropdownIconColor="#FFD700"
          >
            {signsList.map((s) => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>保存する</Text>
        </TouchableOpacity>
      </View>
    </StarryBackground>
  );
}

// ==========================================
// 📱 アプリの本体
// ==========================================
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            let emoji = '🔮';
            if (route.name === 'Tarot1') emoji = '🔮';
            else if (route.name === 'Tarot3') emoji = '🃏';
            else if (route.name === 'Horoscope') emoji = '🌟';
            else if (route.name === 'Rune') emoji = '🪨';
            else if (route.name === 'Settings') emoji = '⚙️';
            return <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
          },
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: '#888888',
          tabBarStyle: { 
            backgroundColor: '#1e1e24', 
            borderTopWidth: 1,
            borderColor: '#333',
            minHeight: 80,
            paddingBottom: 25,
            paddingTop: 10
          },
          headerStyle: { backgroundColor: '#1e1e24', shadowColor: 'transparent' },
          headerTintColor: '#FFD700',
          headerTitleStyle: { fontWeight: 'bold' },
        })}
      >
        <Tab.Screen name="Tarot1" component={TarotScreen} options={{ title: '1枚' }} />
        <Tab.Screen name="Tarot3" component={Tarot3Screen} options={{ title: '3枚' }} />
        <Tab.Screen name="Horoscope" component={HoroscopeScreen} options={{ title: '星座' }} />
        <Tab.Screen name="Rune" component={RuneScreen} options={{ title: 'ルーン' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: '設定' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ==========================================
// 🎨 可愛いデザイン設定
// ==========================================
const styles = StyleSheet.create({
  bgContainer: { flex: 1, backgroundColor: '#0a0a1a' },
  container: { flexGrow: 1, backgroundColor: 'transparent', alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20 },
  centerContainer: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginBottom: 20 },
  loader: { marginTop: 30 },
  drawButton: { backgroundColor: '#5865F2', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 5 },
  drawButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  
  // 入力フォーム関連
  input: { height: 50, width: '90%', backgroundColor: 'rgba(43, 45, 49, 0.9)', borderColor: '#FFD700', borderWidth: 2, borderRadius: 10, color: '#ffffff', paddingHorizontal: 15, fontSize: 18, marginTop: 5, marginBottom: 15 },
  pickerContainer: { width: '90%', backgroundColor: 'rgba(43, 45, 49, 0.9)', borderColor: '#FFD700', borderWidth: 2, borderRadius: 10, marginTop: 5, marginBottom: 20, overflow: 'hidden' },
  picker: { height: 50, width: '100%', color: '#ffffff' },
  saveButton: { backgroundColor: '#00FA9A', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, marginTop: 20 },
  saveButtonText: { color: '#1e1e24', fontSize: 18, fontWeight: 'bold' },
  
  // 占い結果の箱
  resultBox: { marginTop: 30, backgroundColor: 'rgba(43, 45, 49, 0.85)', padding: 20, borderRadius: 20, width: '100%', alignItems: 'center', borderWidth: 2, borderColor: '#5865F2' },
  cardName: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 5 },
  orientation: { fontSize: 18, color: '#ff6b6b', marginBottom: 15 },
  
  // 💡 1枚引き・ルーン用の大きなカードデザイン (1:1 の正方形に変更！)
  imageFrame: { padding: 10, backgroundColor: 'rgba(30, 30, 36, 0.85)', borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: '#FFD700' },
  cardImage: { width: 220, height: 220, borderRadius: 10 }, 
  
  // 💡 タロット3枚引き用の横並びデザイン
  cardsRowContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15 },
  card3Column: { alignItems: 'center', width: '31%', backgroundColor: 'rgba(30, 30, 36, 0.85)', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#5865F2' },
  positionTextSmall: { fontSize: 14, fontWeight: 'bold', color: '#FFD700', marginBottom: 5 },
  imageFrameSmall: { padding: 5, backgroundColor: '#1e1e24', borderRadius: 10, marginBottom: 5, borderWidth: 1, borderColor: '#FFD700' },
  cardImageRow: { width: 75, height: 75, borderRadius: 8 }, // こちらも 1:1 の正方形！
  cardNameRow: { fontSize: 12, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 2 },
  orientationRow: { fontSize: 12, color: '#ff6b6b' },
  
  // 💡 3枚引きのテキストエリア（下段用）
  meaningsBox: { width: '100%', backgroundColor: 'rgba(30, 30, 36, 0.5)', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#5865F2' },
  subtitleSmall: { fontSize: 16, fontWeight: 'bold', color: '#00FA9A', marginBottom: 5 },

  // ルーン文字専用
  runeSymbol: { fontSize: 80, color: '#FFD700', marginBottom: 10 },

  // 共通テキスト
  subtitle: { fontSize: 18, fontWeight: 'bold', color: '#00FA9A', alignSelf: 'flex-start', marginTop: 15, marginBottom: 5 },
  text: { fontSize: 16, color: '#e0e0e0', alignSelf: 'flex-start', lineHeight: 24 },
  textSmall: { fontSize: 14, color: '#e0e0e0', lineHeight: 22 },
});