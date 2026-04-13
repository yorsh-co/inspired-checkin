import { qs } from '../../../../layouts/main/dom.js';

/**
 *
 */
export const populateStepValues = async (
  stepKey,
  data = {},
  { formatters = {} } = {},
) => {
  const values = { ...data };

  const elements = {};

  for (const key in values) {
    elements[key] = qs(`[data-checkin="${stepKey}-${key}"]`, {
      required: false,
    });
  }

  // apply formatters
  for (const key in values) {
    if (formatters[key]) {
      values[key] = formatters[key](values[key]);
    }
  }

  // display values
  for (const key in values) {
    const el = elements[key];
    if (!el) continue;

    el.dataset.checkinValue = data[key];
    el.textContent = values[key] ?? '';
  }
};
