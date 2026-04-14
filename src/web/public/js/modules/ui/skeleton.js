let skeletonStartTime = 0;

const MIN_SKELETON_TIME = 800;

// timing

export const start = () => {
  skeletonStartTime = Date.now();
};

export const ensureMinTime = async () => {
  const elapsed = Date.now() - skeletonStartTime;

  if (elapsed < MIN_SKELETON_TIME) {
    await new Promise((r) => setTimeout(r, MIN_SKELETON_TIME - elapsed));
  }
};

// rendering

export const render = (el) => {
  el.classList.add('skeleton');
};

export const clear = (el) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.remove('skeleton');
    });
  });
};

const skeleton = {
  render,
  clear,
};

export default skeleton;

// orchestration

export const withSkeleton = async (fn) => {
  const startTime = Date.now();

  const result = await fn();

  const elapsed = Date.now() - startTime;

  if (elapsed < MIN_SKELETON_TIME) {
    await new Promise((r) => setTimeout(r, MIN_SKELETON_TIME - elapsed));
  }

  return result;
};
