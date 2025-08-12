// Secure data handling utilities
export class SecureDataHandler {
  // Mask sensitive financial data for display
  static maskFinancialData(amount: number, maskThreshold: number = 10000): string {
    if (amount > maskThreshold) {
      // For large amounts, show abbreviated format (e.g., 125K, 1.2M)
      if (amount >= 1000000) {
        return `R ${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `R ${(amount / 1000).toFixed(0)}K`;
      }
    }
    return `R ${amount.toLocaleString()}`;
  }

  // Encrypt sensitive data for storage
  static encryptData(data: string, key: string): string {
    // In a real implementation, this would use proper encryption
    // For demo purposes, we'll just reverse the string and add a prefix
    return `encrypted_${data.split('').reverse().join('')}`;
  }

  // Decrypt sensitive data
  static decryptData(encryptedData: string, key: string): string {
    // In a real implementation, this would use proper decryption
    // For demo purposes, we'll just reverse the string and remove the prefix
    if (encryptedData.startsWith('encrypted_')) {
      const data = encryptedData.substring(10);
      return data.split('').reverse().join('');
    }
    return encryptedData;
  }

  // Validate financial data
  static validateFinancialData(data: any): boolean {
    // Check if data has required financial fields
    const requiredFields = ['amount', 'date', 'type'];
    return requiredFields.every(field => field in data);
  }

  // Sanitize user input
  static sanitizeInput(input: string): string {
    // Remove potentially harmful characters
    return input.replace(/[<>]/g, '');
  }

  // Generate secure transaction ID
  static generateTransactionId(): string {
    // Generate a pseudo-random ID
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validate transaction ID format
  static validateTransactionId(id: string): boolean {
    // Check if ID follows the expected format
    return /^txn_\d+_[a-z0-9]{9}$/.test(id);
  }

  // Hash sensitive data for comparison
  static hashData(data: string): string {
    // Simple hash function for demo purposes
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone number format
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Validate CSRF token
  static validateCSRFToken(token: string, expected: string): boolean {
    return token === expected;
  }

  // Rate limiting function
  static isRateLimited(identifier: string, maxRequests: number, windowMs: number): boolean {
    // In a real implementation, this would use a proper rate limiting solution
    // For demo purposes, we'll just return false to allow all requests
    return false;
  }

  // Log security event
  static logSecurityEvent(event: string, details: any): void {
    console.log(`SECURITY EVENT: ${event}`, details);
  }

  // Validate password strength
  static validatePassword(password: string): boolean {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // Generate secure random string
  static generateSecureRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
}

// Secure storage interface
export interface SecureStorage {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
}

// Browser-based secure storage implementation
export class BrowserSecureStorage implements SecureStorage {
  private encryptionKey: string;

  constructor(encryptionKey: string) {
    this.encryptionKey = encryptionKey;
  }

  setItem(key: string, value: string): void {
    const encryptedValue = SecureDataHandler.encryptData(value, this.encryptionKey);
    localStorage.setItem(key, encryptedValue);
  }

  getItem(key: string): string | null {
    const encryptedValue = localStorage.getItem(key);
    if (encryptedValue) {
      return SecureDataHandler.decryptData(encryptedValue, this.encryptionKey);
    }
    return null;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

// Mock server-side secure storage implementation
export class ServerSecureStorage implements SecureStorage {
  private storage: Map<string, string> = new Map();
  private encryptionKey: string;

  constructor(encryptionKey: string) {
    this.encryptionKey = encryptionKey;
  }

  setItem(key: string, value: string): void {
    const encryptedValue = SecureDataHandler.encryptData(value, this.encryptionKey);
    this.storage.set(key, encryptedValue);
  }

  getItem(key: string): string | null {
    const encryptedValue = this.storage.get(key);
    if (encryptedValue) {
      return SecureDataHandler.decryptData(encryptedValue, this.encryptionKey);
    }
    return null;
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }
}