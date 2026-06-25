import timing from './async/timing.js';
import { sleep } from './async/sleep.js';
import { isDesktop } from './browser/viewport.js';
import { formatPhone } from './formatters/phone.js';

const utils = {
  sleep,
  timing,
  isDesktop,
  formatPhone,
};

export default utils;
