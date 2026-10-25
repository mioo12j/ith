(() => {
  const root = document.querySelector('#paQuizRoot');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let typing;
  let action;
  const overlay = document.createElement('dialog');
  overlay.className = 'arena-feedback-overlay';
  overlay.setAttribute('aria-label', 'Answer feedback');
  overlay.innerHTML = '<div class="arena-feedback-content"></div><div class="arena-feedback-actions"><button type="button" class="arena-feedback-close" data-dismiss>Okay</button><button type="button" class="arena-feedback-close" data-retry>Try again</button><button type="button" class="arena-feedback-close" data-forward>Go ahead</button></div>';
  document.querySelector('.official-tool').append(overlay);
  overlay.querySelector('button').addEventListener('click', () => overlay.close());
  overlay.querySelector('[data-retry]').addEventListener('click', () => { overlay.close(); action?.retry(); });
  overlay.querySelector('[data-forward]').addEventListener('click', () => { overlay.close(); root.querySelector('[data-q-next]')?.click(); });
  overlay.addEventListener('close', () => {
    if (overlay.open) return;
    clearInterval(typing);
    (root.querySelector('[data-q-next]:not([hidden])') || root.querySelector('.pa-opt'))?.focus();
  });
  function guide(message, state) {
    clearInterval(typing);
    if (overlay.open) overlay.close();
    const target = overlay.querySelector('.arena-feedback-content');
    overlay.querySelector('[data-dismiss]').textContent = state === 'ready' ? 'Okay, let’s start' : 'Okay, review answer';
    overlay.querySelector('[data-retry]').hidden = state !== 'wrong';
    overlay.querySelector('[data-forward]').hidden = state === 'ready';
    root.querySelector('.arena-guide')?.remove();
    overlay.querySelector('.arena-feedback-content').replaceChildren();
    let scene;
    if (!scene) {
      scene = document.createElement('div');
      scene.className = 'arena-guide';
      scene.innerHTML = '<img width="120" height="120" alt=""/><div class="arena-bubble"><strong></strong><p></p></div><div class="arena-sparks" aria-hidden="true"></div>';
      target.append(scene);
    }
    scene.dataset.state = state;
    scene.querySelector('img').src = 'assets/' + (state === 'wrong' ? 'turtle-check.png' : 'fox-point.png');
    scene.querySelector('strong').textContent = state === 'correct' ? 'Yes! Another step forward.' : state === 'wrong' ? 'Let’s figure it out together.' : 'Take your time. You’ve got this.';
    const text = scene.querySelector('p');
    text.textContent = message;
    // Keep the accessible message complete while the visual line types in.
    text.setAttribute('aria-label', message);
    if (!reduced.matches) {
      text.textContent = '';
      let i = 0;
      typing = setInterval(() => { text.textContent = message.slice(0, ++i); if (i >= message.length) clearInterval(typing); }, 18);
    }
    const sparks = scene.querySelector('.arena-sparks');
    sparks.replaceChildren();
    if (state === 'correct' && !reduced.matches) for (let i = 0; i < 12; i++) {
      const bit = document.createElement('i');
      bit.style.setProperty('--x', (i - 5.5) * 22 + 'px');
      bit.style.setProperty('--r', i * 47 + 'deg');
      sparks.append(bit);
    }
    queueMicrotask(() => overlay.showModal());
  }
  root.addEventListener('quiz:question', e => { if (e.detail?.first && !e.detail?.retry) guide('Choose an answer below. We’ll explore the explanation together.', 'ready'); });
  root.addEventListener('quiz:answer', e => {
    const d = e.detail;
    action = d;
    guide((d.timeout ? 'Time ran out. ' : '') + (d.correct && d.streak > 1 ? d.streak + ' correct in a row! ' : '') + (d.explanation || 'The correct answer is highlighted in the quiz.'), d.correct ? 'correct' : 'wrong');
  });
})();
