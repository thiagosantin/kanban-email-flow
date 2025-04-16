
/**
 * Format numeric string as BRL currency
 */
export const formatCurrency = (value: string): string => {
  // Remove non-numeric characters
  const numericValue = value.replace(/\D/g, '');
  
  // Convert to number and format as BRL
  if (numericValue) {
    const amount = parseInt(numericValue, 10) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }
  return '';
};
