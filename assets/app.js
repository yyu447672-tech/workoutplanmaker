(function () {
  'use strict';
  var C = window.WorkoutCopy.common.en, Core = window.WorkoutCore, Data = window.WorkoutData;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.from((r || document).querySelectorAll(s)); };
  var escape = function (x) { return String(x).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var num = function (x) { return Math.round(x).toLocaleString('en-US'); };
  var format = function (k, values) { return C[k].replace(/\{(\w+)\}/g, function (_, key) { return values[key]; }); };
  var page = window.WorkoutCopy.pages[document.body.dataset.page];
  $$('[data-copy]').forEach(function (el) { if (C[el.dataset.copy] !== undefined) el.textContent = C[el.dataset.copy]; });
  $$('[data-page]').forEach(function (el) { if (page && page.en[el.dataset.page] !== undefined) el.textContent = page.en[el.dataset.page]; });
  $$('[data-copy-label]').forEach(function(el){if(C[el.dataset.copyLabel]!==undefined)el.setAttribute('aria-label',C[el.dataset.copyLabel]);});
  if(page && page.en.faq) {
    $$('[data-faq-q]').forEach(function(el){var row=page.en.faq[Number(el.dataset.faqQ)];if(row)el.textContent=row[0];});
    $$('[data-faq-a]').forEach(function(el){var row=page.en.faq[Number(el.dataset.faqA)];if(row)el.textContent=row[1];});
  }
  var measurementId = window.WorkoutCopy.analytics.measurementId;
  var analyticsOn = /^https?:$/.test(location.protocol) && /^G-[A-Z0-9]+$/.test(measurementId) && measurementId !== 'G-XXXXXXXXXX';
  if (analyticsOn) {
    if(document.body.dataset.page==='privacy') {
      $('[data-copy="privacyAnalyticsTitle"]').textContent=C.analyticsEnabledTitle;
      $('[data-copy="privacyAnalytics"]').textContent=C.analyticsEnabled;
    }
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: true });
    var tag = document.createElement('script'); tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(tag);
  }
  function event(name, tool) { if (analyticsOn && typeof window.gtag === 'function') window.gtag('event', name, {tool:tool}); }
  function message(e) {
    if (e.code === 'ADULT_ONLY') return C.adultOnly;
    if (e.code === 'CALORIES_OUT_OF_RANGE') return C.calorieRangeError;
    if (e.code === 'NEGATIVE_CARBS') return C.negativeCarbs;
    if (e.code === 'BODY_FAT_DOMAIN' || e.code === 'BODY_FAT_RANGE') return C.bodyFatError;
    if (e.code === 'MISSING_MEASURES') return C.missingMeasures;
    return C.numberError;
  }
  function input(label, id, value, unit, min, max, step) {
    return '<label class="field" for="'+id+'"><span>'+escape(C[label])+'</span><span class="input-unit"><input id="'+id+'" type="number" inputmode="decimal" autocomplete="off" min="'+min+'" max="'+max+'" step="'+(step || 'any')+'" value="'+escape(value == null ? '' : value)+'"><span>'+escape(unit)+'</span></span></label>';
  }
  function macroMarkup(m) {
    return '<div class="macro-numbers">'+['protein','fat','carbs'].map(function (k) {
      return '<div><span>'+escape(C[k])+'</span><strong>'+num(m[k])+' <small>'+C.grams+'</small></strong><span>'+m.percent[k].toFixed(1)+'%</span></div>';
    }).join('')+'</div><div class="macro-bar" aria-hidden="true"><i class="macro-protein"></i><i class="macro-fat"></i><i class="macro-carbs"></i></div><p class="hint">'+escape(C.rounding)+'</p>';
  }
  function drawBar(root, m) { ['protein','fat','carbs'].forEach(function (k) { var el=$('.macro-'+k,root); if(el) el.style.flexBasis = m.percent[k]+'%'; }); }
  function mealMarkup(m) {
    return '<div class="table-scroll" tabindex="0"><table><thead><tr><th scope="col">'+C.mealName.replace('{n}','')+'</th>'+['protein','fat','carbs'].map(function(k){return '<th scope="col">'+C[k]+' (g)</th>';}).join('')+'</tr></thead><tbody>'+Core.mealSplit(m).map(function(row,i){return '<tr><th scope="row">'+format('mealName',{n:i+1})+'</th><td>'+row.protein+'</td><td>'+row.fat+'</td><td>'+row.carbs+'</td></tr>';}).join('')+'</tbody></table></div>';
  }
  var printDetails=[];
  window.addEventListener('beforeprint',function(){
    printDetails=$$('#your-plan .training-days details').map(function(el){var wasOpen=el.open;el.open=true;return {element:el,open:wasOpen};});
  });
  window.addEventListener('afterprint',function(){
    printDetails.forEach(function(row){row.element.open=row.open;});printDetails=[];
  });
  function initAssessment() {
    var state={age:'',sex:'',heightCm:'',weightKg:'',goal:'',activity:'',days:'',equipment:''};
    var units={height:'metric',weight:'metric'}, at=0, started=false, result=null;
    var measurements={unit:'cm',waist:'',neck:'',hips:''};
    var heightShown=null, weightShown=null;
    var defaults={age:30,sex:'male',heightCm:180,weightKg:80,goal:'maintain',activity:'moderate',days:3,equipment:'bodyweight'};
    var keys=['age','sex','height','weight','goal','activity','days','equipment'];
    var choices={sex:['male','female'],goal:['lose','gain','maintain'],activity:['sedentary','light','moderate','high'],days:[2,3,4,5,6],equipment:['gym','dumbbell','bodyweight']};
    function begin() { if(!started) {started=true;event('quiz_start','assessment');} }
    function toQuiz() { $('#assessment').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}); }
    function answered() { var out={};Object.keys(state).forEach(function(k){if(state[k]!=='' && state[k]!=null)out[k]=state[k];});return out; }
    function validatePatch(patch) { Core.normalizeProfile(Object.assign({},defaults,answered(),patch)); }
    function readHeight() {
      if(units.height==='imperial' && heightShown && $('#answer-feet').value===heightShown.feet && $('#answer-inches').value===heightShown.inches) return heightShown.cm;
      var patch=units.height==='metric'?{heightCm:$('#answer-height').value}:{heightUnit:'imperial',heightFeet:$('#answer-feet').value,heightInches:$('#answer-inches').value};
      var v=Core.normalizeProfile(Object.assign({},defaults,answered(),patch)); return v.heightCm;
    }
    function readWeight() {
      if(units.weight==='imperial' && weightShown && $('#answer-weight').value===weightShown.text) return weightShown.kg;
      var patch=units.weight==='metric'?{weightKg:$('#answer-weight').value}:{weightUnit:'imperial',weightLb:$('#answer-weight').value};
      return Core.normalizeProfile(Object.assign({},defaults,answered(),patch)).weightKg;
    }
    function saveMeasures() {
      if(Number(state.age)<18) return null;
      captureMeasures();
      return Core.bodyFat(Object.assign({sex:state.sex,heightCm:state.heightCm},measurements));
    }
    function captureMeasures() { ['waist','neck','hips'].forEach(function(k){var f=$('#measure-'+k);if(f)measurements[k]=f.value;}); }
    function preserveWeight() { var f=$('#answer-weight');if(f && f.value!=='')state.weightKg=readWeight(); }
    function invalidate() { result=null;$('#your-plan').hidden=true;$('#results-body').replaceChildren(); }
    function unitSwitch(type) {
      var isHeight=type==='height', current=units[type];
      try {
        if(!isHeight)captureMeasures();
        var field=$(isHeight?(current==='metric'?'#answer-height':'#answer-feet'):'#answer-weight');
        if(field && field.value!=='') state[isHeight?'heightCm':'weightKg']=isHeight?readHeight():readWeight();
        units[type]=current==='metric'?'imperial':'metric'; render();
      } catch(e) { $('#quiz-error').textContent=message(e); }
    }
    function render() {
      var key=keys[at], fieldset=$('#quiz-fieldset');
      $('#quiz-phase').textContent=at<4?C.bodyPhase:C.goalPhase;
      $('#quiz-position').textContent=format('questionOf',{n:at+1})+' · '+format('phaseOf',{n:at<4?1:2});
      $('#quiz-progress').value=at; $('#quiz-error').textContent='';
      $('#quiz-back').disabled=at===0;
      $('#quiz-next').hidden=!!choices[key];
      $('#quiz-next').textContent=C[key==='age'?'saveAge':key==='height'?'saveHeight':'saveWeight'];
      var body='<legend id="question-title">'+escape(C[key])+'</legend><p class="question-help" id="question-help">'+escape(C[key+'Help'])+'</p>';
      if(key==='age') body+=input('age','answer-age',state.age,C.years,16,80,1);
      else if(key==='height') {
        body+='<div class="unit-row"><span>'+escape(units.height==='metric'?C.cm:C.ft+' / '+C.in)+'</span><button class="unit-switch" type="button" data-unit="height">'+escape(units.height==='metric'?C.ft+' / '+C.in:C.cm)+'</button></div>';
        if(units.height==='metric') body+=input('height','answer-height',state.heightCm,C.cm,120,230);
        else {var inches=state.heightCm===''?'':state.heightCm/2.54;var feetText=inches===''?'':String(Math.floor(inches/12)),inchText=inches===''?'':String(+(inches%12).toFixed(4));heightShown=inches===''?null:{feet:feetText,inches:inchText,cm:state.heightCm};body+='<div class="form-grid">'+input('height','answer-feet',feetText,C.ft,0,8,1)+input('height','answer-inches',inchText,C.in,0,11.9999)+'</div>';}
      } else if(key==='weight') {
        body+='<div class="unit-row"><span>'+escape(units.weight==='metric'?C.kg:C.lbs)+'</span><button class="unit-switch" type="button" data-unit="weight">'+escape(units.weight==='metric'?C.lbs:C.kg)+'</button></div>';
        var weightText=state.weightKg===''?'':units.weight==='metric'?String(state.weightKg):String(+(state.weightKg/0.45359237).toFixed(5));weightShown=units.weight==='imperial'&&state.weightKg!==''?{text:weightText,kg:state.weightKg}:null;
        body+=input('weight','answer-weight',weightText,units.weight==='metric'?C.kg:C.lbs,units.weight==='metric'?30:66.138,units.weight==='metric'?250:551.156);
        if(Number(state.age)>=18) {
          body+='<details class="optional-measures"><summary>'+C.optional+'</summary><p class="hint">'+C.optionalHelp+'</p><label class="field" for="measure-unit">'+C.circUnits+'<select id="measure-unit"><option value="cm"'+(measurements.unit==='cm'?' selected':'')+'>cm</option><option value="in"'+(measurements.unit==='in'?' selected':'')+'>in</option></select></label><div class="form-grid">'+['waist','neck'].concat(state.sex==='female'?['hips']:[]).map(function(k){return input(k,'measure-'+k,measurements[k],measurements.unit,1,300);}).join('')+'</div><p class="hint">'+C.measureHelp+'</p><button type="button" id="clear-measures" class="btn btn--secondary">'+C.clearMeasures+'</button></details>';
        }
      } else {
        body+='<div class="choice-list'+(key==='days'?' day-choices':'')+'">'+choices[key].map(function(v){var label=key==='days'?format('dayCount',{n:v}):C[v];return '<button type="button" class="choice'+(String(state[key])===String(v)?' is-selected':'')+'" data-choice="'+v+'" aria-pressed="'+(String(state[key])===String(v))+'"><span>'+escape(label)+'</span>'+(C[v+'Help']?'<small>'+escape(C[v+'Help'])+'</small>':'')+'<span aria-hidden="true" class="choice-arrow">→</span></button>';}).join('')+'</div>';
      }
      fieldset.innerHTML=body;
      $$('[data-choice]',fieldset).forEach(function(b){b.addEventListener('click',function(){begin();state[key]=b.dataset.choice;advance();});});
      $$('[data-unit]',fieldset).forEach(function(b){b.addEventListener('click',function(){unitSwitch(b.dataset.unit);});});
      var measureUnit=$('#measure-unit',fieldset);
      if(measureUnit) measureUnit.addEventListener('change',function(){
        try {preserveWeight();}catch(e){this.value=measurements.unit;$('#quiz-error').textContent=message(e);return;}
        var next=this.value;['waist','neck','hips'].forEach(function(k){var f=$('#measure-'+k);if(f){var v=f.value.trim();measurements[k]=v!==''&&Number.isFinite(Number(v))?+(Number(v)*(next==='in'?1/2.54:2.54)).toFixed(5):v;}});measurements.unit=next;render();
      });
      var clear=$('#clear-measures',fieldset);if(clear)clear.addEventListener('click',function(){try{preserveWeight();}catch(e){$('#quiz-error').textContent=message(e);return;}measurements={unit:measurements.unit,waist:'',neck:'',hips:''};render();});
      fieldset.setAttribute('aria-describedby','question-help');
    }
    function saveNumeric() {
      var key=keys[at];
      if(key==='age') {var age=$('#answer-age').value;validatePatch({age:age});state.age=Number(age);}
      if(key==='height') state.heightCm=readHeight();
      if(key==='weight') {state.weightKg=readWeight();if(Number(state.age)>=18)saveMeasures();}
    }
    function advance() {
      invalidate();
      if(at<7) {at++;render();$('#question-title').tabIndex=-1;$('#question-title').focus({preventScroll:true});}
      else complete();
    }
    function module(title,body,wide) {return '<article class="result-module'+(wide?' result-wide':'')+'" data-result-module><h3>'+escape(C[title])+'</h3>'+body+'</article>';}
    function complete() {
      try {
        if(Number(state.age)<18) { completeMinor();return; }
        result=Core.calculate(state);
        if(result.bmi<18.5 && state.goal==='lose') {$('#quiz-error').textContent=C.underweightLoss;result=null;return;}
        if(result.calories<1000) {$('#quiz-error').textContent=C.lowEnergy;result=null;return;}
        var m=result.macros;
        var bodyFat=Core.bodyFat(Object.assign({sex:state.sex,heightCm:state.heightCm},measurements));
        var stats='<dl class="body-stats">'+[['bmi',result.bmi.toFixed(1)+' · '+C['bmi_'+result.bmiCategory]],['bmr',num(result.bmr)+' '+C.kcal],['tdee',num(result.tdee)+' '+C.kcal],['bodyFat',bodyFat===null?C.notAdded:bodyFat.toFixed(1)+'%']].map(function(r){return '<div><dt>'+C[r[0]]+'</dt><dd>'+escape(r[1])+'</dd></div>';}).join('')+'</dl><p class="hint">'+C.bmiNote+'</p>';
        var targets='<dl class="calorie-targets">'+['maintain','lose','gain'].map(function(k){return '<div'+(k===state.goal?' class="is-target"':'')+'><dt>'+C[k]+'</dt><dd>'+num(result.targets[k])+' <small>'+C.kcal+'</small></dd></div>';}).join('')+'</dl><p class="hint">'+C.calorieNote+'</p>';
        var plan=Data.getPlan(Number(state.days),state.equipment);
        var training=trainingMarkup(plan,false);
        var progression='<ol class="progression-list">'+Data.progression.map(function(p){return '<li><strong>'+escape(p.focus)+'</strong><p>'+escape(p.detail)+'</p></li>';}).join('')+'</ol><p class="hint">'+C.progressNote+'</p>';
        $('#results-body').innerHTML=module('metrics',stats,true)+module('calorieTitle',targets)+module('macroTitle',macroMarkup(m))+module('trainingTitle',training,true)+module('cardioTitle','<p class="cardio-number">'+C.cardioMain+'</p><p>'+C.cardioNote+'</p>')+module('progressTitle',progression)+module('mealTitle',mealMarkup(m)+'<p>'+C.mealFrame+'</p><p class="hint">'+C.mealNote+'</p>')+module('exportTitle','<p>'+C.exportNote+'</p><button type="button" id="print-plan" class="btn btn--primary">'+C.print+'</button>');
        drawBar($('#results-body'),m);
        $('#quiz-progress').value=8; $('#your-plan').hidden=false;$('#your-plan h2').textContent=C.resultsTitle;$('#your-plan .section-lead').textContent=C.resultsLead;$('#result-macro-link').hidden=false;
        $('#print-plan').addEventListener('click',function(){event('plan_print_click','assessment');window.print();});
        event('quiz_complete','assessment');
        $('#your-plan').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
      } catch(e) {$('#quiz-error').textContent=message(e);}
    }
    function trainingMarkup(plan,minor) {
      return '<p>'+C[minor?'minorTrainingNote':'trainingNote']+'</p>'+(state.equipment==='bodyweight'?'<p class="hint">'+C.bodyweightNote+'</p>':'')+'<div class="training-days">'+plan.map(function(d,i){return '<details'+(i===0?' open':'')+'><summary>'+escape(d.weekday)+' · '+escape(d.title)+'</summary><ol class="exercise-list">'+d.exercises.map(function(e){return '<li><div><strong>'+escape(e.name)+'</strong><span>'+e.sets+' '+C.sets+' × '+escape(e.reps)+' · '+C.rest+' '+e.rest+' '+C.seconds+'</span></div><p>'+escape(e.cue)+'</p></li>';}).join('')+'</ol></details>';}).join('')+'</div>';
    }
    function completeMinor() {
      Core.normalizeProfile(state);
      var plan=Data.getPlan(Number(state.days),state.equipment);
      var progression='<ol class="progression-list">'+Data.progression.map(function(p){return '<li><strong>'+escape(format('week',{n:p.week}))+': '+escape(p.focus)+'</strong><p>'+escape(p.detail)+'</p></li>';}).join('')+'</ol><p class="hint">'+C.minorProgressNote+'</p>';
      $('#results-body').innerHTML=module('trainingTitle',trainingMarkup(plan,true),true)+module('cardioTitle','<p class="cardio-number">'+C.minorCardio+'</p><p>'+C.minorCardioNote+'</p>')+module('progressTitle',progression)+module('exportTitle','<p>'+C.exportNote+'</p><button type="button" id="print-plan" class="btn btn--primary">'+C.print+'</button>',true);
      $('#your-plan h2').textContent=C.minorTitle;$('#your-plan .section-lead').innerHTML=escape(C.minorNote)+'<br><span lang="zh-CN">'+escape(window.WorkoutCopy.common.zh.minorNote)+'</span>';$('#result-macro-link').hidden=true;
      $('#quiz-progress').value=8;$('#your-plan').hidden=false;
      $('#print-plan').addEventListener('click',function(){event('plan_print_click','assessment');window.print();});
      event('quiz_complete','assessment');$('#your-plan').scrollIntoView({behavior:'instant',block:'start'});
    }
    $('#quiz-form').addEventListener('submit',function(e){e.preventDefault();begin();try{saveNumeric();advance();}catch(err){$('#quiz-error').textContent=message(err);var f=$('input:invalid',$('#quiz-fieldset'));if(f)f.focus();}});
    $('#quiz-back').addEventListener('click',function(){try{saveNumeric();}catch(e){}invalidate();if(at>0){at--;render();}});
    $('#edit-answers').addEventListener('click',function(){invalidate();at=0;render();toQuiz();});
    $$('[data-start]').forEach(function(a){a.addEventListener('click',function(){invalidate();begin();});});
    $('#hero-form').addEventListener('submit',function(e){e.preventDefault();var age=$('#hero-age').value;try{validatePatch({age:age});state.age=Number(age);invalidate();begin();at=1;render();$('#hero-error').textContent='';toQuiz();}catch(err){$('#hero-error').textContent=message(err);}});
    render();
  }
  function initMacro() {
    var form=$('#macro-form'), timer=null, lastValid=false, weightSnapshot=null;
    function weightKg() {var value=$('#macro-weight').value,unit=$('#macro-weight-unit').value;if(weightSnapshot && value===weightSnapshot.text && unit===weightSnapshot.unit)return weightSnapshot.kg;return Number(value)*(unit==='imperial'?0.45359237:1);}
    function update() {
      var mode=$('input[name="macro-mode"]:checked',form).value;
      $('#macro-body-details').hidden=mode!=='estimate';$('#macro-calorie-field').hidden=mode==='estimate';
      try {
        var w=$('#macro-weight').value.trim();if(!/^(?:\d+|\d*\.\d+)$/.test(w)) throw {code:'INVALID_NUMBER'};
        var kg=weightKg(), goal=$('#macro-goal').value, m;
        if(mode==='direct') m=Core.macros($('#macro-calories').value,kg,goal);
        else m=Core.calculate({age:$('#macro-age').value,sex:$('#macro-sex').value,heightCm:$('#macro-height').value,weightKg:kg,goal:goal,activity:$('#macro-activity').value,days:3,equipment:'bodyweight'}).macros;
        if(m.calories<1000) throw {code:'LOW_ENERGY'};
        $('#macro-result').innerHTML=macroMarkup(m)+mealMarkup(m)+'<p class="macro-interpret">'+escape(format('macroInterpret',{calories:num(m.calories),goal:C[goal].toLowerCase(),protein:m.protein,fat:m.fat,carbs:m.carbs}))+'</p>';
        drawBar($('#macro-result'),m);$('#macro-error').textContent='';lastValid=true;
      } catch(e) {$('#macro-error').textContent=e.code==='LOW_ENERGY'?C.lowEnergy:message(e);$('#macro-result').replaceChildren();lastValid=false;}
    }
    form.addEventListener('submit',function(e){e.preventDefault();});
    form.addEventListener('input',function(e){if(e.target.id==='macro-weight-unit')return;update();clearTimeout(timer);if(lastValid)timer=setTimeout(function(){event('macro_calculate','macro');},600);});
    var weightUnit='metric';
    function weightLabel(unit) {var field=$('#macro-weight');field.min=unit==='imperial'?'66.138':'30';field.max=unit==='imperial'?'551.156':'250';field.parentElement.querySelector('span').textContent=unit==='imperial'?C.lbs:C.kg;}
    $('#macro-weight-unit').addEventListener('change',function(){var text=$('#macro-weight').value,next=this.value;var kg=weightSnapshot&&text===weightSnapshot.text&&weightUnit===weightSnapshot.unit?weightSnapshot.kg:Number(text)*(weightUnit==='imperial'?0.45359237:1);if(Number.isFinite(kg)&&kg>0){$('#macro-weight').value=next==='imperial'?(kg/0.45359237).toFixed(5):String(kg);weightSnapshot={text:$('#macro-weight').value,unit:next,kg:kg};}weightUnit=next;weightLabel(next);update();});
    form.addEventListener('reset',function(){clearTimeout(timer);setTimeout(function(){weightUnit='metric';weightSnapshot=null;weightLabel('metric');update();},0);});
    update();
  }
  if($('#quiz-form')) initAssessment();
  if($('#macro-form')) initMacro();
  // Functional tools stay classic-script compatible with file://; kit motion is an enhancement.
  if(location.protocol!=='file:') {
    Promise.all([import('./motion/motion.js'),import('./layout/layout.js'),import('./moments/moments.js')]).then(function(){
      $$('[data-preview-loop] .loop-pause').forEach(function(b){b.setAttribute('aria-label',C.pause);});
    }).catch(function(){document.documentElement.classList.add('m-enter-done','mo-safe');});
  }
})();
