import ui from '../../../../modules/ui/index.js';

/**
 *
 * @param {{
 *    step: HTMLElement,
 *    hint: HTMLElement,
 *    input: HTMLElement,
 *    btn: HTMLElement
 * }} els
 * @returns
 */
export const createStepFlow = (els) => {
  const transitions = {
    idle: async () => {
      ui.element.setProcessing(els.step, false);

      if (els.input) els.input.classList.remove('error');

      await ui.hint.clear(els.hint);
    },

    loading: async (msg = 'Carregando...') => {
      ui.skeleton.render(el);
      ui.element.setShow(el, true);
      await ui.hint.showHint(hintEl, msg);
    },

    processing: async (msg = 'Processando...') => {
      ui.element.setProcessing(el, true);
      await ui.hint.showHint(hintEl, msg);
    },

    success: async (msg) => {
      ui.element.setProcessing(el, false);
      ui.skeleton.clear(el);
      if (msg) await ui.hint.showHint(hintEl, msg);
    },

    error: async (msg) => {
      ui.element.setProcessing(el, false);

      if (els.input) els.input.classList.add('error');

      await ui.hint.showError(hintEl, msg);
    },
  };

  const transition = async (state, payload) => {
    const fn = transitions[state];

    if (!fn) {
      console.warn(`[Flow] Unknown state: ${state}`);
      return;
    }

    await fn(payload);
  };

  return {
    transition,

    idle: (msg) => transition('idle', msg),
    loading: (msg) => transition('loading', msg),
    processing: (msg) => transition('processing', msg),
    success: (msg) => transition('success', msg),
    error: (msg) => transition('error', msg),
  };
};
