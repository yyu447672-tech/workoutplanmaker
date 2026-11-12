(function (root) {
  'use strict';
  var Core=root.WorkoutCore, Data=root.WorkoutData, C=root.WorkoutCopy.common.en, P=root.WorkoutCopy.pages.myPlan.en;
  var ANSWERS='workoutplanmaker.assessment.v1', LICENSE='workoutplanmaker.license.v1';
  function storage(action,key,value) { try { if(action==='get')return root.localStorage.getItem(key); if(action==='set')root.localStorage.setItem(key,value); else root.localStorage.removeItem(key); return true; } catch(e) { return action==='get'?null:false; } }
  function normalized(saved) { var p=Core.normalizeProfile(Object.assign({},saved,{heightUnit:'metric',weightUnit:'metric'})); p.heightUnit=saved.heightUnit==='imperial'?'imperial':'metric'; p.weightUnit=saved.weightUnit==='imperial'?'imperial':'metric'; return p; }
  function save(raw,units) { var p=normalized(raw);p.heightUnit=units.height;p.weightUnit=units.weight;storage('set',ANSWERS,JSON.stringify(p));return p; }
  function read() {try { var saved=JSON.parse(storage('get',ANSWERS)); if(!saved||!['metric','imperial'].includes(saved.heightUnit)||!['metric','imperial'].includes(saved.weightUnit))return null;return normalized(saved); }catch(e){return null;} }
  function key(value) { return String(value||'').replace(/\s/g,'').toUpperCase(); }
  // Static site: no server-side validation is possible. This check verifies key shape only. The Creem API key must never appear in client code.
  function valid(value) {return /^[A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{6}$/.test(value);}
  function reps(value,week) {var match=/^(\d+)–(\d+)( per side| seconds)?$/.exec(value);if(!match||week===1)return value;var n=week===2?Math.floor((+match[1]+ +match[2])/2):week===3?+match[1]:+match[2];return n+(match[3]||'');}
  function weeks(p) {return [1,2,3,4].map(function(w){return Data.getPlan(p.days,p.equipment).map(function(d){return Object.assign({},d,{exercises:d.exercises.map(function(e,i){return Object.assign({},e,{sets:w===4?2:e.sets+(w===3&&i<2?1:0),reps:reps(e.reps,w===3&&i>=2?2:w)});})});});});}
  var API=root.WorkoutPlan={save:save,read:read,normalized:normalized,validKey:valid,normalizeKey:key,reps:reps,weeks:weeks,storage:storage};
  if(!root.document)return;
  var $=function(s){return document.querySelector(s);};
  var esc=function(v){return String(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  var profile=null, unlocked=false;
  function table(headers,rows) {return '<div class="table-scroll"><table><thead><tr>'+headers.map(function(h){return '<th scope="col">'+esc(h)+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(row){return '<tr>'+row.map(function(v){return '<td>'+esc(v)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';}
  function render() {
    $('#assessment').hidden=!!profile;$('#fallback-note').hidden=!!profile;$('#license-panel').hidden=unlocked;$('#plan-document').hidden=!(profile&&unlocked);$('#download-plan').hidden=!(profile&&unlocked);
    if(!(profile&&unlocked)){$('#plan-document').replaceChildren();return;}
    var minor=profile.age<18, html='<h1>'+esc(P.title)+'</h1><p>'+esc(C[profile.goal])+' · '+profile.days+' '+esc(C.sessions)+' · '+esc(C[profile.equipment])+' · '+esc(P[minor?'minorAge':'adultAge'])+'</p><h2>'+esc(C.macroTitle)+'</h2>';
    if(minor)html+='<p>'+esc(P.minorNutrition)+'</p>';
    else {try {var r=Core.calculate(Object.assign({},profile,{heightUnit:'metric',weightUnit:'metric'})),m=r.macros;if(r.bmi<18.5&&profile.goal==='lose')throw {planMessage:C.underweightLoss};if(r.calories<1000)throw {planMessage:C.lowEnergy};var low=r.calories<(profile.sex==='female'?1200:1500);html+='<p class="'+(low?'field-error':'')+'">'+Math.round(r.calories)+' '+esc(C.kcal)+'</p>';if(low)html+='<p class="field-error">'+esc(P.lowWarning)+'</p>';html+=table([C.protein,C.fat,C.carbs],[[m.protein+' g',m.fat+' g',m.carbs+' g']])+table([P.meal,C.protein,C.fat,C.carbs],Core.mealSplit(m).map(function(x){return [x.name,x.protein+' g',x.fat+' g',x.carbs+' g'];}));}catch(e){html+='<p>'+esc(e.planMessage||C[e.code==='NEGATIVE_CARBS'?'negativeCarbs':'calorieRangeError'])+'</p>';}}
    html+='<h2>'+esc(C.cardioTitle)+'</h2><p>'+esc(C[minor?'minorCardio':'cardioMain'])+'</p><p>'+esc(C[minor?'minorCardioNote':'cardioNote'])+'</p><p>'+esc(P.safety)+'</p>'+(minor?'<p>'+esc(C.minorProgressNote)+'</p>':'');
    var logs='';weeks(profile).forEach(function(sessions,i){var prog=Data.progression[i];html+='<section class="plan-week"><h2>'+esc(P.weekTitles[i])+'</h2><p>'+esc(prog.focus)+' — '+esc(prog.detail)+'</p><p>'+esc(P.weekNotes[i])+'</p>';sessions.forEach(function(d){html+='<h3>'+esc(d.weekday+' · '+d.title)+'</h3>'+table([P.exercise,C.sets,P.reps,C.rest,P.cue],d.exercises.map(function(e){return [e.name,e.sets,e.reps,e.rest+' '+C.seconds,e.cue];}));logs+='<h3>'+esc(P.weekTitles[i]+' · '+d.weekday+' · '+d.title)+'</h3>'+table([P.date,P.exercise,P.load,P.repsDone],d.exercises.map(function(e){return ['',e.name,'',''];}));});html+='</section>';});
    html+='<section><h2>'+esc(P.logs)+'</h2>'+logs+'</section><h2>'+esc(C.progressTitle)+'</h2>'+Data.progression.map(function(p){return '<h3>'+esc(p.focus)+'</h3><p>'+esc(p.detail)+'</p>';}).join('')+'<p class="disclaimer">'+esc(C.disclaimer)+'</p>';
    $('#plan-document').innerHTML=html;
  }
  API.completed=function(raw,units){profile=save(raw,units);if(document.body.dataset.page==='myPlan')render();else{var box=$('#paid-plan');if(box){box.hidden=false;$('#purchase-minor').hidden=profile.age>=18;}}};
  if(document.body.dataset.page!=='myPlan')return;
  profile=read();unlocked=valid(key(storage('get',LICENSE)));
  $('#license-key').addEventListener('input',function(){this.value=key(this.value);});
  $('#license-form').addEventListener('submit',function(e){e.preventDefault();var value=key($('#license-key').value);if(!valid(value)){$('#plan-error').textContent=P.keyError;return;}storage('set',LICENSE,value);unlocked=true;$('#license-key').value='';$('#plan-error').textContent='';render();});
  $('#delete-answers').addEventListener('click',function(){var ok=storage('remove',ANSWERS);profile=null;render();$('#storage-status').textContent=ok?P.deleted:P.deleteFailed;});
  $('#delete-license').addEventListener('click',function(){var ok=storage('remove',LICENSE);unlocked=false;render();$('#storage-status').textContent=ok?P.keyRemoved:P.deleteFailed;});
  $('#download-plan').addEventListener('click',function(){if(typeof root.gtag==='function')root.gtag('event','plan_pdf_download',{tool:'myPlan'});root.print();});
  render();
})(typeof window!=='undefined'?window:globalThis);
