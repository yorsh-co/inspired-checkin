import duration from './async/duration.js';
import { sleep } from './async/sleep.js';
import { isDesktop } from './browser/viewport.js';
import { formatPhone } from './formatters/phone.js';

const utils = {
  sleep,
  duration,
  isDesktop,
  formatPhone,
};

export default utils;
