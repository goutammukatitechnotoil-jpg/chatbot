import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';
 
// Common English stop words
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
  'while', 'of', 'at', 'by', 'for', 'with', 'through', 'during', 'before', 'after',
  'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
  'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
  'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
  'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren',
  'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn',
  'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn', 'hello', 'hi', 'hey',
  'thanks', 'thank', 'please', 'yes', 'no', 'ok', 'okay', 'sure', 'good', 'great',
  'nice', 'well', 'chatbot', 'bot', 'ai', 'assistant', 'help', 'support'
]);
 
// Additional chatbot-specific stop words
const CHATBOT_STOP_WORDS = new Set([
  'can', 'could', 'would', 'should', 'may', 'might', 'must', 'shall', 'will',
  'need', 'want', 'like', 'know', 'think', 'see', 'get', 'make', 'take', 'come',
  'go', 'say', 'tell', 'ask', 'give', 'find', 'look', 'use', 'work', 'try',
  'hello', 'hi', 'hey', 'goodbye', 'bye', 'thanks', 'thank', 'please', 'sorry',
  'excuse', 'pardon', 'welcome', 'greetings'
]);
 
// Combine all stop words
const ALL_STOP_WORDS = new Set([...STOP_WORDS, ...CHATBOT_STOP_WORDS]);
 
interface WordCount {
  word: string;
  count: number;
  percentage: number;
}
 
/**
* Clean and tokenize text
*/
function tokenizeText(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  
  // Convert to lowercase and remove punctuation, keep only alphanumeric and spaces
  // Normalize case
  const lower = text.toLowerCase();
 
  // Remove punctuation but keep all Unicode letters/numbers and spaces.
  // Use Unicode property escapes (\p{L} = letter, \p{N} = number).
  const cleaned = lower.replace(/[^\p{L}\p{N}\s]+/gu, ' ').replace(/\s+/g, ' ').trim();
 
  // If the environment supports Intl.Segmenter, use it for better word segmentation
  // (especially for languages without explicit spaces like Korean).
  let tokens: string[] = [];
  try {
    const hasHangul = /\p{Script=Hangul}/u.test(text);
    const hasHan = /\p{Script=Han}/u.test(text);
    const hasHiragana = /\p{Script=Hiragana}/u.test(text);
    const hasKatakana = /\p{Script=Katakana}/u.test(text);
 
    const Segmenter: any = (Intl as any).Segmenter;
    if (typeof Segmenter === 'function') {
      let locale: string | undefined = undefined;
      if (hasHangul) locale = 'ko';
      else if (hasHiragana || hasKatakana) locale = 'ja';
      else if (hasHan) locale = 'zh';
 
      const seg = new Segmenter(locale, { granularity: 'word' });
      tokens = Array.from(seg.segment(cleaned))
        .map((s: any) => (typeof s === 'string' ? s : s.segment))
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);
    }
  } catch (e) {
    // Fall back to whitespace splitting if Segmenter fails
    tokens = [];
  }
 
  if (!tokens || tokens.length === 0) {
    tokens = cleaned.length > 0 ? cleaned.split(/\s+/).filter(Boolean) : [];
  }
 
  // Decide minimum token length based on scripts present. For CJK/Hangul allow shorter tokens.
  const hasCJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(text);
  const minLen = hasCJK ? 1 : 3;
 
  // Filter out stop words and very short words
  return tokens.filter(word =>
    word.length >= minLen &&
    !ALL_STOP_WORDS.has(word) &&
    !/^\d+$/.test(word)
  );
}
 
/**
* Process chat conversations and count word frequencies
*/
function processChatData(conversations: any[]): Map<string, number> {
  const wordCounts = new Map<string, number>();
  
  conversations.forEach(conversation => {
    const chatHistory = conversation.chat_history || [];
    
    chatHistory.forEach((message: any) => {
      if (message && message.message && message.sender === 'user') {
        console.log('Processing message:', message.message);
        const tokens = tokenizeText(message.message);
        console.log('Tokens:', tokens);
 
        tokens.forEach(word => {
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        });
      }
    });
    
    // Also process form data messages if available
    if (conversation.form_data && conversation.form_data.message) {
      const tokens = tokenizeText(conversation.form_data.message);
      tokens.forEach(word => {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      });
    }
    
    // // Process last message if available
    // if (conversation.last_message) {
    //   const tokens = tokenizeText(conversation.last_message);
    //   tokens.forEach(word => {
    //     wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    //   });
    // }
  });
  
  return wordCounts;
}
 
/**
* Convert word counts to formatted array with percentages
*/
function formatWordCounts(wordCounts: Map<string, number>, maxWords: number = 100): WordCount[] {
  // Convert Map to array and sort by count
  const sortedWords = Array.from(wordCounts.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxWords);
  
  if (sortedWords.length === 0) return [];
  
  const maxCount = sortedWords[0][1];
  
  return sortedWords.map(([word, count]) => ({
    word,
    count,
    percentage: Math.round((count / maxCount) * 100)
  }));
}
 
async function wordcloudHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  try {
    const db = req.tenantDb;
    if (!db) {
      return res.status(500).json({ error: 'Tenant database connection failed' });
    }
 
    const { startDate, endDate, maxWords = 50 } = req.query;
 
    // Build query for date filtering
    let query: any = {};
    if (startDate && endDate) {
      query.created_at = {
        $gte: startDate,
        $lte: endDate
      };
    }
 
    // Get all leads with chat history
    const leads = await db.collection('leads')
      .find(query)
      .project({
        chat_history: 1,
        form_data: 1,
        last_message: 1,
        created_at: 1
      })
      .toArray();
 
    console.log(`📊 Processing word cloud for ${leads.length} conversations`);
 
    // Process chat data and generate word counts
    const wordCounts = processChatData(leads);
    const formattedWords = formatWordCounts(wordCounts, parseInt(maxWords as string));
 
    // Calculate total messages and unique words for metadata
    const totalMessages = leads.reduce((sum, lead) => {
      return sum + (lead.chat_history?.length || 0);
    }, 0);
 
    const totalWords = Array.from(wordCounts.values()).reduce((sum, count) => sum + count, 0);
 
    console.log(`✅ Generated word cloud: ${formattedWords.length} unique words from ${totalMessages} messages`);
 
    res.status(200).json({
      data: formattedWords,
      metadata: {
        totalConversations: leads.length,
        totalMessages,
        totalWords,
        uniqueWords: wordCounts.size,
        topWordsShown: formattedWords.length,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null
        },
        generatedAt: new Date().toISOString()
      }
    });
 
  } catch (error) {
    console.error('❌ Word cloud generation error:', error);
    res.status(500).json({
      error: 'Failed to generate word cloud',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
 
export default compose(withErrorHandling, withTenant)(wordcloudHandler);