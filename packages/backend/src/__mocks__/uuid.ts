export const v4 = () => {
  // generate a short uuid
  const set = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uuid = "";
  for (let i = 0; i < 12; i++) {
    if (i % 4 === 3) {
      uuid += "-";
    }
    uuid += set[Math.floor(Math.random() * set.length)];
  }
  return uuid;
};
