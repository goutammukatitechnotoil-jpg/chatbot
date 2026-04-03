const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer, WebSocket } = require('ws');

// Basic environment variable loading
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = 3000;

// Security configuration
const SECURITY_CONFIG = {
  inputBlockedKeywords: ['prompt', 'system', 'config', 'export', 'schema', 'base64', 'decode'],
  inputInjections: ['{{', '}}', '```', 'json', 'python'],
  outputBlockedPhrases: ['system prompt', 'internal instruction', 'tool schema'],
  maxViolations: 3
};

// Violation tracker (in-memory for demo)
const sessionViolations = new Map();

function isInputSafe(text) {
  if (!text || typeof text !== 'string') return true;
  const lowerText = text.toLowerCase();
  
  // Check keywords
  for (const keyword of SECURITY_CONFIG.inputBlockedKeywords) {
    if (lowerText.includes(keyword)) return false;
  }
  
  // Check structured injection
  for (const injection of SECURITY_CONFIG.inputInjections) {
    if (lowerText.includes(injection)) return false;
  }
  
  return true;
}

function isOutputSafe(text) {
  if (typeof text !== 'string') return true;
  
  const lowerText = text.toLowerCase();
  
  // Block large structured JSON responses (potential data leak)
  if (text.length > 5000 && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
    return false;
  }
  
  for (const phrase of SECURITY_CONFIG.outputBlockedPhrases) {
    if (lowerText.includes(phrase)) return false;
  }
  
  return true;
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url);

    if (pathname === '/ws') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    } else {
      // Allow other upgrades (like Next.js HMR)
    }
  });

  wss.on('connection', async (ws, req) => {
    console.log('Client connected to WebSocket proxy');
    
    let directLineWs = null;
    let conversationId = null;
    let token = null;
    const clientId = Math.random().toString(36).substring(7);

    const cleanup = () => {
      if (directLineWs) {
        directLineWs.terminate();
        directLineWs = null;
      }
      sessionViolations.delete(clientId);
    };

    try {
      // 1. Generate Direct Line Token (Securely on server only)
      const botSecretRaw = process.env.BOT_DIRECT_LINE_SECRET;
      let botSecret = typeof botSecretRaw === 'string' ? botSecretRaw.trim() : '';
      const parsedReqUrl = parse(req.url, true);
      const requestedTokenEndpoint = parsedReqUrl.query.tokenEndpoint;
      const defaultTokenEndpoint = 'https://directline.botframework.com/v3/directline/tokens/generate';
      let tokenEndpoint = defaultTokenEndpoint;

      if (typeof requestedTokenEndpoint === 'string' && requestedTokenEndpoint.trim()) {
        try {
          const candidate = new URL(requestedTokenEndpoint.trim());
          if (candidate.protocol === 'https:') {
            tokenEndpoint = candidate.toString();
          } else {
            console.warn(`Ignoring non-HTTPS token endpoint: ${requestedTokenEndpoint}`);
          }
        } catch {
          console.warn(`Ignoring invalid token endpoint: ${requestedTokenEndpoint}`);
        }
      }

      // Backward compatibility: if BOT_DIRECT_LINE_SECRET is actually a URL,
      // treat it as a token endpoint and do not send it as a bearer secret.
      if (botSecret && /^https?:\/\//i.test(botSecret)) {
        if (tokenEndpoint === defaultTokenEndpoint) {
          tokenEndpoint = botSecret;
        }
        botSecret = '';
        console.warn('BOT_DIRECT_LINE_SECRET is a URL. Using it as token endpoint.');
      }
      
      console.log(`Generating token from endpoint: ${tokenEndpoint}`);

      const tokenData = await generateDirectLineToken({
        tokenEndpoint,
        botSecret,
        defaultTokenEndpoint
      });
      token = tokenData.token;

      // 2. Start/initialize a Direct Line conversation and use the returned streamUrl
      const conversationInit = await startDirectLineConversation(token);
      conversationId = conversationInit.conversationId;
      token = conversationInit.token || token;

      if (!conversationInit.streamUrl) {
        throw new Error('Direct Line did not return a streamUrl for the conversation.');
      }

      console.log(`Initialized conversation ${conversationId} for proxy client ${clientId}`);
      directLineWs = new WebSocket(conversationInit.streamUrl);

      directLineWs.on('open', () => {
        console.log(`Direct Line stream connected for client ${clientId}`);
        ws.send(JSON.stringify({ type: 'connection_ready', conversationId }));
      });

      directLineWs.on('message', (data) => {
        try {
          const activityJson = data.toString();
          if (!activityJson) return;
          
          const dataObj = JSON.parse(activityJson);
          if (dataObj.activities) {
            console.log(`[Proxy ${clientId}] Direct Line activity batch: ${dataObj.activities.length}`);
            dataObj.activities.forEach(act => {
              console.log(
                `[Proxy ${clientId}] Activity type=${act.type} from=${act.from?.id || 'unknown'} id=${act.id || 'n/a'}`
              );
              // Only proxy messages FROM the bot to the client
              if (act.from && act.from.id !== 'user' && act.from.id !== 'user1' && (act.type === 'message' || act.attachments)) {
                
                // OUTPUT FILTERING
                if (!isOutputSafe(act.text)) {
                  console.warn(`SECURITY: Blocked insecure bot response for client ${clientId}`);
                  ws.send(JSON.stringify({
                    type: 'bot_message',
                    text: '⚠️ Response blocked due to security policy.'
                  }));
                  return;
                }

                ws.send(JSON.stringify({
                  type: 'bot_message',
                  text: act.text,
                  attachments: act.attachments,
                  id: act.id,
                  fromId: act.from?.id,
                  entities: act.entities
                }));
                console.log(`[Proxy ${clientId}] Forwarded bot_message id=${act.id || 'n/a'}`);
              }
            });
          }
        } catch (e) {
          console.error('Error processing Direct Line message:', e);
        }
      });

      directLineWs.on('close', () => ws.close());
      directLineWs.on('error', (err) => {
        console.error('Direct Line WS Error:', err);
        ws.close();
      });

    } catch (error) {
      console.error('Proxy Error:', error);
      const safeErrorText =
        error instanceof Error && error.message
          ? error.message.slice(0, 500)
          : 'Messaging service unavailable';
      ws.send(JSON.stringify({ type: 'error', text: safeErrorText }));
      ws.close();
    }

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        
        if (msg.type === 'user_message') {
          console.log(`[Proxy ${clientId}] Received user_message: ${String(msg.text || '').slice(0, 120)}`);
          // INPUT FILTERING
          if (!isInputSafe(msg.text)) {
            console.warn(`SECURITY: Blocked malicious input from client ${clientId}: ${msg.text}`);
            
            const violations = (sessionViolations.get(clientId) || 0) + 1;
            sessionViolations.set(clientId, violations);

            if (violations >= SECURITY_CONFIG.maxViolations) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                text: '🚨 Session terminated due to repeated security violations.' 
              }));
              ws.close();
              return;
            }

            ws.send(JSON.stringify({
              type: 'bot_message',
              text: '🚫 Input blocked: Suspicious prompt pattern detected.'
            }));
            return;
          }

          const activityPayload = {
            type: 'message',
            from: { id: 'user1' },
            locale: msg.locale || 'en-US'
          };
          
          if (msg.text) activityPayload.text = msg.text;
          if (msg.value) activityPayload.value = msg.value;
          if (msg.channelData) activityPayload.channelData = msg.channelData;

          // Forward to Direct Line via REST API
          const postRes = await fetch(`https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(activityPayload)
          });

          if (!postRes.ok) {
            const postErr = await postRes.text();
            console.error(`[Proxy ${clientId}] Failed posting user message: ${postRes.status} ${postErr}`);
            ws.send(JSON.stringify({
              type: 'error',
              text: `Failed to send message to bot (${postRes.status}).`
            }));
            return;
          }

          const postData = await postRes.json().catch(() => null);
          console.log(
            `[Proxy ${clientId}] User message accepted by Direct Line. activityId=${postData?.id || 'unknown'}`
          );

          if (postData?.id && ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
              type: 'user_message_ack',
              id: postData.id
            }));
          }
        }
      } catch (err) {
        console.error('Error handling client WS message:', err);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      cleanup();
    });
    
    ws.on('error', () => cleanup());
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log(`> WebSocket proxy listening on /ws`);
  });
});

async function generateDirectLineToken({ tokenEndpoint, botSecret, defaultTokenEndpoint }) {
  const isDefaultEndpoint = tokenEndpoint === defaultTokenEndpoint;

  if (isDefaultEndpoint && !botSecret) {
    throw new Error(
      'Missing Direct Line secret. Set BOT_DIRECT_LINE_SECRET to your Direct Line channel secret, or configure a valid custom token endpoint URL.'
    );
  }

  const attempts = [];

  // Preferred: POST + Authorization (required for standard Direct Line secret flow)
  if (botSecret) {
    attempts.push({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${botSecret}`
      }
    });
  }

  // Some custom/PVA endpoints can work without Authorization
  if (!isDefaultEndpoint) {
    attempts.push({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    attempts.push({
      method: 'GET',
      headers: {}
    });
  }

  if (attempts.length === 0) {
    attempts.push({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  let lastStatus = null;
  let lastBody = '';

  for (const attempt of attempts) {
    const tokenRes = await fetch(tokenEndpoint, {
      method: attempt.method,
      headers: attempt.headers
    });

    if (tokenRes.ok) {
      return tokenRes.json();
    }

    lastStatus = tokenRes.status;
    lastBody = await tokenRes.text();
  }

  if (lastStatus === 403 && botSecret) {
    throw new Error(
      'Direct Line authentication failed (403). BOT_DIRECT_LINE_SECRET appears invalid or expired. Use your Direct Line channel secret, not a generated token.'
    );
  }

  throw new Error(
    `Failed to generate Direct Line token: ${lastStatus || 'unknown'} ${lastBody || ''}`.trim()
  );
}

async function startDirectLineConversation(token) {
  const startRes = await fetch('https://directline.botframework.com/v3/directline/conversations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!startRes.ok) {
    const errText = await startRes.text();
    throw new Error(`Failed to start Direct Line conversation: ${startRes.status} ${errText}`.trim());
  }

  return startRes.json();
}
