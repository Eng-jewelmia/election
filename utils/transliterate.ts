
import React from 'react';

/**
 * Enhanced Avro-style Phonetic Engine
 */

const commonNames: Record<string, string> = {
  'rakib': 'রাকিব',
  'jewel': 'জুয়েল',
  'juwel': 'জুয়েল',
  'ornob': 'অর্ণব',
  'tusher': 'তুষার',
  'tushar': 'তুষার',
  'bin': 'বিন',
  'abir': 'আবির',
  'sumon': 'সুমন',
  'karim': 'করিম',
  'rahim': 'রহিম',
  'nandail': 'নান্দাইল',
  'bnp': 'বিএনপি',
  'bangla': 'বাংলা',
  'mou': 'মৌ',
  'shohel': 'সোহেল',
  'shohag': 'সোহাগ',
  'rabbane': 'রাব্বানী',
  'ghoshpala': 'ঘোষপালা',
  'gushpala': 'ঘোষপালা',
  'aliya': 'আলিয়া',
  'madrasa': 'মাদ্রাসা',
  'madrasah': 'মাদ্রাসা'
};

const fullVowels: Record<string, string> = {
  'a': 'অ', 'aa': 'আ', 'i': 'ই', 'ee': 'ঈ', 'u': 'উ', 'oo': 'ঊ',
  'e': 'এ', 'oi': 'ঐ', 'o': 'ও', 'ou': 'ঔ', 'A': 'আ', 'I': 'ই', 'U': 'উ'
};

const vowelSigns: Record<string, string> = {
  'a': 'া', 'aa': 'া', 'i': 'ি', 'ee': 'ী', 'u': 'ু', 'oo': 'ূ',
  'e': 'ে', 'oi': 'ৈ', 'o': 'ো', 'ou': 'ৌ', 'A': 'া', 'I': 'ি', 'U': 'ু'
};

const consonants: Record<string, string> = {
  'k': 'ক', 'kh': 'খ', 'g': 'গ', 'gh': 'ঘ', 'ng': 'ঙ',
  'c': 'চ', 'ch': 'ছ', 'j': 'জ', 'jh': 'ঝ', 'NG': 'ঞ',
  't': 'ট', 'th': 'ঠ', 'd': 'ড', 'dh': 'ঢ', 'n': 'ণ',
  'T': 'ত', 'Th': 'থ', 'D': 'দ', 'Dh': 'ধ', 'N': 'ন',
  'p': 'প', 'ph': 'ফ', 'f': 'ফ', 'b': 'ব', 'bh': 'ভ', 'v': 'ভ', 'm': 'ম',
  'z': 'য', 'r': 'র', 'l': 'ল', 'sh': 'শ', 'S': 'ষ', 's': 'স', 'h': 'হ',
  'R': 'ড়', 'Rh': 'ঢ়', 'y': 'য়', 'w': 'ও', 'Y': 'য়'
};

const clusters: Record<string, string> = {
  'kk': 'ক্ক', 'kt': 'ক্ত', 'ks': 'ক্স', 'gdh': 'গ্ধ', 'gg': 'জ্ঞ',
  'nc': 'ঞ্চ', 'nj': 'ঞ্জ', 'nt': 'ন্ত', 'nd': 'ন্দ', 'mp': 'ম্প', 
  'mb': 'ম্ব', 'st': 'স্ট', 'stt': 'স্ত', 'sk': 'স্ক', 'll': 'ল্ল', 
  'mm': 'ম্ম', 'nn': 'ন্ন', 'ng': 'ঙ', 'tr': 'ত্র'
};

export function transliterateToBangla(text: string): string {
  if (!text) return '';
  
  // Check common names dictionary first
  const lowerText = text.toLowerCase();
  if (commonNames[lowerText]) {
    return commonNames[lowerText];
  }

  let result = '';
  let i = 0;
  const n = text.length;

  while (i < n) {
    let charMatch = '';
    let isConsonant = false;

    // 1. Check for joint letters (clusters)
    if (i + 2 < n && clusters[text.substring(i, i + 3).toLowerCase()]) {
      charMatch = clusters[text.substring(i, i + 3).toLowerCase()];
      i += 3;
      isConsonant = true;
    } else if (i + 1 < n && clusters[text.substring(i, i + 2).toLowerCase()]) {
      charMatch = clusters[text.substring(i, i + 2).toLowerCase()];
      i += 2;
      isConsonant = true;
    } 
    // 2. Check for multi-char consonants
    else if (i + 1 < n && consonants[text.substring(i, i + 2).toLowerCase()]) {
      charMatch = consonants[text.substring(i, i + 2).toLowerCase()];
      i += 2;
      isConsonant = true;
    }
    // 3. Check for single-char consonants
    else if (consonants[text[i].toLowerCase()]) {
      charMatch = consonants[text[i].toLowerCase()];
      i += 1;
      isConsonant = true;
    }
    // 4. Check for vowels
    else {
      if (i + 1 < n && fullVowels[text.substring(i, i + 2).toLowerCase()]) {
        charMatch = fullVowels[text.substring(i, i + 2).toLowerCase()];
        i += 2;
      } else if (fullVowels[text[i].toLowerCase()]) {
        charMatch = fullVowels[text[i].toLowerCase()];
        i += 1;
      } else {
        charMatch = text[i];
        i += 1;
      }
    }

    if (isConsonant) {
      result += charMatch;
      let sign = '';
      if (i < n) {
        if (i + 1 < n && vowelSigns[text.substring(i, i + 2).toLowerCase()]) {
          sign = vowelSigns[text.substring(i, i + 2).toLowerCase()];
          i += 2;
        } else if (vowelSigns[text[i].toLowerCase()]) {
          sign = vowelSigns[text[i].toLowerCase()];
          i += 1;
        }
      }
      if (sign) result += sign;
    } else {
      result += charMatch;
    }
  }

  return result;
}

export function shouldTransliterate(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): boolean {
  const val = e.target.value;
  return val.endsWith(' ');
}
