export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithBackOff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  backOff: number
) {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (e) {
      if (retries >= maxRetries) {
        throw e;
      }
      retries++;
      await sleep(backOff);
    }
  }
}
