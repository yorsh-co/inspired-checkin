export const ensureMinimum = async (startTime, min = 1200) => {
  const elapsed = Date.now() - startTime;
  if (elapsed < min) {
    await new Promise((r) => setTimeout(r, min - elapsed));
  }
};

export const waitForNextInterval = async (startTime, interval = 1000) => {
  const elapsed = Date.now() - startTime;

  const nextBoundary = Math.ceil(elapsed / interval) * interval;

  const waitTime = nextBoundary - elapsed;

  if (waitTime > 0) {
    await new Promise((r) => setTimeout(r, waitTime));
  }

  return {
    elapsed,
    nextBoundary,
    waited: waitTime,
  };
};

const duration = { ensureMinimum, waitForNextInterval };

export default duration;
