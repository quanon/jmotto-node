import stringWidth from 'string-width';

export default (str, width) => {
  const currentWidth = stringWidth(str);

  if (currentWidth >= width) return str;

  return str.padStart(width - currentWidth + str.length);
};
