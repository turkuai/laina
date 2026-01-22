/**
 * Format a date object as DD.MM.YYYY
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string (DD.MM.YYYY)
 */
export const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 *Get the current date formatted as DD.MM.YYYY
 * @returns {string} Current date formatted as DD.MM.YYYY
 */
export const getCurrentDate = () => {
  return formatDate(new Date());
};
