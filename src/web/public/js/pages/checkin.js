<script>
  const UserScores = (() => {
    const loaders = {};

    const eventListeners = () => {
      document.getElementById('email').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          UserScores.load();
        }
      });

      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('cell-ellipsis')) {
          e.target.classList.toggle('expanded');
        }
      });
    };

    /**
     *
     * @param {string} email
     * @returns
     */
    const load = (email) => {
      const button = document.getElementById('load-btn');
      if (button.disabled) return;

      reset_();

      const emailInput = document.getElementById('email');
      const errorDiv = document.getElementById('error');

      let userId = email
        ? StringUtils.normalizeEmail(email)
        : StringUtils.normalizeEmail(emailInput.value.trim());
      errorDiv.textContent = '';

      if (!userId) {
        errorDiv.textContent = 'Insira seu e-mail.';
        return;
      }
      if (!StringUtils.isValidEmail(userId)) {
        errorDiv.textContent = 'Insira um e-mail válido.';
        return;
      }

      button.disabled = true;
      loaders.button = Loaders.spinners.overlay(button);
      loaders.button.display();

      google.script.run
        .withSuccessHandler(handleResponse_)
        .withFailureHandler(handleFailure_)
        .doGet({ parameter: { route: `/api/users/${userId}/scores` } });
    };

    /**
     *
     * @param {ok: boolean, code: number, data: object, error: { type: string, message: string, details: string }} response
     * @returns
     */
    const handleResponse_ = (response) => {
      console.log(response.code, response.ok ? 'OK' : response.error);

      const button = document.getElementById('load-btn');
      button.disabled = false;
      loaders.button.revert();

      if (!response.ok) {
        document.getElementById('error').textContent =
          response.data.error.message +
          (response.data.error.message.endsWith('.') ? '' : '.');
        return;
      }

      renderSummaryTable_(response.data);
      renderScoresTable_(response.data.scores);
    };

    /**
     *
     * @param {JSON} error
     */
    const handleFailure_ = (error) => {
      loaders.button.revert();
      document.getElementById('load-btn').disabled = false;
      document.getElementById('error').textContent =
        'Erro do servidor. Tente novamente.';
      console.error(error);
    };

    /**
     *
     * @returns {[{ formTitle: string, formPoints: string, score: number }]}
     */
    const getValidScores_ = (scores) =>
      scores.filter((item) => item.score !== '');

    /**
     * @param {[{ formTitle: string, formPoints: string, score: number }]} scores
     * @returns {string}
     */
    const getAverageScore_ = (scores) => {
      const total = scores.reduce(
        (sum, obj) => sum + (Number(obj.score) || 0),
        0,
      );
      const average = scores.length ? total / scores.length : 0;
      return Number.isInteger(average) ? average : average.toFixed(1);
    };

    /**
     *
     * @param {email: string, alternatives: [string], name: string, scores: [object]} data
     */
    const renderSummaryTable_ = (data) => {
      const validScores = getValidScores_(data.scores);
      const average = getAverageScore_(validScores);

      const table = document.getElementById('summary-table');
      table.style.display = 'table';

      document.getElementById('user-name').textContent = data.name || '';
      document.getElementById('user-ids').textContent = data.alternatives
        ? data.alternatives.join(', ')
        : '';
      document.getElementById('user-num-responses').textContent =
        validScores.length || 0;
      document.getElementById('user-average-score').textContent =
        `${average} / 10`;
    };

    /**
     *
     * @param {[{ formTitle: string, formPoints: string, score: number }]} scores
     * @returns
     */
    const renderScoresTable_ = (scores) => {
      const table = document.getElementById('scores-table');
      const tbody = document.getElementById('scores-tbody');
      const emptyState = document.getElementById('empty-state');

      tbody.innerHTML = '';

      const validScores = getValidScores_(scores);

      if (!validScores || validScores.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        return;
      }

      emptyState.style.display = 'none';
      table.style.display = 'table';

      const template = document.getElementById('row-template');

      validScores.forEach((item) => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('.form-name').textContent = item.formTitle;
        clone.querySelector('.form-score').textContent =
          (item.formPoints !== 10
            ? (item.score / item.formPoints) * 10
            : item.score) + ' / 10';
        tbody.appendChild(clone);
      });

      document.getElementById('last-update-timestamp').textContent =
        `Atualizada em ${new Date().toLocaleString(
          navigator.languages?.[0] || navigator.language,
        )}.`;
    };

    const reset_ = () => {
      const el = (id) => document.getElementById(id);
      const textElementIds = [
        'user-name',
        'user-ids',
        'user-num-responses',
        'user-average-score',
        'last-update-timestamp',
      ];
      textElementIds.forEach((id) => (el(id).textContent = ''));

      const htmlElementIds = ['scores-tbody'];
      htmlElementIds.forEach((id) => (el(id).innerHTML = ''));

      const displayElementIds = ['summary-table', 'scores-table'];
      displayElementIds.forEach((id) => (el(id).style.display = 'none'));
    };

    return Object.freeze({
      eventListeners,
      load,
    });
  })();
</script>
