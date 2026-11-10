(function (root) {
  'use strict';

  var multipliers = Object.freeze({ sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725 });
  function fail(code) { var error = new Error(code); error.code = code; throw error; }
  function numeric(value, code, minimum, maximum, integer) {
    if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) fail('MISSING');
    if ((typeof value !== 'number' && typeof value !== 'string') ||
        (typeof value === 'string' && !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))) fail(code);
    var number = Number(value);
    if (!Number.isFinite(number) || number < minimum || number > maximum || (integer && !Number.isInteger(number))) fail(code);
    return number;
  }
  function sexValue(value) { if (value !== 'male' && value !== 'female') fail('SEX'); return value; }
  function formula(bmr, multiplier) { return { bmr: Math.round(bmr), tdee: Math.round(bmr * multiplier), rawBmr: bmr, rawTdee: bmr * multiplier }; }
  function tdee(input) {
    input = input || {};
    var age = numeric(input.age, 'AGE', 16, 80, true);
    if (age < 18) fail('ADULT_ONLY');
    var sex = sexValue(input.sex), cm = numeric(input.heightCm, 'HEIGHT', 120, 230), kg = numeric(input.weightKg, 'WEIGHT', 30, 250);
    if (!Object.prototype.hasOwnProperty.call(multipliers, input.activity)) fail('ACTIVITY');
    var multiplier = multipliers[input.activity], bodyFat = input.bodyFat;
    var blankFat = bodyFat === null || bodyFat === undefined || (typeof bodyFat === 'string' && !bodyFat.trim());
    if (!blankFat) bodyFat = numeric(bodyFat, 'BODYFAT', 5, 50);
    return {
      mifflin: formula(10 * kg + 6.25 * cm - 5 * age + (sex === 'male' ? 5 : -161), multiplier),
      harris: formula(sex === 'male' ? 88.362 + 13.397 * kg + 4.799 * cm - 5.677 * age : 447.593 + 9.247 * kg + 3.098 * cm - 4.330 * age, multiplier),
      katch: blankFat ? null : formula(370 + 21.6 * kg * (1 - bodyFat / 100), multiplier)
    };
  }
  function bmi(input) {
    input = input || {};
    var cm = numeric(input.heightCm, 'HEIGHT', 120, 230), kg = numeric(input.weightKg, 'WEIGHT', 30, 250), square = Math.pow(cm / 100, 2), raw = kg / square;
    return { raw: raw, bmi: Number(raw.toFixed(1)), category: raw < 18.5 ? 'underweight' : raw < 25 ? 'healthy' : raw < 30 ? 'overweight' : 'obese', low: Number((18.5 * square).toFixed(1)), high: Number((24.9 * square).toFixed(1)) };
  }
  function deficit(input, today) {
    input = input || {};
    // This is a positive arithmetic domain, not an intake recommendation.
    var energy = numeric(input.tdee, 'TDEE', Number.MIN_VALUE, 20000), sex = sexValue(input.sex), loss = numeric(input.loss, 'LOSS', .5, 50), pace = numeric(input.pace, 'PACE', .25, 1);
    if ([.25, .5, .75, 1].indexOf(pace) === -1) fail('PACE');
    var start = today === undefined ? new Date() : new Date(today);
    if (!Number.isFinite(start.getTime())) fail('DATE');
    var daily = 7700 * pace / 7, intake = energy - daily, minimum = sex === 'female' ? 1200 : 1500;
    var days = Math.ceil(loss * 7700 / daily), date = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 12);
    date.setDate(date.getDate() + days);
    if (!Number.isFinite(date.getTime())) fail('DATE');
    var iso = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    return { deficit: daily, intake: Math.round(intake), minimum: minimum, belowMinimum: intake < minimum, nonPositive: intake <= 0, days: days, weeks: days / 7, date: date, dateISO: iso };
  }

  function protein(input) {
    input = input || {};
    var age = numeric(input.age, 'AGE', 16, 80, true);
    if (age < 18) fail('ADULT_ONLY');
    if (input.kidneyDisease === true) return { restricted: true };
    var kg = numeric(input.weightKg, 'WEIGHT', 30, 250);
    if (['lose', 'maintain', 'gain'].indexOf(input.goal) === -1) fail('GOAL');
    var low = Math.round(kg * 1.6), high = Math.round(kg * 2.2);
    return { restricted: false, dailyLow: low, dailyHigh: high, mealLow: Math.round(low / 3), mealHigh: Math.round(high / 3), rda: Math.round(kg * .8) };
  }

  root.WorkoutCalculators = Object.freeze({ tdee: tdee, bmi: bmi, deficit: deficit, protein: protein });
  if (typeof document === 'undefined') return;

  function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]; }); }
  function integer(value) { return Math.round(value).toLocaleString('en-US'); }
  function decimal(value) { return value.toLocaleString('en-US', { maximumFractionDigits: 1 }); }
  function format(template, values) { return String(template || '').replace(/\{(\w+)\}/g, function (_, key) { return values[key] == null ? '' : values[key]; }); }
  function query(selector, scope) { return (scope || document).querySelector(selector); }
  function all(selector, scope) { return Array.from((scope || document).querySelectorAll(selector)); }
  function get(object, key) { return key.split('.').reduce(function (value, part) { return value && Object.prototype.hasOwnProperty.call(value, part) ? value[part] : undefined; }, object); }

  function initPageCopy(copy) {
    var page = copy.pages && copy.pages[document.body.dataset.page];
    if (!page || !page.en) return;
    all('[data-article-copy]').forEach(function (element) {
      var text = get(page.en, element.dataset.articleCopy);
      if (typeof text === 'string') element.textContent = text;
    });
    all('[data-long-copy]').forEach(function (element) {
      var text = get(page.en, element.dataset.longCopy);
      if (typeof text !== 'string') return;
      var parts = [];
      text.split(/(?<!U\.S\.)(?<=[.!?])\s+(?=[A-Z])/).forEach(function (sentence) {
        var separator = sentence.indexOf(' — ') !== -1 ? ' — ' : sentence.indexOf('; ') !== -1 ? '; ' : ', ';
        if (sentence.length > 105 && sentence.indexOf(separator) !== -1) {
          var chunks = sentence.split(separator);
          chunks.forEach(function (chunk, i) { parts.push(chunk + (i < chunks.length - 1 ? separator.trimEnd() : '')); });
        } else parts.push(sentence);
      });
      element.replaceChildren();
      parts.forEach(function (text, index) {
        if (index) element.appendChild(document.createTextNode(' '));
        var paragraph = document.createElement(element.tagName === 'P' ? 'span' : 'p');
        paragraph.className = 'copy-paragraph'; paragraph.textContent = text;
        element.appendChild(paragraph);
      });
    });
  }

  function initNavigation(copy) {
    var header = query('[data-calculator-nav]'), button = header && query('[data-nav-toggle]', header), menu = query('#calculator-navigation');
    if (!button || !menu) return;
    var ui = copy.pages && copy.pages.tdee && copy.pages.tdee.en.ui;
    var label = query('[data-nav-toggle-label]', button), open = false, lastFocusWasToggle = false;
    document.addEventListener('focusin', function (event) { lastFocusWasToggle = event.target === button; });
    function desktop() { return root.matchMedia('(min-width: 1024px)').matches; }
    function render() {
      header.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      document.documentElement.classList.toggle('calc-menu-open', open);
      document.body.classList.toggle('calc-menu-open', open);
      menu.inert = !desktop() && !open;
      if (menu.inert) menu.setAttribute('aria-hidden', 'true'); else menu.removeAttribute('aria-hidden');
      if (ui) {
        var text = ui[open ? 'navClose' : 'navOpen'];
        if (text) { button.setAttribute('aria-label', text); if (label) label.textContent = text; }
        if (ui.navNavigation) menu.setAttribute('aria-label', ui.navNavigation);
      }
    }
    function close(restoreFocus) { open = false; render(); if (restoreFocus) button.focus(); }
    button.addEventListener('click', function () {
      if (desktop()) return;
      if (open) { close(true); return; }
      open = true; render();
      var first = query('a[href]', menu); if (first) first.focus();
    });
    all('a[href]', menu).forEach(function (link) { link.addEventListener('click', function () { close(false); }); });
    all('[data-nav-page]').forEach(function (link) {
      var page = copy.pages && copy.pages[link.dataset.navPage];
      if (page && page.en.navLabel && link.dataset.navFullLabel !== 'true') link.textContent = page.en.navLabel;
    });
    document.addEventListener('keydown', function (event) {
      if (!open) return;
      if (event.key === 'Escape') { event.preventDefault(); close(true); return; }
      if (event.key !== 'Tab') return;
      var focusable = [button].concat(all('a[href]', menu)), first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || focusable.indexOf(document.activeElement) === -1)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || focusable.indexOf(document.activeElement) === -1)) { event.preventDefault(); first.focus(); }
    });
    root.addEventListener('resize', function () {
      if (!desktop()) { render(); return; }
      // CSS can blur a newly hidden toggle before the resize event reaches JS.
      var toggleFocused = document.activeElement === button || (lastFocusWasToggle && document.activeElement === document.body);
      close(false);
      if (toggleFocused) {
        var links = all('a[href]', menu), current = links.find(function (link) { return link.getAttribute('aria-current') === 'page'; });
        var target = current || links[0]; if (target) target.focus();
      }
    });
    render();
  }

  function initCalculator(copy) {
    var name = document.body.dataset.page;
    if (['tdee', 'bmi', 'deficit', 'protein'].indexOf(name) === -1) return;
    var form = query('#' + name + '-form'), page = copy.pages && copy.pages[name];
    if (!form || !page || !page.en || !page.en.ui) return;
    var ui = page.en.ui;
    all('[data-calc-copy]').forEach(function (element) {
      var value = get(page.en, element.dataset.calcCopy);
      if (typeof value === 'string') element.textContent = value;
    });
    var output = query('#calc-results'), error = query('#calc-error'), interpretation = query('#calc-interpretation'), warning = query('#calc-warning');
    if (!output || !error || !interpretation || !warning) return;
    var heightUnit = query('#calc-height-unit'), weightUnit = query('#calc-weight-unit');
    var units = { height: heightUnit ? heightUnit.value : 'cm', weight: weightUnit ? weightUnit.value : 'kg' };
    var kgPerPound = name === 'protein' ? 1 / 2.20462 : .45359237;
    var resultSource = name === 'protein' ? query('#calc-source') : null;
    var heightCache = null, weightCache = null, pending = null, previousSignature = '';
    function value(id) { var element = query('#calc-' + id, form); return element ? element.value : ''; }
    function clearTimer() { if (pending !== null) { root.clearTimeout(pending); pending = null; } }
    function clearResult() {
      output.replaceChildren(); interpretation.textContent = ''; warning.replaceChildren(); warning.hidden = true;
      error.textContent = ''; error.hidden = true;
      if (resultSource) resultSource.hidden = false;
    }
    function heightSnapshot() { return units.height === 'cm' ? value('height-cm') : value('height-ft') + '|' + value('height-in'); }
    function readHeight() {
      var snapshot = heightSnapshot();
      if (heightCache && heightCache.unit === units.height && heightCache.text === snapshot) return heightCache.cm;
      var cm;
      if (units.height === 'cm') cm = numeric(value('height-cm'), 'HEIGHT', 120, 230);
      else if (units.height === 'imperial') {
        var feet = numeric(value('height-ft'), 'HEIGHT', 0, 8, true), inches = numeric(value('height-in'), 'HEIGHT', 0, 11.99999999999999);
        cm = numeric((feet * 12 + inches) * 2.54, 'HEIGHT', 120, 230);
      } else fail('HEIGHT');
      heightCache = { unit: units.height, text: snapshot, cm: cm }; return cm;
    }
    function readWeight() {
      var text = value('weight');
      if (weightCache && weightCache.unit === units.weight && weightCache.text === text) return weightCache.kg;
      if (units.weight !== 'kg' && units.weight !== 'lb') fail('WEIGHT');
      var kg = numeric(text, 'WEIGHT', Number.MIN_VALUE, Infinity) * (units.weight === 'lb' ? kgPerPound : 1);
      numeric(kg, 'WEIGHT', 30, 250);
      weightCache = { unit: units.weight, text: text, kg: kg }; return kg;
    }
    function showUnits() {
      var metric = query('#height-metric'), imperial = query('#height-imperial'), weight = query('#calc-weight');
      if (metric) metric.hidden = units.height !== 'cm';
      if (imperial) imperial.hidden = units.height !== 'imperial';
      ['height-cm', 'height-ft', 'height-in'].forEach(function (key) { var field = query('#calc-' + key); if (field) field.disabled = key === 'height-cm' ? units.height !== 'cm' : units.height !== 'imperial'; });
      if (weight) { weight.min = units.weight === 'kg' ? '30' : String(30 / kgPerPound); weight.max = units.weight === 'kg' ? '250' : String(250 / kgPerPound); }
    }
    function switchHeight() {
      var cm = null;
      try { cm = readHeight(); } catch (_) { heightCache = null; }
      units.height = heightUnit.value;
      if (units.height === 'cm') query('#calc-height-cm').value = cm === null ? '' : String(Number(cm.toFixed(6)));
      else {
        var total = cm === null ? null : cm / 2.54, feet = total === null ? null : Math.floor(total / 12), inches = total === null ? null : Number((total - feet * 12).toFixed(6));
        if (inches === 12) { feet++; inches = 0; }
        query('#calc-height-ft').value = feet === null ? '' : String(feet); query('#calc-height-in').value = inches === null ? '' : String(inches);
      }
      heightCache = cm === null ? null : { unit: units.height, text: heightSnapshot(), cm: cm }; showUnits();
    }
    function switchWeight() {
      var kg = null;
      try { kg = readWeight(); } catch (_) { weightCache = null; }
      units.weight = weightUnit.value;
      var field = query('#calc-weight'); field.value = kg === null ? '' : String(Number((units.weight === 'kg' ? kg : kg / kgPerPound).toFixed(6)));
      weightCache = kg === null ? null : { unit: units.weight, text: field.value, kg: kg }; showUnits();
    }
    function mode() { var selected = query('input[name="deficit-mode"]:checked', form); return selected ? selected.value : ''; }
    function showMode() {
      if (name !== 'deficit') return;
      var estimated = mode() === 'estimate';
      query('#deficit-direct').hidden = estimated; query('#deficit-profile').hidden = !estimated;
    }
    function readProfile() {
      var age = numeric(value('age'), 'AGE', 16, 80, true);
      if (age < 18) fail('ADULT_ONLY');
      return { age: age, sex: value('sex'), heightCm: readHeight(), weightKg: readWeight(), activity: value('activity'), bodyFat: name === 'tdee' ? value('bodyfat') : undefined };
    }
    function statistic(label, content, caution) { return '<div class="calc-stat"><dt>' + escape(label) + '</dt><dd class="calc-value' + (caution ? ' is-warning' : '') + '">' + content + '</dd></div>'; }
    function renderTdee(result, profile) {
      output.innerHTML = '<div class="table-scroll" tabindex="0" role="region" aria-label="' + escape(ui.tableScroll) + '"><table class="calc-comparison"><caption>' + escape(ui.kcal) + '</caption><thead><tr><th scope="col">' + escape(ui.formula) + '</th><th scope="col">' + escape(ui.bmr) + '</th><th scope="col">' + escape(ui.tdee) + '</th></tr></thead><tbody>' + ['mifflin', 'harris', 'katch'].map(function (key) {
        var row = result[key];
        return '<tr' + (key === 'mifflin' ? ' class="is-primary"' : '') + '><th scope="row">' + escape(ui[key]) + '</th>' + (row ? '<td>' + integer(row.bmr) + '</td><td>' + integer(row.tdee) + '</td>' : '<td colspan="2">' + escape(ui.locked) + '</td>') + '</tr>';
      }).join('') + '</tbody></table></div>';
      interpretation.textContent = format(ui.interpretTdee, { tdee: integer(result.mifflin.tdee), activity: ui[profile.activity] });
    }
    function renderBmi(result, heightCm) {
      var square = Math.pow(heightCm / 100, 2), factor = units.weight === 'lb' ? 1 / .45359237 : 1;
      var range = (18.5 * square * factor).toFixed(1) + '–' + (24.9 * square * factor).toFixed(1) + ' ' + ui[units.weight];
      output.innerHTML = '<dl class="calc-stats">' + statistic(ui.bmi, result.bmi.toFixed(1)) + statistic(ui.bmiCategory, escape(ui[result.category])) + statistic(ui.weightRange, escape(range)) + '</dl>';
      interpretation.textContent = format(ui.interpretBmi, { bmi: result.bmi.toFixed(1), category: String(ui[result.category]).toLocaleLowerCase('en-US') });
    }
    function renderDeficit(result, loss, underweight) {
      var date = result.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), weeks = decimal(result.weeks);
      output.innerHTML = '<dl class="calc-stats">' + statistic(ui.deficit, integer(result.deficit) + ' <small>' + escape(ui.kcal) + '</small>') + statistic(ui.intake, integer(result.intake) + ' <small>' + escape(ui.kcal) + '</small>', result.belowMinimum) + statistic(ui.estimatedDate, '<time datetime="' + escape(result.dateISO) + '">' + escape(date) + '</time>') + '</dl><p class="hint">' + escape(result.days + ' ' + ui.days + ' · ' + weeks + ' ' + ui.weeks) + '</p>';
      interpretation.textContent = result.nonPositive ? ui.nonPositive : underweight ? ui.underweightWarning : format(ui.interpretDeficit, { intake: integer(result.intake), loss: decimal(loss), weeks: weeks });
      var warnings = [];
      if (result.belowMinimum) warnings.push(ui.warningThreshold, ui.warningQualification);
      if (result.nonPositive) warnings.push(ui.nonPositive);
      if (underweight) warnings.push(ui.underweightWarning);
      if (warnings.length) { warning.textContent = warnings.join(' '); warning.hidden = false; }
    }
    function renderProtein(result, goal) {
      output.innerHTML = '<dl class="calc-stats">' +
        statistic(ui.dailyRange, integer(result.dailyLow) + '–' + integer(result.dailyHigh) + ' <small>' + escape(ui.gramsDay) + '</small>') +
        statistic(ui.perMeal, integer(result.mealLow) + '–' + integer(result.mealHigh) + ' <small>' + escape(ui.gramsMeal) + '</small>') +
        statistic(ui.rda, integer(result.rda) + ' <small>' + escape(ui.gramsDay) + '</small>') + '</dl><p class="hint">' + escape(ui.rounding) + '</p>';
      interpretation.textContent = ui.interpretation[goal];
    }
    function update(userEdit) {
      clearResult(); showMode();
      try {
        var signature;
        if (name === 'tdee') {
          var profile = readProfile(), energy = tdee(profile); renderTdee(energy, profile); signature = JSON.stringify(profile);
        } else if (name === 'bmi') {
          var measures = { heightCm: readHeight(), weightKg: readWeight() }; renderBmi(bmi(measures), measures.heightCm); signature = JSON.stringify(measures);
        } else if (name === 'protein') {
          var proteinAge = numeric(value('age'), 'AGE', 16, 80, true);
          if (proteinAge < 18) fail('ADULT_ONLY');
          var kidney = query('#calc-kidney', form).checked;
          if (kidney) {
            protein({ age: proteinAge, kidneyDisease: true });
            clearTimer(); previousSignature = '';
            warning.textContent = ui.kidneyMessage; warning.hidden = false;
            if (resultSource) resultSource.hidden = true;
            return;
          }
          var goalNode = query('input[name="protein-goal"]:checked', form);
          var proteinInput = { age: proteinAge, weightKg: readWeight(), goal: goalNode ? goalNode.value : '', kidneyDisease: false };
          renderProtein(protein(proteinInput), proteinInput.goal); signature = JSON.stringify(proteinInput);
        } else {
          var selected = query('input[name="calc-pace"]:checked', form), direct = mode() === 'direct', underweight = false, input = { sex: value('sex'), loss: value('target-loss'), pace: selected ? selected.value : '' };
          if (direct) input.tdee = value('tdee');
          else {
            if (mode() !== 'estimate') fail('TDEE');
            var details = readProfile(); input.tdee = tdee(details).mifflin.tdee;
            underweight = bmi(details).category === 'underweight';
          }
          var result = deficit(input); renderDeficit(result, Number(input.loss), underweight); signature = JSON.stringify({ input: input, mode: mode() });
        }
        if (!userEdit || signature !== previousSignature) clearTimer();
        if (userEdit && signature !== previousSignature && /^https?:$/.test(root.location.protocol)) {
          pending = root.setTimeout(function () { pending = null; if (typeof root.gtag === 'function') root.gtag('event', name + '_calculate', { tool: name }); }, 400);
        }
        previousSignature = signature;
      } catch (problem) {
        clearTimer();
        previousSignature = '';
        if (resultSource) resultSource.hidden = true;
        if (problem.code === 'ADULT_ONLY') {
          warning.innerHTML = escape(copy.common.en.minorNote) + '<br><span lang="zh-CN">' + escape(copy.common.zh.minorNote) + '</span>'; warning.hidden = false;
        } else {
          error.textContent = ui.error[String(problem.code || 'missing').toLowerCase()] || ui.error.missing; error.hidden = false;
        }
      }
    }
    function edited(event) {
      var id = event.target.id;
      if (id === 'calc-height-unit') { if (heightUnit.value !== units.height) switchHeight(); }
      else if (id === 'calc-weight-unit') { if (weightUnit.value !== units.weight) switchWeight(); }
      else if (['calc-height-cm', 'calc-height-ft', 'calc-height-in'].indexOf(id) !== -1) heightCache = null;
      else if (id === 'calc-weight') weightCache = null;
      update(true);
    }
    form.addEventListener('input', edited); form.addEventListener('change', edited);
    form.addEventListener('submit', function (event) { event.preventDefault(); update(true); });
    form.addEventListener('reset', function () {
      clearTimer();
      root.setTimeout(function () { units.height = heightUnit ? heightUnit.value : 'cm'; units.weight = weightUnit ? weightUnit.value : 'kg'; heightCache = null; weightCache = null; previousSignature = ''; showUnits(); update(false); }, 0);
    });
    showUnits(); update(false);
  }
  function init() {
    if (!document.body || !root.WorkoutCopy) return;
    initNavigation(root.WorkoutCopy); initCalculator(root.WorkoutCopy); initPageCopy(root.WorkoutCopy);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof globalThis !== 'undefined' ? globalThis : this);
