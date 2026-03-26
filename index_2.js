require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// AIの準備（Gemini）
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

// Expressサーバーの立ち上げ
const app = express();
app.use(cors());
app.use(express.json());
// imagesフォルダの中身を公開する設定だちゅ！
app.use('/images', express.static('images'));

// ==========================================
// 🧠 AI呼び出し統合関数（Gemini → 失敗したらOllama）
// ==========================================
// 💡 ここを、あなたがOllamaでダウンロードしているモデル名に書き換えてちゅ！（例: "llama3", "gemma2" など）
const OLLAMA_MODEL = process.env.LOCAL_LLM_MODEL; 

async function askAI(prompt) {
    try {
        // 1. まずは本命のGeminiに頼むちゅ！
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.log(`⚠️ Geminiが休憩中みたいだちゅ。Ollama(${OLLAMA_MODEL})に切り替えるちゅ！`);
        
        // 2. Geminiがエラー（制限など）なら、ローカルのOllamaに頼むちゅ！
        try {
            const response = await axios.post('http://100.124.36.36:11434/api/generate', {
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false
            });
            return response.data.response.trim();
        } catch (ollamaError) {
            console.error("❌ Ollamaも繋がらないちゅ…:", ollamaError.message);
            return "星の導きが混線しているちゅ…。少し待ってからもう一度引いてみてちゅ！";
        }
    }
}

// --- タロット・ルーン等のデータ ---
const tarotCards = [
    { name: '0. 愚者', tone: 'positive', upright: '自由、冒険、新しい始まり', reversed: '無計画、わがまま、不注意', image: '00_Fool.jpg' },
    { name: 'I. 魔術師', tone: 'positive', upright: '創造、才能、自信', reversed: '混迷、消極的、技術不足', image: '01_Magician.jpg' },
    { name: 'II. 女教皇', tone: 'neutral', upright: '直感、知性、静寂', reversed: 'わがまま、神経質、批判的', image: '02_High_Priestess.jpg' },
    { name: 'III. 女帝', tone: 'positive', upright: '豊穣、母性、愛情', reversed: 'わがまま、嫉嫉、停滞', image: '03_Empress.jpg' },
    { name: 'IV. 皇帝', tone: 'positive', upright: '支配、安定、責任', reversed: '独裁、傲慢、無責任', image: '04_Emperor.jpg' },
    { name: 'V. 教皇', tone: 'positive', upright: '慈悲、連帯、信頼', reversed: '保守的、不信感、束縛', image: '05_Hierophant.jpg' },
    { name: 'VI. 恋人', tone: 'positive', upright: '選択、情熱、調和', reversed: '誘惑、不調和、優柔不断', image: '06_Lovers.jpg' },
    { name: 'VII. 戦車', tone: 'positive', upright: '勝利、前進、自制心', reversed: '暴走、挫折、好戦的', image: '07_Chariot.jpg' },
    { name: 'VIII. 正義', tone: 'neutral', upright: '公正、均衡、正しい判断', reversed: '不当、偏見、優柔不断', image: '08_Justice.jpg' },
    { name: 'IX. 隠者', tone: 'neutral', upright: '内省、探求、孤独', reversed: '閉鎖的、陰湿、疑い深い', image: '09_Hermit.jpg' },
    { name: 'X. 運命の輪', tone: 'positive', upright: '幸運、転換点、チャンス', reversed: '暗転、不運、一時的な停滞', image: '10_Wheel_of_Fortune.jpg' },
    { name: 'XI. 力', tone: 'positive', upright: '勇気、忍耐、強い意志', reversed: '自信喪失、甘え、無力', image: '11_Strength.jpg' },
    { name: 'XII. 刑死者', tone: 'neutral', upright: '忍耐、奉仕、視点の変化', reversed: '報われない、わがまま、無駄な努力', image: '12_Hanged_Man.jpg' },
    { name: 'XIII. 死神', tone: 'negative', upright: '終焉、再出発、変化', reversed: '執着、停滞、再起への不安', image: '13_Death.jpg' },
    { name: 'XIV. 節制', tone: 'positive', upright: '調和、自制、献身', reversed: '消耗、不摂生、不調和', image: '14_Temperance.jpg' },
    { name: 'XV. 悪魔', tone: 'negative', upright: '誘惑、束縛、執着', reversed: '解放、覚醒、再生', image: '15_Devil.jpg' },
    { name: 'XVI. 塔', tone: 'negative', upright: '崩壊、災難、突然の変化', reversed: '緊迫、不名誉、屈辱', image: '16_Tower.jpg' },
    { name: 'XVII. 星', tone: 'positive', upright: '希望、願い、ひらめき', reversed: '失望、無力感、高望み', image: '17_Star.jpg' },
    { name: 'XVIII. 月', tone: 'negative', upright: '不安、迷い、潜在意識', reversed: '不安の解消、好転、徐々に明るくなる', image: '18_Moon.jpg' },
    { name: 'XIX. 太陽', tone: 'positive', upright: '成功、誕生、明るい未来', reversed: '不調、延期、衰退', image: '19_Sun.jpg' },
    { name: 'XX. 審判', tone: 'positive', upright: '復活、再生、覚醒', reversed: '再起不能、後悔、行き詰まり', image: '20_Judgement.jpg' },
    { name: 'XXI. 世界', tone: 'positive', upright: '完成、成功、完璧', reversed: '未完成、中途半端、スランプ', image: '21_World.jpg' }
];

const signs = [
    '牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座', 
    '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'
];

const luckyItems = ['チーズ', 'ひまわりの種', '銀のさじ', '赤いリボン', '和歌山みかん', 'お気に入りの靴下']; 
const runeAlphabet = [
    { name: 'フェイヒュー (Fehu)', symbol: 'ᚠ', meaning: '富・家畜', upright: '金運上昇。努力が形になる時だちゅ！', reversed: '無駄遣いや損失に注意が必要だちゅ。' ,image: 'R_01_Fehu.jpg'},
    { name: 'ウルズ (Uruz)', symbol: 'ᚢ', meaning: '力・野生牛', upright: '強いエネルギーに満ちているちゅ！前進あるのみ。', reversed: '力が空回りしそう。休息も大事だちゅ。' ,image: 'R_02_Uruz.jpg'},
    { name: 'ソーン (Thurisaz)', symbol: 'ᚦ', meaning: '巨人・トゲ', upright: '守護と決断。慎重に状況を見極めてちゅ。', reversed: '強引な行動はトラブルの元。立ち止まってちゅ。' ,image: 'R_03_Thurisaz.jpg'},
    { name: 'アンスズ (Ansuz)', symbol: 'ᚨ', meaning: '口・神', upright: '良い知らせや知恵が届くちゅ。対話を大切に。', reversed: '誤解や情報の混乱に気をつけてちゅ。' ,image: 'R_04_Ansuz.jpg'},
    { name: 'ライド (Raido)', symbol: 'ᚱ', meaning: '旅・車輪', upright: 'スムーズな進行。旅行や移動にツキがあるちゅ！', reversed: '計画の遅延や足止めの予感。焦りは禁物だちゅ。' ,image: 'R_05_Raidho.jpg'},
    { name: 'ケナズ (Kenaz)', symbol: 'ᚲ', meaning: '松明・火', upright: '才能の開花。アイデアが次々湧いてくるちゅ！', reversed: '情熱の減退。今は無理に動かず充電してちゅ。' ,image: 'R_06_Kenaz.jpg'},
    { name: 'ゲーボ (Gebo)', symbol: 'ᚷ', meaning: '贈り物・愛', upright: '対等な関係や素晴らしいギフトが届く予感だちゅ。', reversed: '対等な関係や素晴らしいギフトが届く予感だちゅ。' ,image: 'R_07_Gebo.jpg'},
    { name: 'ウンニョ (Wunjo)', symbol: 'ᚹ', meaning: '喜び・勝利', upright: '願いが叶う幸運期だちゅ！心から楽しんで。', reversed: '期待しすぎに注意。小さな幸せを大切にしてちゅ。' ,image: 'R_08_Wunjo.jpg'},
    { name: 'ハガラズ (Hagalaz)', symbol: 'ᚻ', meaning: '雹（ひょう）', upright: '予期せぬ変化。古いものを壊して次に進むちゅ！', reversed: '予期せぬ変化。古いものを壊して次に進むちゅ！' ,image: 'R_09_Hagalaz.jpg'},
    { name: 'ナウズ (Nauthiz)', symbol: 'ᚾ', meaning: '欠乏・束縛', upright: '忍耐の時。不自由さの中から学びがあるちゅ。', reversed: '焦って動くと裏目に出るちゅ。慎重に。' ,image: 'R_10_Nauthiz.jpg'},
    { name: 'イサ (Isa)', symbol: 'ᛁ', meaning: '氷・停止', upright: '今は停止の時。静かにチャンスを待つんだちゅ。', reversed: '今は停止の時。静かにチャンスを待つんだちゅ。' ,image: 'R_11_Isa.jpg'},
    { name: 'ジェラ (Jera)', symbol: 'ᛃ', meaning: '収穫・一年', upright: 'これまでの努力が実を結ぶ収穫の時だちゅ！', reversed: 'これまでの努力が実を結ぶ収穫の時だちゅ！' ,image: 'R_12_Jera.jpg'},
    { name: 'エイワズ (Eihwaz)', symbol: 'ᛇ', meaning: 'イチイの木・死', upright: '変化と再生。古い自分から脱皮する時だちゅ。', reversed: '変化と再生。古い自分から脱皮する時だちゅ。' ,image: 'R_13_Eihwaz.jpg'},
    { name: 'パース (Pertho)', symbol: 'ᛈ', meaning: '運命の袋・秘密', upright: '隠れた才能や予期せぬ幸運が見つかるちゅ！', reversed: '秘密が漏れるかも。軽はずみな言動に注意だちゅ。' ,image: 'R_14_Pertho.jpg'},
    { name: 'アルジズ (Algiz)', symbol: 'ᛉ', meaning: '保護・ヘラジカ', upright: '強い守護があるちゅ。直感を信じて進んで！', reversed: '無防備な状態。隙を見せないように用心してちゅ。' ,image: 'R_15_Algiz.jpg'},
    { name: 'ソウィロ (Sowilo)', symbol: 'ᛊ', meaning: '太陽・勝利', upright: '大成功の兆し！明るい未来が待っているちゅ。', reversed: '大成功の兆し！明るい未来が待っているちゅ。' ,image: 'R_16_Sowilo.jpg'},
    { name: 'ティワズ (Tiwaz)', symbol: 'ᛏ', meaning: '戦士・勝利', upright: '強い意志で勝利を掴めるちゅ。勇気を出して。', reversed: '意欲の低下。自信を失わないようにしてちゅ。' ,image: 'R_17_Tiwaz.jpg'},
    { name: 'ベルカナ (Berkana)', symbol: 'ᛒ', meaning: '樺の木・誕生', upright: '新しい始まりや成長。優しさが鍵になるちゅ。', reversed: '成長の停滞。家庭内の不和に注意してちゅ。' ,image: 'R_18_Berkana.jpg'},
    { name: 'エワズ (Ehwaz)', symbol: 'ᛖ', meaning: '馬・協力', upright: '良きパートナーシップ。協力して進むと吉だちゅ。', reversed: '足並みが揃わない。無理に合わせず様子を見てちゅ。' ,image: 'R_19_Ehwaz.jpg'},
    { name: 'マナズ (Mannaz)', symbol: 'ᛗ', meaning: '人間・自己', upright: '自分自身を見つめ直す時。謙虚さが運を呼ぶちゅ。', reversed: '自己中心的な考えに注意。周囲を大切にしてちゅ。' ,image: 'R_20_Mannaz.jpg'},
    { name: 'ラグズ (Laguz)', symbol: 'ᛚ', meaning: '水・直感', upright: '豊かな感性。インスピレーションを大切にちゅ。', reversed: '感情に流されやすい時。冷静さを保ってちゅ。' ,image: 'R_21_Laguz.jpg'},
    { name: 'イングズ (Inguz)', symbol: 'ᛝ', meaning:'豊穣の神・完成', upright: '一つの区切り。満たされた気持ちになれるちゅ。', reversed:'一つの区切り。満たされた気持ちになれるちゅ。' ,image:'R_22_Inguz.jpg'},
    { name:'ダガズ (Dagaz)', symbol:'ᛞ', meaning:'一日・光', upright:'暗闇が終わり、光が差す時。希望を持ってちゅ！', reversed:'暗闇が終わり、光が差す時。希望を持ってちゅ！' ,image:'R_23_Dagaz.jpg'},
    { name:'オサラ (Othala)', symbol:'ᛟ', meaning:'故郷・伝統', upright:'伝統や家族からの恩恵。基盤を固める時だちゅ。', reversed:'執着しすぎに注意。新しい風を取り入れてちゅ。' ,image:'R_24_Othala.jpg'}
];


function getJSTInfo() {
    const now = new Date();
    const jstStr = now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" });
    const jstDate = new Date(jstStr);
    return {
        dateStr: `${jstDate.getFullYear()}-${jstDate.getMonth() + 1}-${jstDate.getDate()}`,
        displayDate: `${jstDate.getFullYear()}/${jstDate.getMonth() + 1}/${jstDate.getDate()}`,
        seedDate: (jstDate.getFullYear() * 10000) + ((jstDate.getMonth() + 1) * 100) + jstDate.getDate()
    };
}

function getPersonalDailyRandom(userId, seedOffset = 0) {
    // 💡 日付やIDの計算を全部やめて、純粋なランダムにするちゅ！
    return Math.random();
}

function getSingleCardComment(card, isReversed) {
    if (!isReversed) {
        if (card.tone === 'positive') return "わあ！とっても良いカードだね。今日は美味しいチーズに出会えるかも！ちゅ！";
        if (card.tone === 'negative') return "ちょっと怖いカードだけど、正位置なら「新しい出発」の意味もあるよ。鼻をヒクヒクさせて慎重に進もう！";
        return "落ち着いた運勢だね。たまには巣穴でゆっくり毛づくろいするのもいいと思うよ。";
    } else {
        if (card.tone === 'positive') return "せっかくの良い運勢がひっくり返っちゃった。焦らずに、ひまわりの種でも食べて落ち着いてね。";
        if (card.tone === 'negative') return "運気が逆転して、悪いことが去っていくサインかも！これからどんどん良くなるよ、ちゅ！";
        return "なんだかソワソワしちゃうね。深呼吸して、尻尾を落ち着かせてから行動しよう！";
    }
}

// 💡 キャッシュやローカルLLMへのフォールバックもそのまま！
const readingCache = new Map();
// 【修正後】これだけですごくスッキリするちゅ！
async function getGeminiReading(cardName, isReversed, username) {
    const jst = getJSTInfo();
    const cacheKey = `tarot-${jst.dateStr}-${username}-${cardName}-${isReversed}`;
    if (readingCache.has(cacheKey)) return readingCache.get(cacheKey);

    const orientation = isReversed ? "逆位置" : "正位置";
    const prompt = `あなたは「ねずみ」という占い師です。${username}さんが引いたカード：${cardName}の${orientation}。${username}さんに向けて、200文字以内で癒やしのアドバイスを1つだけ言って。語尾は「ちゅ」。`;

    const text = await askAI(prompt); // 💡 ここでハイブリッド関数を呼ぶ！
    readingCache.set(cacheKey, text); 
    return text;
}

// ==========================================
// 3. APIエンドポイント（スマホアプリからの窓口）
// ==========================================

// 🔮 タロット占い API (1枚引き)
app.get('/api/tarot', async (req, res) => {
    // スマホアプリから送られてくるユーザー情報を取得
    const userId = req.query.userId || 'guest_user';
    const username = req.query.username || 'ゲスト';

    // ランダム抽選
    const personalSeed = getPersonalDailyRandom(userId);
    const cardIndex = Math.floor(personalSeed * tarotCards.length);
    const selectedCard = tarotCards[cardIndex];

    const reverseSeed = getPersonalDailyRandom(userId, 999);
    const isReversed = reverseSeed < 0.5;

    // テキスト生成
    const mouseWhisper = getSingleCardComment(selectedCard, isReversed);
    const geminiExplanation = await getGeminiReading(selectedCard.name, isReversed, username);

    // スマホアプリにJSONで結果を返す
    res.json({
        date: getJSTInfo().displayDate,
        card: {
            name: selectedCard.name,
            imageName: selectedCard.image, // アプリ側でこの名前を使って画像を表示する
            isReversed: isReversed,
            meaning: isReversed ? selectedCard.reversed : selectedCard.upright
        },
        messages: {
            whisper: mouseWhisper,
            aiExplanation: geminiExplanation
        }
    });
});

// ==========================================
// 🌟 星座占いAPI用ヘルパー関数（全ユーザー共通の乱数）
// ==========================================
function getDailyRandom(seedOffset = 0) {
    const jst = getJSTInfo(); 
    const finalSeed = jst.seedDate + seedOffset;
    const x = Math.sin(finalSeed) * 10000;
    return x - Math.floor(x);
}

// ==========================================
// 🌟 星座占い API (Ollama対応の強力パース版！)
// ==========================================
app.get('/api/horoscope', async (req, res) => {
    try {
        if (!signs || signs.length === 0) {
            throw new Error("星座データがありません。");
        }

        // 1. ランキングの生成
        const ranking = signs.map((name, index) => {
            const score = Math.floor(getDailyRandom(index) * 100) + 1;
            const itemIdx = Math.floor(getDailyRandom(index + 100) * luckyItems.length);
            return { name, score, luckyItem: luckyItems[itemIdx] };
        });
        ranking.sort((a, b) => b.score - a.score);

        // 2. AIへプロンプト送信
        const rankingInfo = ranking.map((item, i) => `${i+1}位:${item.name}`).join('、');
        const prompt = `占い師「ねずみ」として、以下の星座ランキング各々に50文字以内で短い一言コメントを、最後に「今日の全体の抱負」を300文字以内で作成して。
リスト：${rankingInfo}
形式：
1位：コメント
2位：コメント
...
12位：コメント
抱負：抱負の内容
語尾は「ちゅ」で統一して。`;

        let fullMessage = await askAI(prompt);

        // 3. AIの返答をパースする（Ollamaの柔軟な出力にも対応する強力な魔法！）
        let safeHoufu = "今日も1日、自分のペースで楽しく過ごそうちゅ！";
        
        // 「抱負」という文字で文章を前後に分ける
        const parts = fullMessage.split(/抱負[：:\s]*/);
        if (parts.length > 1) {
            safeHoufu = parts[1].replace(/\*/g, '').trim(); // 抱負より後ろの部分を取得
        }
        const rankingsText = parts[0]; // 抱負より前のランキング部分

        const parsedRanking = ranking.map((item, i) => {
            const currentRankStr = `${i + 1}位`;
            const nextRankStr = i === 11 ? null : `${i + 2}位`;
            
            let comment = "今日はきっといいことがあるちゅ！応援してるちゅ！";
            const startIndex = rankingsText.indexOf(currentRankStr);
            
            if (startIndex !== -1) {
                // 次の順位の文字がある場所までを切り抜く（見つからなければ最後まで）
                let endIndex = nextRankStr ? rankingsText.indexOf(nextRankStr) : rankingsText.length;
                if (endIndex === -1) endIndex = rankingsText.length;
                
                let rawComment = rankingsText.substring(startIndex, endIndex);
                
                // 「1位：牡羊座 - 」みたいな余分な文字やマークダウン(**)をお掃除するちゅ！
                rawComment = rawComment
                    .replace(new RegExp(`^${currentRankStr}[：:\\s\\*]*`), '')
                    .replace(new RegExp(`${item.name}[：:\\s\\*\\-]*`), '')
                    .replace(/\*/g, '')
                    .trim();
                
                if (rawComment) comment = rawComment;
            }

            return {
                rank: i + 1,
                name: item.name,
                score: item.score,
                luckyItem: item.luckyItem,
                comment: comment
            };
        });

        // 4. スマホアプリへJSONを返す
        res.json({
            date: getJSTInfo().displayDate,
            overallMessage: safeHoufu,
            ranking: parsedRanking
        });

    } catch (error) {
        console.error("❌ 星座占いAPIエラー:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 🪨 ルーン占い API
// ==========================================
app.get('/api/rune', async (req, res) => {
    try {
        const userId = req.query.userId || 'guest_user';
        const username = req.query.username || 'ゲスト';

        if (!runeAlphabet || runeAlphabet.length === 0) {
            throw new Error("ルーンデータがありません。");
        }

        // 1. ランダム抽選
        const personalSeed = getPersonalDailyRandom(userId, 777);
        const runeIndex = Math.floor(personalSeed * runeAlphabet.length);
        const selectedRune = runeAlphabet[runeIndex];

        // 逆位置が存在しないルーン文字の処理
        const noReverseRunes = ['ᛗ', 'ᚷ', 'ᚹ', 'ᚻ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛊ', 'ᛝ', 'ᛞ'];
        let isReversed = getPersonalDailyRandom(userId, 888) < 0.5;
        if (noReverseRunes.includes(selectedRune.symbol)) isReversed = false;

        // 2. Geminiへプロンプト送信
        const orientation = isReversed ? "逆位置" : "正位置";
        const prompt = `占い師「ねずみ」として、ルーン文字「${selectedRune.name}」の${orientation}が出た${username}さんに、300文字以内で神秘的な助言をして。語尾は「ちゅ」。`;

        let geminiExplanation = await askAI(prompt);

        // 3. スマホアプリへJSONを返す
        res.json({
            date: getJSTInfo().displayDate,
            rune: {
                name: selectedRune.name,
                symbol: selectedRune.symbol,
                imageName: selectedRune.image,
                isReversed: isReversed,
                symbolMeaning: selectedRune.meaning,
                stoneMeaning: isReversed ? selectedRune.reversed : selectedRune.upright
            },
            messages: {
                aiExplanation: geminiExplanation
            }
        });

    } catch (error) {
        console.error("❌ ルーン占いAPIエラー:", error);
        res.status(500).json({ error: error.message });
    }
});
// ==========================================
// 🌟 タロット3枚引き用 ヘルパー関数
// ==========================================
function calculateScore(card, isReversed) {
    if (card.tone === 'positive') return isReversed ? 1 : 2;  
    if (card.tone === 'negative') return isReversed ? -1 : -2; 
    return 0; 
}

function generateTarotStory(past, present, future) {
    const s1 = calculateScore(past.card, past.isReversed);
    const s2 = calculateScore(present.card, present.isReversed);
    const s3 = calculateScore(future.card, future.isReversed);
    const totalScore = s1 + s2 + s3;

    let storyType = "";
    let message = "";

    if (s1 < s2 && s2 < s3) {
        if (s1 < 0) {
            storyType = "夜明け（V字回復） 🌅";
            message = "過去はボロボロのチーズみたいに大変だったけど、ついに光が見えてきたよ！これからは美味しいごちそうが待ってる予感がするんだ、ちゅ！";
        } else {
            storyType = "飛躍（右肩上がり） 🚀";
            message = "今の勢いは本物だよ！まるで大きなひまわりの種を見つけた時みたいに、どんどん良くなっていくよ。自信を持って進んでね！";
        }
    } else if (s1 > s2 && s2 > s3) {
        storyType = "警告（右肩下がり） ⚠️";
        message = "ううっ、なんだか嫌な予感がするよ……。今は無理に動かず、巣穴でじっとして体力を蓄えるのが一番。足元をよーく確認してね！";
    } else {
        storyType = "つかの間の停滞 ☕";
        if (totalScore >= 0) {
            message = "今はちょっと一休み。お気に入りの場所で毛づくろいでもして、エネルギーを貯めよう。またすぐに良い波がやってくるはずだよ、ちゅ！";
        } else {
            message = "周りがバタバタしてるけど、慌てちゃダメだよ。一歩ずつ、鼻をヒクヒクさせて慎重に進めば、きっと出口が見つかるからね。";
        }
    }
    return { storyType, totalScore, message };
}

// ==========================================
// 🔮 タロット占い API (3枚引き)
// ==========================================
app.get('/api/tarot3', async (req, res) => {
    try {
        const userId = req.query.userId || 'guest_user';
        const username = req.query.username || 'ゲスト';

        if (!tarotCards || tarotCards.length === 0) {
            throw new Error("タロットカードのデータがありません。");
        }

        const positions = ['過去', '現在', '未来'];
        const drawnResults = []; 
        // 同じカードが出ないようにデッキをコピーして使うちゅ！
        let tempDeck = [...tarotCards];

        // 1. カードを3枚引く
        for (let i = 0; i < 3; i++) {
            const personalSeed = getPersonalDailyRandom(userId, (i + 1) * 777);
            const cardIndex = Math.floor(personalSeed * tempDeck.length);
            const card = tempDeck.splice(cardIndex, 1)[0]; // 引いたカードはデッキから抜く

            const reverseSeed = getPersonalDailyRandom(userId, (i + 1) * 999);
            const isReversed = reverseSeed < 0.5;

            drawnResults.push({ name: card.name, isReversed: isReversed, card: card, position: positions[i] });
        }

        // 2. ストーリー（物語）の判定
        const storyResult = generateTarotStory(drawnResults[0], drawnResults[1], drawnResults[2]);

        // 3. Geminiへ統合リーディングのプロンプト送信
        const cardInfo = drawnResults.map((c, i) => 
            `${positions[i]}: ${c.name}(${c.isReversed ? '逆位置' : '正位置'})`
        ).join('、');

        const prompt = `占い師「ねずみ」として、${username}さんの3枚引き（${cardInfo}）を統合して、400文字以内で一言でアドバイスして。最後は「ちゅ」で締めて。`;

        let geminiExplanation = "運命の糸が絡まってうまく読めなかったちゅ…。でも、どのカードもあなたを応援してるちゅ！";
        try {
            const result = await model.generateContent(prompt);
            geminiExplanation = result.response.text().trim();
        } catch (e) {
            console.error('⚠️ Gemini API Error (Tarot 3):', e.message);
        }

        // 4. スマホアプリへ返すJSONデータを綺麗に整形
        const formattedCards = drawnResults.map(r => ({
            position: r.position,
            name: r.card.name,
            imageName: r.card.image,
            isReversed: r.isReversed,
            meaning: r.isReversed ? r.card.reversed : r.card.upright
        }));

        res.json({
            date: getJSTInfo().displayDate,
            cards: formattedCards,
            story: {
                type: storyResult.storyType,
                message: storyResult.message
            },
            messages: {
                aiExplanation: geminiExplanation
            }
        });

    } catch (error) {
        console.error("❌ タロット3枚引きAPIエラー:", error);
        res.status(500).json({ error: error.message });
    }
});

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🐭 ねずみAPIサーバーがポート ${PORT} で立ち上がったちゅ！`);
    console.log(`テストURL: http://localhost:${PORT}/api/tarot?userId=test1234&username=ねずみファン`);
});