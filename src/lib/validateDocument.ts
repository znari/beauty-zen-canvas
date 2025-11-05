/**
 * Validates CPF (Brazilian individual taxpayer ID)
 * CPF format: 000.000.000-00
 */
export const validateCPF = (cpf: string): boolean => {
  // Remove non-digits
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Check if has 11 digits
  if (cleanCPF.length !== 11) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

/**
 * Validates CNPJ (Brazilian company taxpayer ID)
 * CNPJ format: 00.000.000/0000-00
 */
export const validateCNPJ = (cnpj: string): boolean => {
  // Remove non-digits
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Check if has 14 digits
  if (cleanCNPJ.length !== 14) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validate first digit
  let sum = 0;
  let pos = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleanCNPJ.charAt(12))) return false;
  
  // Validate second digit
  sum = 0;
  pos = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleanCNPJ.charAt(13))) return false;
  
  return true;
};

/**
 * Validates CPF or CNPJ
 */
export const validateCPForCNPJ = (value: string): boolean => {
  const clean = value.replace(/\D/g, '');
  
  if (clean.length === 11) {
    return validateCPF(clean);
  } else if (clean.length === 14) {
    return validateCNPJ(clean);
  }
  
  return false;
};

/**
 * Returns only digits from a string
 */
export const cleanDocument = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Gets the appropriate mask based on input length
 */
export const getDocumentMask = (value: string): string => {
  const clean = value.replace(/\D/g, '');
  return clean.length <= 11 ? '999.999.999-999' : '99.999.999/9999-99';
};
