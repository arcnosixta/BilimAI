require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// =============================================
// Gmail конфигурациясы — .env файлынан алынады
// =============================================
const GMAIL_USER = process.env.GMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''; // Скрытый ключ
const PORT = process.env.PORT || 3001;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.warn('⚠️  GMAIL_USER және GMAIL_APP_PASSWORD орнатылмаған!');
  console.warn('   Мысалы: GMAIL_USER=your@gmail.com GMAIL_APP_PASSWORD=xxxx node index.js');
}

// Nodemailer транспорт
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

// =============================================
// Код сақтау — Map<email, { code, expiresAt }>
// =============================================
const verificationCodes = new Map();

const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 минут

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function cleanExpiredCodes() {
  const now = Date.now();
  for (const [email, entry] of verificationCodes) {
    if (now > entry.expiresAt) {
      verificationCodes.delete(email);
    }
  }
}

// Әр 5 минут сайын мерзімі біткен кодтарды тазалау
setInterval(cleanExpiredCodes, 5 * 60 * 1000);

// =============================================
// POST /api/send-code  — код жіберу
// =============================================
app.post('/api/send-code', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ ok: false, error: 'Email қате форматта' });
  }

  const code = generateCode();
  const expiresAt = Date.now() + CODE_EXPIRY_MS;

  verificationCodes.set(email.toLowerCase().trim(), { code, expiresAt });

  try {
    await transporter.sendMail({
      from: `"UBT App" <${GMAIL_USER}>`,
      to: email,
      subject: 'UBT App — Тіркелу коды',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 30px; background: #0D0B2E; border-radius: 16px; text-align: center;">
          <h2 style="color: #FFFFFF; margin-bottom: 8px;">UBT App</h2>
          <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 24px;">Тіркелу коды</p>
          <div style="background: rgba(108,99,255,0.15); border: 2px solid #6C63FF; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <span style="font-size: 36px; font-weight: bold; color: #6C63FF; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="color: rgba(255,255,255,0.4); font-size: 12px;">Код 10 минут ішінде жарамды</p>
          <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin-top: 16px;">Егер сіз тіркелмесеңіз, бұл хатты елемеңіз.</p>
        </div>
      `,
    });

    console.log(`✅ Код жіберілді: ${email}`);
    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Email жіберу қатесі:', err.message);
    res.status(500).json({ ok: false, error: 'Email жіберу кезінде қате болды' });
  }
});

// =============================================
// POST /api/verify-code  — кодты тексеру
// =============================================
app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ ok: false, error: 'Email мен код міндетті' });
  }

  const key = email.toLowerCase().trim();
  const entry = verificationCodes.get(key);

  if (!entry) {
    return res.json({ ok: false, error: 'Код табылмады. Жаңа код сұраңыз.' });
  }

  if (Date.now() > entry.expiresAt) {
    verificationCodes.delete(key);
    return res.json({ ok: false, error: 'Код мерзімі аяқталды. Жаңа код сұраңыз.' });
  }

  if (entry.code !== code.trim()) {
    return res.json({ ok: false, error: 'Код дұрыс емес' });
  }

  // Код дұрыс — жойып тастаймыз
  verificationCodes.delete(key);
  console.log(`✅ Код расталды: ${email}`);
  res.json({ ok: true });
});

// =============================================
// POST /api/chat — Gemini AI прокси
// =============================================
app.post('/api/chat', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: `Сен BilimAI платформасының AI Кураторысың. Тек Қазақстан ҰБТ-сына байланысты сұрақтарға жауап бер.
Пәндер: математика, физика, химия, биология, Қазақстан тарихы, дүниежүзі тарихы, қазақ тілі, ағылшын тілі, география, информатика, оқу сауаттылығы, математикалық сауаттылық.
Жауаптарыңды тек қазақ тілінде бер. Қысқа, нақты, достық үнмен жаз.
Қажет болса нөмірленген тізім, формулалар мен эмодзи қолдан.
ҰБТ-ға байланысты емес сұрақтарға: "Мен тек ҰБТ сұрақтарына жауап беремін 📚" деп жауап бер.
Оқушыға мотивация бер, қателерін түсіндір, теорияны қарапайым тілмен айт.` }],
          },
          contents: messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }],
          })),
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', response.status, data);
      return res.status(response.status).json({ 
        error: data?.error?.message || 'Gemini API error' 
      });
    }

    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ text: aiResponse || 'Жауап алынбады.' });
  } catch (err) {
    console.error('Chat proxy error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// Health check
// =============================================
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Email verification server → http://localhost:${PORT}`);
});
