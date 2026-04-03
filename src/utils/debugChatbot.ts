export async function testDirectLineConnection() {
  const TOKEN_ENDPOINT = 'https://796c75839a51e7df8f6f5151db27b9.90.environment.api.powerplatform.com/powervirtualagents/botsbyschema/cr7ac_agent_eP6wtl/directline/token?api-version=2022-03-01-preview';
  const DIRECT_LINE_URL = 'https://directline.botframework.com/v3/directline';

  console.log('=== Testing DirectLine Connection ===');

  try {
    console.log('1. Testing token endpoint...');
    const tokenRes = await fetch(TOKEN_ENDPOINT);
    console.log('Token response status:', tokenRes.status);

    if (!tokenRes.ok) {
      console.error('Token fetch failed:', tokenRes.status, tokenRes.statusText);
      return false;
    }

    const tokenData = await tokenRes.json();
    console.log('Token received:', !!tokenData.token);

    if (!tokenData.token) {
      console.error('No token in response');
      return false;
    }

    console.log('2. Testing conversation creation...');
    const convRes = await fetch(`${DIRECT_LINE_URL}/conversations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenData.token}` },
    });
    console.log('Conversation response status:', convRes.status);

    if (!convRes.ok) {
      const errorText = await convRes.text();
      console.error('Conversation creation failed:', convRes.status, convRes.statusText);
      console.error('Error details:', errorText);
      return false;
    }

    const convData = await convRes.json();
    console.log('Conversation created:', !!convData.conversationId);

    if (!convData.conversationId) {
      console.error('No conversationId in response');
      return false;
    }

    console.log('3. Testing message send...');
    const messageRes = await fetch(`${DIRECT_LINE_URL}/conversations/${convData.conversationId}/activities`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'message',
        from: { id: 'testUser' },
        text: 'Test message',
      }),
    });

    console.log('Message send response status:', messageRes.status);

    if (!messageRes.ok) {
      const errorText = await messageRes.text();
      console.error('Message send failed:', messageRes.status, messageRes.statusText);
      console.error('Error details:', errorText);
      return false;
    }

    console.log('=== All tests passed! ===');
    return true;
  } catch (error) {
    console.error('Connection test error:', error);
    return false;
  }
}

export function clearChatStorage() {
  localStorage.removeItem('copilotToken');
  localStorage.removeItem('copilotConversation');
  console.log('Chat storage cleared');
}
