export class TurnstileCaptcha {
  /**
   *
   * @param {HTMLDivElement} captchaDiv
   * @param {Object} [options]
   * @param {string} [options.action]
   * @param {Object} [options.callback]
   */
  constructor(captchaDiv, options = {}) {
    this.el = captchaDiv;

    this.sitekey = captchaDiv.dataset.sitekey;

    if (!this.sitekey) throw new Error('[TunrstileCaptcha] missing siteKey');

    this.options = options;

    this.widgetId = null;
    this.isRendered;
  }

  async render() {
    const options = {
      sitekey: this.sitekey,
      size: 'flexible',
      appearance: 'interaction-only',
    };

    if (this.options.action) {
      options.action = this.options.action;
    }
    if (this.options.successCallback) {
      options.callback = this.options.successCallback;
    }
    if (this.options.errorCallback) {
      options['error-callback'] = this.options.errorCallback;
    }
    if (this.options.expiredCallback) {
      options['expired-callback'] = this.options.expiredCallback;
    }
    if (this.options.timeoutCallback) {
      options['timeout-callback'] = this.options.timeoutCallback;
    }

    this.widgetId = turnstile.render(`#${this.el.id}`, options);

    console.warn('Captcha rendered');
  }

  async getToken() {
    return turnstile.getResponse(this.widgetId);
  }

  async reset() {
    return turnstile.reset(this.widgetId);
  }

  async remove() {
    const res = turnstile.remove(this.widgetId);

    this.widgetId = null;

    return res;
  }

  async isExpired() {
    return turnstile.isExpired(this.widgetId);
  }
}
