export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isDesktop = () => window.innerWidth >= 768;
