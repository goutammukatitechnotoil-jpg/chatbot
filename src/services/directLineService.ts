export interface Activity {
  type: string;
  id?: string;
  timestamp?: string;
  from: {
    id: string;
    name?: string;
  };
  text?: string;
  attachments?: any[];
}

export interface DirectLineConversation {
  conversationId: string;
  token: string;
}

export class DirectLineService {
  private static readonly CONNECTION_TIMEOUT_MS = 20000;
  private socket: WebSocket | null = null;
  private conversationId: string | null = null;
  private locale: string = 'en-US';
  private tokenEndpoint: string = '';
  private onMessageReceived: ((activity: Activity) => void) | null = null;
  private pendingActivities: Activity[] = [];

  constructor(tokenEndpoint?: string) {
    this.tokenEndpoint = tokenEndpoint || '';
    console.log('DirectLineService initialized for WebSocket Proxy');
  }

  setTokenEndpoint(endpoint: string): void {
    this.tokenEndpoint = endpoint;
  }

  private connectionPromise: Promise<void> | null = null;

  async initChat(locale?: string): Promise<void> {
    if (locale) this.locale = locale;
    
    // Avoid multiple simultaneous connections
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = this.buildWebSocketUrl(protocol);
        let isSettled = false;

        const settleReject = (error: Error): void => {
          if (isSettled) return;
          isSettled = true;
          this.connectionPromise = null;
          reject(error);
        };

        const settleResolve = (): void => {
          if (isSettled) return;
          isSettled = true;
          resolve();
        };
        
        console.log('Connecting DirectLineService to Proxy:', wsUrl);
        this.socket = new WebSocket(wsUrl);

        const timeout = setTimeout(() => {
          if (this.socket?.readyState !== WebSocket.OPEN) {
            this.socket?.close();
            settleReject(new Error('Connection timeout while connecting to chatbot proxy'));
          }
        }, DirectLineService.CONNECTION_TIMEOUT_MS);

        this.socket.onopen = () => {
          console.log('DirectLineService connected to proxy');
        };

        this.socket.onmessage = (event) => {
          let data: any;

          try {
            data = JSON.parse(event.data);
          } catch {
            console.warn('DirectLineService received non-JSON payload from proxy');
            return;
          }
          
          if (data.type === 'connection_ready') {
            clearTimeout(timeout);
            this.conversationId = data.conversationId;
            console.log('DirectLineService proxy ready:', this.conversationId);
            settleResolve();
          } else if (data.type === 'error') {
            clearTimeout(timeout);
            this.socket?.close();
            const errorText = typeof data.text === 'string' ? data.text : 'Messaging service unavailable';
            settleReject(new Error(errorText));
          } else if (data.type === 'bot_message' && this.onMessageReceived) {
            const activity: Activity = {
              type: 'message',
              id: data.id,
              from: { id: typeof data.fromId === 'string' ? data.fromId : 'bot' },
              text: data.text,
              attachments: data.attachments
            };
            this.onMessageReceived(activity);
          } else if (data.type === 'bot_message') {
            this.pendingActivities.push({
              type: 'message',
              id: data.id,
              from: { id: typeof data.fromId === 'string' ? data.fromId : 'bot' },
              text: data.text,
              attachments: data.attachments
            });
          }
        };

        this.socket.onclose = () => {
          clearTimeout(timeout);
          console.warn('DirectLineService proxy connection closed');
          const closedBeforeReady = !this.conversationId && this.socket?.readyState !== WebSocket.OPEN;
          this.socket = null;
          this.connectionPromise = null;

          if (closedBeforeReady) {
            settleReject(new Error('Chatbot proxy connection closed before initialization'));
          }
        };

        this.socket.onerror = () => {
          console.error('DirectLineService WebSocket error');
          clearTimeout(timeout);
          settleReject(new Error('Failed to establish WebSocket connection to chatbot proxy'));
        };
      } catch (err) {
        this.connectionPromise = null;
        reject(err);
      }
    });

    return this.connectionPromise;
  }

  private buildWebSocketUrl(protocol: 'ws:' | 'wss:'): string {
    const wsUrl = new URL(`${protocol}//${window.location.host}/ws`);

    if (this.tokenEndpoint?.trim()) {
      wsUrl.searchParams.set('tokenEndpoint', this.tokenEndpoint.trim());
    }

    return wsUrl.toString();
  }

  private async waitForConnection(): Promise<void> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      await this.initChat();
    }
    
    if (this.socket?.readyState === WebSocket.OPEN && this.conversationId) {
      return;
    }

    return this.connectionPromise || Promise.reject(new Error('Failed to initialize connection'));
  }

  async sendMessage(text: string): Promise<{ id: string } | void> {
    await this.waitForConnection();

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Proxy connection could not be established');
    }

    this.socket.send(JSON.stringify({
      type: 'user_message',
      text,
      locale: this.locale
    }));
    
    return { id: `user-${Date.now()}` };
  }

  async sendAdaptiveCardAction(actionData: any): Promise<void> {
    // Basic support for adaptive card actions through proxy
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
            type: 'user_message',
            text: typeof actionData === 'string' ? actionData : JSON.stringify(actionData),
            locale: this.locale
        }));
    }
  }

  async pollMessages(): Promise<Activity[]> {
    if (this.pendingActivities.length === 0) {
      return [];
    }

    const queued = [...this.pendingActivities];
    this.pendingActivities = [];
    return queued;
  }

  // Hook for Chatbot component to receive messages
  setMessageHandler(handler: (activity: Activity) => void): void {
    this.onMessageReceived = handler;
  }

  getConversationId(): string | null {
    return this.conversationId;
  }

  resetConversation(): void {
    if (this.socket) this.socket.close();
    this.conversationId = null;
    this.pendingActivities = [];
  }

  resetAll(): void {
    this.resetConversation();
  }
}
