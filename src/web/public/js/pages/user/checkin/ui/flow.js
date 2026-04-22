import ui from '../../../../modules/ui/index.js';
import { isDesktop } from '../../../../modules/utils/browser/viewport.js';

/**
 *
 * @param {{
 *    step: HTMLDivElement,
 *    hint: HTMLDivElement,
 *    input: HTMLInputElement,
 *    btn: HTMLButtonElement,
 *    focusTarget: HTMLInputElement,
 * }} els
 * @returns
 */
export const createStepFlow = (els) => {
  const resolveTarget = (override) => override ?? els.step;

  const transitions = {
    idle: async (msg = null, options = {}) => {
      const { input, btn, hint, focusTarget } = els;

      const target = resolveTarget(options.target);

      ui.element.setProcessing(target, false);

      if (input) {
        input.disabled = false;
        input.classList.remove('error');
      }

      if (btn) {
        btn.disabled = false;
      }

      if (focusTarget && isDesktop()) {
        focusTarget.focus();
      }

      if (msg) await ui.hint.showHint(hint, msg);
      else await ui.hint.clear(hint);
    },

    processing: async (msg = 'Processando...', options = {}) => {
      const { input, btn, hint } = els;

      const target = resolveTarget(options.target);

      ui.element.setProcessing(target, true);

      if (input) {
        input.disabled = true;
        input.blur();
      }

      if (btn) {
        btn.disabled = true;
      }

      await ui.hint.showHint(hint, msg);
    },

    success: async (msg, options = {}) => {
      const { hint } = els;

      const target = resolveTarget(options.target);

      ui.element.setProcessing(target, false);

      if (msg) await ui.hint.showHint(hint, msg);
    },

    error: async (msg = 'Erro', options = {}) => {
      const { input, btn, hint, focusTarget } = els;

      const target = resolveTarget(options.target);

      ui.element.setProcessing(target, false);

      if (input) {
        input.classList.add('error');
        input.disabled = false;
      }

      if (btn) {
        btn.disabled = false;
      }

      if (focusTarget) {
        focusTarget.focus();
      }

      await ui.hint.showError(hint, msg);
    },

    hidden: async (_msg, options = {}) => {
      const { input, btn, hint } = els;

      const target = resolveTarget(options.target);

      ui.element.setProcessing(target, false);

      if (input) {
        input.value = '';
        input.classList.remove('error');
        input.disabled = true;
        input.blur();
      }

      if (btn) {
        btn.disabled = true;
      }

      await ui.hint.clear(hint);
    },
  };

  const transition = async (state, payload) => {
    const fn = transitions[state];

    if (!fn) {
      console.warn(`[Flow] Unknown state: ${state}`);
      return;
    }

    if (Array.isArray(payload)) {
      await fn(...payload);
    } else {
      await fn(payload);
    }
  };

  return {
    transition,

    idle: async (msg = null, options = {}) => transition('idle', [msg, options]),
    loading: async (msg = null, options = {}) =>
      transition('loading', [msg, options]),
    processing: async (msg = null, options = {}) =>
      transition('processing', [msg, options]),
    success: async (msg = null, options = {}) =>
      transition('success', [msg, options]),
    error: async (msg = null, options = {}) => transition('error', [msg, options]),
    hidden: async (msg = null, options = {}) =>
      transition('hidden', [msg, options]),
  };
};
