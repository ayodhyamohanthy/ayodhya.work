/* ============================================================
   BUI — Beautiful UI components, hand-ported to vanilla JS
   Patterns from beautifului.dev (Turbo Design Studio)
   MIT reference implementation: github.com/ithmz/beautiful-ui
   Components: command palette, filter bar, code block,
               loading state, flowchart (no JS needed)
   No dependencies. No build step.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:absolute;left:-9999px;top:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (e) { reject(e); }
    });
  }

  /* ==========================================================
     1. COMMAND PALETTE  — port of "15 — Search"
     ========================================================== */

  var ICONS = {
    section:  'M3 5.5h12M3 10h12M3 14.5h7',
    project:  'M4 2.5h5l3 3v8H4v-11zM6 8.5h4M6 10.8h3',
    action:   'M8.6 2 3.8 9h3.2l-.6 5 4.8-7H8l.6-5z',
    page:     'M3.5 3h5.2l2.8 3v7H3.5V3zM6 9.5h4M6 11.5h2.5',
    link:     'M6.5 9.5 11 5M7 4.2h1.8a2.6 2.6 0 0 1 2.6 2.6v0M9.5 6.5 5 11M9 11.8H7.2a2.6 2.6 0 0 1-2.6-2.6v0'
  };

  var PALETTE_GROUPS = [
    { kind: 'section', title: 'Jump to' },
    { kind: 'project', title: 'Projects' },
    { kind: 'page',    title: 'Pages' },
    { kind: 'action',  title: 'Actions' },
    { kind: 'link',    title: 'Elsewhere' }
  ];

  function buildIndex() {
    var items = [];
    var onCase = /case-study/.test(location.pathname);

    items.push({ id: 's-top', kind: 'section', label: 'Back to top', detail: 'Top of page', act: function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); } });

    var seen = { top: 1 };
    $$('.nav-links a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      if (!id || seen[id]) return;
      seen[id] = 1;
      items.push({
        id: 's-' + id, kind: 'section',
        label: a.textContent.trim(),
        detail: 'Jump to section',
        act: function () { goTo('#' + id); }
      });
    });

    $$('.work-grid .card').forEach(function (card, i) {
      var t = card.querySelector('.card-title');
      var y = card.querySelector('.card-year');
      var d = card.querySelector('.card-desc');
      if (!t) return;
      items.push({
        id: 'p-' + i, kind: 'project',
        label: t.textContent.trim(),
        detail: [y ? y.textContent.trim() : '', d ? d.textContent.trim().replace(/\s+/g, ' ').slice(0, 64) : ''].filter(Boolean).join(' · '),
        act: function () { location.href = card.getAttribute('href') || 'case-study.html'; }
      });
    });

    if (onCase) {
      items.push({ id: 'pg-home', kind: 'page', label: 'Back to all work', detail: 'index.html', act: function () { location.href = 'index.html'; } });
    } else {
      items.push({ id: 'pg-case', kind: 'page', label: 'Atlas — case study', detail: 'Query builder, 2026', act: function () { location.href = 'case-study.html'; } });
    }

    items.push({ id: 'a-mail', kind: 'action', label: 'Send an email', detail: 'hello@ayodhya.design', act: function () { location.href = 'mailto:hello@ayodhya.design'; } });
    items.push({ id: 'a-copy', kind: 'action', label: 'Copy email address', detail: 'hello@ayodhya.design', act: function () { copyText('hello@ayodhya.design'); } });

    var themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      items.push({ id: 'a-theme', kind: 'action', label: 'Toggle warm dusk mode', detail: 'Switch the theme', act: function () { themeBtn.click(); } });
    }

    $$('.socials a').forEach(function (a, i) {
      var name = a.textContent.trim().split(/\s+/)[0] || 'Link';
      var href = a.getAttribute('href');
      items.push({
        id: 'l-' + i, kind: 'link',
        label: name,
        detail: (href && href !== '#') ? href.replace(/^https?:\/\//, '') : 'Placeholder — update in the markup',
        act: (href && href !== '#') ? function () { window.open(href, '_blank', 'noopener'); } : function () { goTo('#contact'); }
      });
    });

    return items;
  }

  function goTo(hash) {
    var el = document.querySelector(hash);
    if (!el) { location.hash = hash; return; }
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', hash);
  }

  /* fuzzy subsequence match → { score, idx } or null */
  function fuzzy(needle, hay) {
    var q = needle.toLowerCase().replace(/\s+/g, '');
    if (!q) return { score: 0, idx: [] };
    var h = hay.toLowerCase();
    var hi = 0, idx = [], score = 0, i, j;
    for (i = 0; i < q.length; i++) {
      var found = -1;
      for (j = hi; j < h.length; j++) {
        if (h.charAt(j) === q.charAt(i)) { found = j; break; }
      }
      if (found === -1) return null;
      idx.push(found);
      if (found === hi) score += 6; else score += 1;
      if (found === 0 || /[\s\-/·:,.]/.test(h.charAt(found - 1))) score += 5;
      hi = found + 1;
    }
    return { score: score - (idx[0] || 0) * 0.15 - hay.length * 0.01, idx: idx };
  }

  function markUp(text, idx) {
    if (!idx || !idx.length) return esc(text);
    var set = {}, i;
    for (i = 0; i < idx.length; i++) set[idx[i]] = true;
    var out = '', open = false;
    for (i = 0; i < text.length; i++) {
      if (set[i] && !open) { out += '<mark>'; open = true; }
      else if (!set[i] && open) { out += '</mark>'; open = false; }
      out += esc(text.charAt(i));
    }
    if (open) out += '</mark>';
    return out;
  }

  var Palette = (function () {
    var root, input, list, count, items = [], flat = [], sel = 0, lastFocus = null, open = false;

    function mount() {
      root = document.getElementById('buiPalette');
      if (!root) { build(); }
      root = document.getElementById('buiPalette');
      if (!root) return false;
      input = document.getElementById('buiSearch');
      list = document.getElementById('buiResults');
      count = document.getElementById('buiCount');
      return !!(input && list);
    }

    function build() {
      var el = document.createElement('div');
      el.id = 'buiPalette';
      el.className = 'bui-palette';
      el.hidden = true;
      el.innerHTML =
        '<div class="bui-palette__scrim" data-bui-close></div>' +
        '<div class="bui-palette__panel" role="dialog" aria-modal="true" aria-label="Command palette">' +
          '<div class="bui-palette__input">' +
            '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="4.8" stroke="currentColor" stroke-width="1.4"/><path d="M11.6 11.6 15 15" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>' +
            '<input id="buiSearch" type="text" placeholder="Search sections, projects, actions…" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="buiResults" aria-autocomplete="list" aria-label="Search" />' +
            '<kbd>esc</kbd>' +
          '</div>' +
          '<div class="bui-palette__results" id="buiResults" role="listbox" aria-label="Results"></div>' +
          '<div class="bui-palette__foot">' +
            '<p id="buiCount"></p>' +
            '<p class="bui-palette__hints"><kbd>&uarr;</kbd><kbd>&darr;</kbd> navigate <kbd>&crarr;</kbd> open</p>' +
          '</div>' +
        '</div>';
      document.body.appendChild(el);
    }

    function render() {
      var q = input.value.trim();
      var scored = [];
      items.forEach(function (it) {
        if (!q) { scored.push({ it: it, score: 0, idx: [] }); return; }
        var a = fuzzy(q, it.label);
        var b = fuzzy(q, it.detail || '');
        if (!a && !b) return;
        scored.push({
          it: it,
          score: (a ? a.score * 2 : 0) + (b ? b.score : 0),
          idx: a ? a.idx : [],
          didx: b ? b.idx : []
        });
      });
      scored.sort(function (x, y) { return y.score - x.score; });

      flat = scored.map(function (s) { return s.it; });
      if (sel >= flat.length) sel = 0;
      if (sel < 0) sel = flat.length - 1;

      if (!flat.length) {
        list.innerHTML =
          '<div class="bui-palette__empty">' +
            '<p>Nothing matches &ldquo;' + esc(q) + '&rdquo;</p>' +
            '<span>try a section, a project name, or an action</span>' +
          '</div>';
        count.textContent = '0 results';
        return;
      }

      var html = '';
      PALETTE_GROUPS.forEach(function (g) {
        var inGroup = [];
        scored.forEach(function (s) { if (s.it.kind === g.kind) inGroup.push(s); });
        if (!inGroup.length) return;
        html += '<div class="bui-palette__group" data-group="' + g.kind + '">' +
                '<p class="bui-palette__glabel">' + esc(g.title) + '</p>';
        inGroup.forEach(function (s) {
          var i = flat.indexOf(s.it);
          var on = i === sel;
          var did = 'bui-opt-' + i;
          html +=
            '<button type="button" class="bui-palette__item" role="option" id="' + did + '" ' +
              'data-index="' + i + '" data-selected="' + (on ? 'true' : 'false') + '" aria-selected="' + (on ? 'true' : 'false') + '">' +
              '<span class="bui-palette__icon"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="' + (ICONS[g.kind] || ICONS.action) + '" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
              '<span class="bui-palette__text">' +
                '<span class="bui-palette__label">' + markUp(s.it.label, s.idx) + '</span>' +
                '<span class="bui-palette__detail">' + markUp(s.it.detail || '', s.didx) + '</span>' +
              '</span>' +
              (g.kind === 'action' ? '<kbd>&crarr;</kbd>' : '') +
            '</button>';
        });
        html += '</div>';
      });

      list.innerHTML = html;
      count.textContent = flat.length + (flat.length === 1 ? ' result' : ' results');
      input.setAttribute('aria-activedescendant', 'bui-opt-' + sel);
    }

    function move(delta) {
      if (!flat.length) return;
      sel = (sel + delta + flat.length) % flat.length;
      render();
      var node = list.querySelector('[data-selected="true"]');
      if (node && node.scrollIntoView) node.scrollIntoView({ block: 'nearest' });
    }

    function run(i) {
      var it = flat[i];
      if (!it) return;
      close();
      setTimeout(function () { it.act(); }, reduce ? 0 : 120);
    }

    function show() {
      if (!mount() || open) return;
      items = buildIndex();
      lastFocus = document.activeElement;
      root.hidden = false;
      open = true;
      document.body.style.overflow = 'hidden';
      input.value = '';
      sel = 0;
      render();
      setTimeout(function () { input.focus(); }, 10);
    }

    function close() {
      if (!open) return;
      open = false;
      root.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function init() {
      if (!mount()) return;

      input.addEventListener('input', function () { sel = 0; render(); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
        else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
        else if (e.key === 'Home') { e.preventDefault(); sel = 0; render(); }
        else if (e.key === 'End') { e.preventDefault(); sel = flat.length - 1; render(); }
      });

      list.addEventListener('mousemove', function (e) {
        var t = e.target.closest ? e.target.closest('.bui-palette__item') : null;
        if (!t) return;
        var i = parseInt(t.getAttribute('data-index'), 10);
        if (i !== sel) { sel = i; render(); }
      });
      list.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('.bui-palette__item') : null;
        if (t) run(parseInt(t.getAttribute('data-index'), 10));
      });

      root.addEventListener('click', function (e) {
        if (e.target.hasAttribute && e.target.hasAttribute('data-bui-close')) close();
      });

      document.addEventListener('keydown', function (e) {
        var k = e.key.toLowerCase();
        if ((e.metaKey || e.ctrlKey) && k === 'k') { e.preventDefault(); open ? close() : show(); return; }
        if (e.key === 'Escape' && open) { e.preventDefault(); close(); return; }
        if (k === '/' && !open) {
          var t = e.target;
          var tag = t && t.tagName ? t.tagName.toLowerCase() : '';
          if (tag === 'input' || tag === 'textarea' || (t && t.isContentEditable)) return;
          if (e.metaKey || e.ctrlKey || e.altKey) return;
          e.preventDefault(); show();
        }
      });

      var btn = document.getElementById('buiKbtn');
      if (btn) btn.addEventListener('click', show);
    }

    return { init: init, open: show, close: close, toggle: function () { open ? close() : show(); } };
  })();

  /* ==========================================================
     2. FILTER BAR  — port of "13 — Filter table"
     ========================================================== */

  var DISCIPLINES = [
    { key: 'product',     label: 'Product design', words: ['product design', 'product'] },
    { key: 'data',        label: 'Data UX',        words: ['data ux', 'data'] },
    { key: 'systems',     label: 'Design systems', words: ['design systems', 'design system', 'systems', 'system', 'tokens'] },
    { key: 'research',    label: 'UX research',    words: ['ux research', 'user research', 'research'] },
    { key: 'interaction', label: 'Interaction',    words: ['interaction', 'interactions', 'motion'] },
    { key: 'ops',         label: 'Design ops',     words: ['design ops', 'ops'] },
    { key: 'fintech',     label: 'Fintech',        words: ['fintech', 'finance'] },
    { key: 'b2b',         label: 'B2B',            words: ['b2b', 'enterprise'] }
  ];

  var Filter = (function () {
    var root, form, input, row, status, grid, cards = [], chips = [], empty = null;

    function cardData(card) {
      var tags = $$('.tag', card).map(function (t) { return t.textContent.trim(); });
      var text = [
        card.querySelector('.card-title') ? card.querySelector('.card-title').textContent : '',
        card.querySelector('.card-desc') ? card.querySelector('.card-desc').textContent : '',
        tags.join(' ')
      ].join(' ').toLowerCase().replace(/\s+/g, ' ');
      return {
        el: card,
        disciplines: (card.getAttribute('data-discipline') || '').toLowerCase().split(/\s+/).filter(Boolean),
        year: card.getAttribute('data-year') || '',
        text: text
      };
    }

    function has(id) {
      return chips.some(function (c) { return c.id === id; });
    }

    function parse(q) {
      var raw = q.trim();
      if (!raw) return [];
      var lower = ' ' + raw.toLowerCase() + ' ';
      var out = [];
      DISCIPLINES.forEach(function (d) {
        var hit = d.words.some(function (w) { return lower.indexOf(w) > -1; });
        if (hit && !has('d:' + d.key)) out.push({ id: 'd:' + d.key, kind: 'discipline', key: d.key, label: d.label });
      });
      var years = raw.match(/(20\d{2})/g) || [];
      years.forEach(function (y) {
        if (!has('y:' + y)) out.push({ id: 'y:' + y, kind: 'year', key: y, label: y });
      });
      if (!out.length) out.push({ id: 't:' + raw.toLowerCase(), kind: 'text', key: raw.toLowerCase(), label: '“' + raw + '”' });
      return out;
    }

    function matches(cd) {
      return chips.every(function (c) {
        if (c.kind === 'discipline') return cd.disciplines.indexOf(c.key) > -1;
        if (c.kind === 'year') return cd.year === c.key;
        if (c.kind === 'text') return cd.text.indexOf(c.key) > -1;
        return true;
      });
    }

    function apply() {
      var n = 0;
      cards.forEach(function (cd) {
        var on = matches(cd);
        cd.el.classList.toggle('is-hidden', !on);
        if (on) n++;
      });

      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'bui-empty';
        empty.textContent = 'no projects match these filters';
      }
      if (n === 0 && empty.parentNode !== grid) grid.appendChild(empty);
      if (n > 0 && empty.parentNode === grid) grid.removeChild(empty);

      var filters = chips.length
        ? ' · ' + chips.map(function (c) { return c.label; }).join(' + ')
        : '';
      status.textContent = 'Showing ' + n + ' of ' + cards.length + ' projects' + filters;
      drawRow();
    }

    function drawRow() {
      var html = '';
      if (!chips.length) {
        html += '<span class="bui-filter__try">try:</span>';
        var counts = {};
        cards.forEach(function (cd) {
          cd.disciplines.forEach(function (d) { counts[d] = (counts[d] || 0) + 1; });
        });
        DISCIPLINES.filter(function (d) { return counts[d.key]; })
          .sort(function (a, b) { return counts[b.key] - counts[a.key]; })
          .slice(0, 5)
          .forEach(function (d) {
            html += '<button type="button" class="bui-chip" data-add="d:' + d.key + '">' + esc(d.label) +
                    ' <span class="bui-chip__n">' + counts[d.key] + '</span></button>';
          });
        var years = {};
        cards.forEach(function (cd) { if (cd.year) years[cd.year] = (years[cd.year] || 0) + 1; });
        Object.keys(years).sort().reverse().slice(0, 2).forEach(function (y) {
          html += '<button type="button" class="bui-chip" data-add="y:' + y + '">' + esc(y) +
                  ' <span class="bui-chip__n">' + years[y] + '</span></button>';
        });
      } else {
        chips.forEach(function (c) {
          html += '<span class="bui-chip is-active">' + esc(c.label) +
                  '<button type="button" class="bui-chip__x" data-drop="' + esc(c.id) + '" aria-label="Remove filter ' + esc(c.label) + '">&times;</button></span>';
        });
        html += '<button type="button" class="bui-filter__clear" data-clear>clear</button>';
      }
      row.innerHTML = html;
    }

    function add(id) {
      var made = parse(id.replace(/^d:/, '').replace(/-/g, ' '));
      if (!made.length && /^y:/.test(id)) {
        made = [{ id: id, kind: 'year', key: id.slice(2), label: id.slice(2) }];
      }
      made.forEach(function (c) { if (!has(c.id)) chips.push(c); });
      apply();
    }

    function init() {
      root = document.getElementById('workFilter');
      grid = $('.work-grid');
      if (!root || !grid) return;

      form = $('.bui-filter__form', root);
      input = $('input', root);
      row = $('.bui-filter__row', root);
      status = $('.bui-filter__status', root);
      cards = $$('.card', grid).map(cardData);
      if (!form || !input || !row || !status || !cards.length) return;

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        parse(input.value).forEach(function (c) { if (!has(c.id)) chips.push(c); });
        input.value = '';
        apply();
      });

      row.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('[data-add],[data-drop],[data-clear]') : null;
        if (!t) return;
        if (t.hasAttribute('data-add')) { add(t.getAttribute('data-add')); return; }
        if (t.hasAttribute('data-drop')) {
          var id = t.getAttribute('data-drop');
          chips = chips.filter(function (c) { return c.id !== id; });
          apply();
          return;
        }
        chips = [];
        apply();
      });

      apply();
    }

    return { init: init };
  })();

  /* ==========================================================
     3. CODE BLOCK  — port of "17 — Code block"
     ========================================================== */

  function initCodeBlocks() {
    $$('[data-bui-code]').forEach(function (fig) {
      var btn = $('.bui-code__copy', fig);
      var pre = $('.bui-code__pre', fig);
      var foot = $('.bui-code__foot p', fig);
      var lines = $$('.bui-line', fig);
      if (!btn || !pre) return;

      var defaultNote = foot ? foot.textContent : '';

      var raw = lines.map(function (l) {
        var marker = l.getAttribute('data-diff');
        var code = $('.bui-line__code', l);
        return (marker || '') + (code ? code.textContent : '');
      }).join('\n');

      var timer = null;
      btn.addEventListener('click', function () {
        copyText(raw).catch(function () {});
        btn.classList.add('is-done');
        var label = $('span', btn);
        if (label) label.textContent = 'Copied';
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.classList.remove('is-done');
          if (label) label.textContent = 'Copy';
        }, 1600);
      });

      lines.forEach(function (l) {
        var no = $('.bui-line__no', l);
        if (!no) return;
        no.setAttribute('role', 'button');
        no.setAttribute('tabindex', '0');
        no.setAttribute('aria-label', 'Highlight line ' + no.textContent.trim().replace(/[+-]/g, ''));
        no.style.cursor = 'pointer';

        function pin() {
          lines.forEach(function (x) { x.classList.remove('is-hot'); });
          l.classList.add('is-hot');
          var note = l.getAttribute('data-note');
          if (foot) foot.textContent = note || ('Line ' + no.textContent.trim().replace(/[+-]/g, '') + ' — highlighted');
        }
        no.addEventListener('click', pin);
        no.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pin(); }
        });
      });

      /* restore the default note when the block is left alone */
      fig.addEventListener('dblclick', function () {
        lines.forEach(function (x) { x.classList.remove('is-hot'); });
        var hot = $('.bui-line[data-hot]', fig);
        if (hot) hot.classList.add('is-hot');
        if (foot) foot.textContent = defaultNote;
      });
    });
  }

  /* ==========================================================
     4. LOADING STATE  — port of "01 — Loading state"
     ========================================================== */

  var Loading = (function () {
    var PHASES = ['Gathering context…', 'Laying out the sections…', 'Almost there…'];
    var FLAG = 'bui:nav';
    var el = null, shownAt = 0, timer = null;

    function spin(node, label) {
      var phase = node.querySelector('.bui-loader__phase');
      if (!phase) return;
      phase.textContent = label || PHASES[0];
      if (reduce) return;
      var i = 1;
      timer = setInterval(function () {
        phase.textContent = PHASES[i % PHASES.length];
        phase.style.animation = 'none';
        void phase.offsetWidth;
        phase.style.animation = '';
        i++;
      }, 1200);
    }

    function show(label) {
      if (el) return;
      el = document.createElement('div');
      el.className = 'bui-loader';
      el.setAttribute('role', 'status');
      el.innerHTML =
        '<div class="bui-loader__box">' +
          '<div class="bui-loader__top">' +
            '<span class="bui-loader__ring" aria-hidden="true"><i></i></span>' +
            '<p class="bui-loader__phase">Loading…</p>' +
          '</div>' +
          '<div class="bui-loader__bars" aria-hidden="true">' +
            '<div class="bui-loader__bar" style="width:100%"><i></i></div>' +
            '<div class="bui-loader__bar" style="width:92%"><i></i></div>' +
            '<div class="bui-loader__bar" style="width:78%"><i></i></div>' +
            '<div class="bui-loader__bar" style="width:56%"><i></i></div>' +
          '</div>' +
          '<p class="bui-loader__note">Layout stays put while the page spins up.</p>' +
        '</div>';
      document.body.appendChild(el);
      shownAt = Date.now();
      document.body.style.overflow = 'hidden';
      spin(el, label);
    }

    function hide(force) {
      if (!el) return;
      clearInterval(timer);
      var node = el;
      el = null;
      var wait = force ? 0 : Math.max(0, 300 - (Date.now() - shownAt));
      setTimeout(function () {
        node.classList.add('is-leaving');
        setTimeout(function () {
          if (node.parentNode) node.parentNode.removeChild(node);
        }, reduce ? 0 : 240);
      }, wait);
      document.documentElement.classList.remove('bui-nav-loading');
      document.body.style.overflow = '';
      try { sessionStorage.removeItem(FLAG); } catch (e) {}
    }

    function init() {
      /* Did the visitor arrive from an internal page transition? The boot
         loader is already painted by the markup — take it over here. */
      var boot = document.getElementById('buiBootLoader');
      if (boot && document.documentElement.classList.contains('bui-nav-loading')) {
        el = boot;
        shownAt = Date.now();
        document.body.style.overflow = 'hidden';
        var label = '';
        try { label = sessionStorage.getItem(FLAG) || ''; } catch (e) {}
        spin(boot, label);
      }

      window.addEventListener('pageshow', function (e) { if (e.persisted) hide(true); });
      window.addEventListener('load', function () { hide(); });

      /* Flag internal page transitions so the next document shows the loader.
         Navigation itself is left to the browser — no interception, no delay. */
      document.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var a = e.target.closest ? e.target.closest('a[data-bui-nav]') : null;
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#') return;
        if (a.target && a.target !== '_self') return;
        try { sessionStorage.setItem(FLAG, a.getAttribute('data-bui-nav') || ''); } catch (err) {}
      });

      /* safety net — never trap the visitor behind the overlay */
      setTimeout(function () { hide(true); }, 5000);
    }

    return { init: init, show: show, hide: hide };
  })();

  /* ==========================================================
     BOOT
     ========================================================== */

  function boot() {
    Palette.init();
    Filter.init();
    initCodeBlocks();
    Loading.init();

    window.BUI = {
      palette: Palette,
      filter: Filter,
      loading: Loading,
      copy: copyText
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
