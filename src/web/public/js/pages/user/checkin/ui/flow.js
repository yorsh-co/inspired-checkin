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

      await ui.hint.clear(els.hint);

      if (els.input) els.input.classList.remove('error');
    },

    loading: async (msg = 'Carregando...') => {
      
      ui.skeleton.render(els.step);
      ui.element.setShow(els.step, true);
      
      await ui.hint.showHint(els.hint, msg);
    },

    processing: async (msg = 'Processando...') => {
      ui.element.setProcessing(els.step, true);
      
      if (els.input) {
        els.input.disabled = true;
        els.input.blur();
      }
      
      await ui.hint.showHint(els.hint, msg);
    },

    success: async (msg) => {
      ui.element.setProcessing(els.step, false);
      
      ui.skeleton.clear(els.step); // step
      
      if (msg) await ui.hint.showHint(els.hint, msg);
    },

    error: async (msg) => {
      ui.element.setProcessing(els.step, false);

      if (els.input) {
        els.input.classList.add('error');
        
        els.input.disabled = false;
        els.input.focus();
      }

      await ui.hint.showError(els.hint, msg);
    },
    
    hidden: async() => {
      ui.element.setProcessing(els.step, false);
      
      await ui.hint.clear(els.hint)
    }
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
