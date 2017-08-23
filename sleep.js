export default async (delay) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};
