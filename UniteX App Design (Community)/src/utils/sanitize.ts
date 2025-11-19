/**
 * Utility functions for input sanitization and validation
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this for content that may contain HTML
 */
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // IMPORTANT: Replace & LAST to avoid double-encoding
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/&/g, '&amp;');
};

/**
 * Sanitize plain text (for bios, comments, etc.)
 * Preserves quotes and basic punctuation
 * Only removes dangerous HTML/script tags
 */
export const sanitizeText = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Only escape dangerous characters, preserve quotes and normal text
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
};

/**
 * Decode HTML entities back to normal text
 * Use this when displaying sanitized content
 */
export const decodeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  const textArea = document.createElement('textarea');
  textArea.innerHTML = input;
  return textArea.value;
};

/**
 * Sanitize user input for search queries
 */
export const sanitizeSearchInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>\"'&]/g, '')
    .trim()
    .substring(0, 100);
};

/**
 * Sanitize username input
 */
export const sanitizeUsername = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
    .substring(0, 30);
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  if (typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
  if (typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize and validate file names
 */
export const sanitizeFileName = (fileName: string): string => {
  if (typeof fileName !== 'string') return '';
  
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .substring(0, 255);
};

/**
 * Check if content contains potentially malicious patterns
 */
export const containsMaliciousContent = (content: string): boolean => {
  if (typeof content !== 'string') return false;
  
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i
  ];
  
  return maliciousPatterns.some(pattern => pattern.test(content));
};