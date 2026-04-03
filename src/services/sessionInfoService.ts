// Session Information Service
// Captures device, browser, network, and location data for lead sessions

export interface SessionInfo {
  device_type: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
  operating_system: string;
  browser_type: string;
  browser_version: string;
  ip_address: string;
  network_type: 'Wi-Fi' | 'Mobile Data' | 'Unknown';
  timezone: string;
  country: string;
  user_agent: string;
  screen_resolution?: string;
  captured_at: string;
}

export class SessionInfoService {
  /**
   * Capture comprehensive session information from browser
   */
  static captureClientSideInfo(): Partial<SessionInfo> {
    try {
      const userAgent = navigator.userAgent;
      const deviceInfo = this.detectDevice(userAgent);
      const browserInfo = this.detectBrowser(userAgent);
      const networkInfo = this.detectNetworkType();
      
      return {
        device_type: deviceInfo.type,
        operating_system: deviceInfo.os,
        browser_type: browserInfo.name,
        browser_version: browserInfo.version,
        network_type: networkInfo,
        timezone: this.getTimezone(),
        user_agent: userAgent,
        screen_resolution: this.getScreenResolution(),
        captured_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error capturing client-side session info:', error);
      return {
        device_type: 'Unknown',
        operating_system: 'Unknown',
        browser_type: 'Unknown',
        browser_version: 'Unknown',
        network_type: 'Unknown',
        timezone: 'Unknown',
        user_agent: navigator?.userAgent || 'Unknown',
        captured_at: new Date().toISOString()
      };
    }
  }

  /**
   * Detect device type and operating system from user agent
   */
  private static detectDevice(userAgent: string): { type: SessionInfo['device_type']; os: string } {
    const ua = userAgent.toLowerCase();
    
    // Operating System Detection
    let os = 'Unknown';
    if (ua.includes('windows')) {
      if (ua.includes('windows phone')) os = 'Windows Phone';
      else if (ua.includes('windows nt 10')) os = 'Windows 10/11';
      else if (ua.includes('windows nt 6.3')) os = 'Windows 8.1';
      else if (ua.includes('windows nt 6.2')) os = 'Windows 8';
      else if (ua.includes('windows nt 6.1')) os = 'Windows 7';
      else os = 'Windows';
    } else if (ua.includes('mac os')) {
      if (ua.includes('iphone')) os = 'iOS';
      else if (ua.includes('ipad')) os = 'iPadOS';
      else os = 'macOS';
    } else if (ua.includes('android')) {
      os = 'Android';
    } else if (ua.includes('linux')) {
      os = 'Linux';
    } else if (ua.includes('cros')) {
      os = 'Chrome OS';
    }

    // Device Type Detection
    let deviceType: SessionInfo['device_type'] = 'Unknown';
    
    // Mobile detection
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || 
        ua.includes('ipod') || ua.includes('blackberry') || ua.includes('nokia') ||
        ua.includes('opera mini') || ua.includes('windows mobile') || 
        ua.includes('windows phone') || ua.includes('iemobile')) {
      deviceType = 'Mobile';
    }
    // Tablet detection
    else if (ua.includes('tablet') || ua.includes('ipad') || ua.includes('playbook') ||
             ua.includes('kindle') || (ua.includes('android') && !ua.includes('mobile'))) {
      deviceType = 'Tablet';
    }
    // Desktop detection (default for non-mobile, non-tablet)
    else {
      deviceType = 'Desktop';
    }

    return { type: deviceType, os };
  }

  /**
   * Detect browser type and version
   */
  private static detectBrowser(userAgent: string): { name: string; version: string } {
    const ua = userAgent.toLowerCase();
    
    let browserName = 'Unknown';
    let version = 'Unknown';

    try {
      if (ua.includes('edg/')) {
        browserName = 'Microsoft Edge';
        const match = ua.match(/edg\/([0-9.]+)/);
        version = match ? match[1] : 'Unknown';
      } else if (ua.includes('chrome/') && !ua.includes('chromium/')) {
        browserName = 'Google Chrome';
        const match = ua.match(/chrome\/([0-9.]+)/);
        version = match ? match[1] : 'Unknown';
      } else if (ua.includes('firefox/')) {
        browserName = 'Mozilla Firefox';
        const match = ua.match(/firefox\/([0-9.]+)/);
        version = match ? match[1] : 'Unknown';
      } else if (ua.includes('safari/') && !ua.includes('chrome/')) {
        browserName = 'Safari';
        const match = ua.match(/version\/([0-9.]+)/);
        version = match ? match[1] : 'Unknown';
      } else if (ua.includes('opera/') || ua.includes('opr/')) {
        browserName = 'Opera';
        const operaMatch = ua.match(/(?:opera|opr)\/([0-9.]+)/);
        version = operaMatch ? operaMatch[1] : 'Unknown';
      } else if (ua.includes('trident/')) {
        browserName = 'Internet Explorer';
        const match = ua.match(/rv:([0-9.]+)/);
        version = match ? match[1] : 'Unknown';
      }
    } catch (error) {
      console.error('Error detecting browser:', error);
    }

    return { name: browserName, version };
  }

  /**
   * Detect network connection type
   */
  private static detectNetworkType(): SessionInfo['network_type'] {
    try {
      // Use Network Information API if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        
        if (connection) {
          const effectiveType = connection.effectiveType;
          const type = connection.type;
          
          // Determine if it's likely mobile data or Wi-Fi
          if (type === 'wifi') return 'Wi-Fi';
          if (type === 'cellular') return 'Mobile Data';
          
          // Fallback based on effective type
          if (effectiveType === '4g' || effectiveType === '3g' || effectiveType === '2g') {
            return 'Mobile Data';
          }
        }
      }
      
      // Fallback: assume Wi-Fi for desktop, unknown for others
      const deviceType = this.detectDevice(navigator.userAgent).type;
      return deviceType === 'Desktop' ? 'Wi-Fi' : 'Unknown';
    } catch (error) {
      console.error('Error detecting network type:', error);
      return 'Unknown';
    }
  }

  /**
   * Get user's timezone
   */
  private static getTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      console.error('Error getting timezone:', error);
      return 'Unknown';
    }
  }

  /**
   * Get screen resolution
   */
  private static getScreenResolution(): string {
    try {
      return `${screen.width}x${screen.height}`;
    } catch (error) {
      console.error('Error getting screen resolution:', error);
      return 'Unknown';
    }
  }

  /**
   * Server-side IP address and country detection
   */
  static async enrichWithServerInfo(req: any, clientInfo: Partial<SessionInfo>): Promise<SessionInfo> {
    const ipAddress = this.extractIPAddress(req);
    const country = await this.getCountryFromIP(ipAddress);

    return {
      device_type: clientInfo.device_type || 'Unknown',
      operating_system: clientInfo.operating_system || 'Unknown',
      browser_type: clientInfo.browser_type || 'Unknown',
      browser_version: clientInfo.browser_version || 'Unknown',
      ip_address: ipAddress,
      network_type: clientInfo.network_type || 'Unknown',
      timezone: clientInfo.timezone || 'Unknown',
      country: country,
      user_agent: clientInfo.user_agent || req.headers['user-agent'] || 'Unknown',
      screen_resolution: clientInfo.screen_resolution,
      captured_at: clientInfo.captured_at || new Date().toISOString()
    };
  }

  /**
   * Extract IP address from request
   */
  private static extractIPAddress(req: any): string {
    try {
      // Try to get real IP from various headers (considering proxies, load balancers)
      const forwarded = req.headers['x-forwarded-for'];
      if (forwarded) {
        return forwarded.split(',')[0].trim();
      }
      
      return req.headers['x-real-ip'] || 
             req.headers['x-client-ip'] || 
             req.connection?.remoteAddress || 
             req.socket?.remoteAddress || 
             req.connection?.socket?.remoteAddress ||
             '127.0.0.1';
    } catch (error) {
      console.error('Error extracting IP address:', error);
      return '127.0.0.1';
    }
  }

  /**
   * Get country from IP address using a free geolocation service
   */
  private static async getCountryFromIP(ip: string): Promise<string> {
    try {
      // Skip local/private IPs
      if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
        return 'Local';
      }

      // Use a free IP geolocation service (ipapi.co)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(`https://ipapi.co/${ip}/country_name/`, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'FPT-Chatbot/1.0'
          }
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const country = await response.text();
          return country.trim() || 'Unknown';
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('Error fetching country data:', fetchError);
      }
    } catch (error) {
      console.error('Error getting country from IP:', error);
    }
    
    return 'Unknown';
  }

  /**
   * Get country from form data (prioritized over IP geolocation)
   */
  static getCountryFromFormData(formData: any): string {
    return formData?.country || 'Unknown';
  }

  /**
   * Create session info with form data priority for country
   */
  static async createSessionInfo(req: any, clientInfo: Partial<SessionInfo>, formData?: any): Promise<SessionInfo> {
    const serverInfo = await this.enrichWithServerInfo(req, clientInfo);
    
    // Use form data country if available, otherwise use IP-based country
    const country = formData ? this.getCountryFromFormData(formData) : serverInfo.country;
    
    return {
      ...serverInfo,
      country
    };
  }
}

export default SessionInfoService;
