(function (root) {
  'use strict';

  // Equipment values are available training settings. A variant can adapt a
  // canonical record without adding a 41st exercise to the catalog.
  var allSettings = ['gym', 'dumbbell', 'bodyweight'];
  var weightedSettings = ['gym', 'dumbbell'];
  var exercises = [
    { id: 'squat', name: 'Squat', muscle: 'Legs', equipment: ['gym'], level: 'intermediate', reps: '8–12', rest: 90, cue: 'Keep the bar balanced over your midfoot and squat only as deep as you can control.', variants: {
      bodyweight: { name: 'Bodyweight Squat', reps: '10–15', rest: 60, cue: 'Keep your heels down and sit between your hips to a depth you can control.' }
    } },
    { id: 'deadlift', name: 'Deadlift', muscle: 'Legs', equipment: ['gym'], level: 'intermediate', reps: '6–8', rest: 120, cue: 'Brace before each lift, keep the bar close, and stand without leaning back.' },
    { id: 'bench-press', name: 'Bench Press', muscle: 'Chest', equipment: ['gym'], level: 'intermediate', reps: '8–12', rest: 90, cue: 'Set your feet, lower the bar with control, and use safety arms or a spotter.' },
    { id: 'overhead-press', name: 'Overhead Press', muscle: 'Shoulders', equipment: ['gym'], level: 'intermediate', reps: '8–12', rest: 90, cue: 'Brace your trunk and press the bar overhead without leaning backward.' },
    { id: 'barbell-row', name: 'Barbell Row', muscle: 'Back', equipment: ['gym'], level: 'intermediate', reps: '8–12', rest: 90, cue: 'Hold a steady hip hinge and draw the bar toward your lower ribs without jerking.', variants: {
      bodyweight: { name: 'Prone W Raise', reps: '10–15', rest: 45, cue: 'Lie face down with arms in a W and gently lift your hands while keeping your neck relaxed.' }
    } },
    { id: 'pull-up', name: 'Pull-Up', muscle: 'Back', equipment: ['gym'], level: 'intermediate', reps: '5–8', rest: 90, cue: 'Use a secure pull-up bar, pull without swinging, and lower under control.' },
    { id: 'lat-pulldown', name: 'Lat Pulldown', muscle: 'Back', equipment: ['gym'], level: 'beginner', reps: '8–12', rest: 90, cue: 'Pull the handle toward your upper chest without swinging or pulling behind your head.', variants: {
      bodyweight: { name: 'Prone Lat Pull', reps: '10–15', rest: 45, cue: 'Lie face down, reach overhead, and draw your elbows toward your ribs without arching your back.' }
    } },
    { id: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', muscle: 'Chest', equipment: weightedSettings, level: 'beginner', reps: '8–12', rest: 90, cue: 'Keep your wrists above your elbows and lower the dumbbells with control.', variants: {
      dumbbell: { name: 'Dumbbell Floor Press', reps: '8–12', rest: 90, cue: 'Lie on the floor, lower until your upper arms touch gently, and press without bouncing.' }
    } },
    { id: 'dumbbell-row', name: 'Dumbbell Row', muscle: 'Back', equipment: weightedSettings, level: 'beginner', reps: '8–12 per side', rest: 90, cue: 'Support one hand on your thigh, hold your torso steady, and row toward your hip on each side.' },
    { id: 'goblet-squat', name: 'Goblet Squat', muscle: 'Legs', equipment: weightedSettings, level: 'beginner', reps: '8–12', rest: 90, cue: 'Hold one dumbbell close to your chest and keep your heels down as you squat.' },
    { id: 'romanian-deadlift', name: 'Romanian Deadlift', muscle: 'Legs', equipment: weightedSettings, level: 'intermediate', reps: '8–12', rest: 90, cue: 'Soften your knees, move your hips back, and keep the weights close without rounding your back.' },
    { id: 'leg-press', name: 'Leg Press', muscle: 'Legs', equipment: ['gym'], level: 'beginner', reps: '10–15', rest: 90, cue: 'Keep your hips on the pad and lower the sled only as far as you can control.' },
    { id: 'lunges', name: 'Lunges', muscle: 'Legs', equipment: allSettings, level: 'beginner', reps: '8–10 per side', rest: 90, cue: 'Step back into a comfortable lunge and push through your front foot; complete both sides.', variants: {
      bodyweight: { name: 'Reverse Lunge', reps: '8–10 per side', rest: 60, cue: 'Step back slowly, keep your front foot planted, and use a shorter range if your balance changes.' }
    } },
    { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscle: 'Legs', equipment: weightedSettings, level: 'intermediate', reps: '8–10 per side', rest: 90, cue: 'Rest your rear foot on a stable low bench and lower over your front leg without losing balance.' },
    { id: 'push-up', name: 'Push-Up', muscle: 'Chest', equipment: allSettings, level: 'beginner', reps: '6–12', rest: 60, cue: 'Keep your body aligned and lower with control; keep your knees down if needed.' },
    { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: ['gym'], level: 'beginner', reps: '8–12', rest: 90, cue: 'Use a modest bench incline and press without letting your shoulders shrug upward.' },
    { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', equipment: weightedSettings, level: 'beginner', reps: '8–12', rest: 90, cue: 'Stand tall and press overhead without leaning backward or forcing your range.' },
    { id: 'lateral-raise', name: 'Lateral Raise', muscle: 'Shoulders', equipment: weightedSettings, level: 'beginner', reps: '10–15', rest: 60, cue: 'Use light dumbbells, lead with your elbows, and stop around shoulder height.', variants: {
      bodyweight: { name: 'Prone Y Raise', reps: '10–15', rest: 45, cue: 'Lie face down with arms in a Y and lift them a little without shrugging or arching your back.' }
    } },
    { id: 'bicep-curl', name: 'Bicep Curl', muscle: 'Arms', equipment: weightedSettings, level: 'beginner', reps: '10–15', rest: 60, cue: 'Keep your elbows near your sides and curl without swinging your torso.', variants: {
      bodyweight: { name: 'Self-Resisted Curl', reps: '8–12 per side', rest: 45, cue: 'Resist one palm gently with your other hand as you curl, then switch arms after the set.' }
    } },
    { id: 'triceps-pushdown', name: 'Triceps Pushdown', muscle: 'Arms', equipment: ['gym'], level: 'beginner', reps: '10–15', rest: 60, cue: 'Keep your elbows near your ribs and straighten your arms without moving your shoulders.', variants: {
      bodyweight: { name: 'Close-Grip Knee Push-Up', reps: '6–10', rest: 60, cue: 'Keep your knees down and hands comfortably under your chest as you bend and straighten your elbows.' }
    } },
    { id: 'plank', name: 'Plank', muscle: 'Core', equipment: allSettings, level: 'beginner', reps: '20–30 seconds', rest: 45, cue: 'Brace your trunk and breathe steadily; keep your knees down if your hips start to sag.' },
    { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscle: 'Core', equipment: ['gym'], level: 'advanced', reps: '6–10', rest: 90, cue: 'Hang from a secure bar and lift with control without swinging your body.' },
    { id: 'russian-twist', name: 'Russian Twist', muscle: 'Core', equipment: allSettings, level: 'beginner', reps: '8–12 per side', rest: 45, cue: 'Keep your feet on the floor and rotate your upper torso gently to each side without added weight.' },
    { id: 'glute-bridge', name: 'Glute Bridge', muscle: 'Legs', equipment: allSettings, level: 'beginner', reps: '10–15', rest: 60, cue: 'Press through your feet and lift your hips until aligned with your torso without arching your back.' },
    { id: 'hip-thrust', name: 'Hip Thrust', muscle: 'Legs', equipment: weightedSettings, level: 'intermediate', reps: '8–12', rest: 90, cue: 'Use a stable bench, keep your chin gently tucked, and finish with your hips level.' },
    { id: 'seated-cable-row', name: 'Seated Cable Row', muscle: 'Back', equipment: ['gym'], level: 'beginner', reps: '8–12', rest: 90, cue: 'Keep your torso steady and draw the handle toward your ribs without leaning backward.' },
    { id: 'chest-fly', name: 'Chest Fly', muscle: 'Chest', equipment: weightedSettings, level: 'intermediate', reps: '10–15', rest: 60, cue: 'Keep a soft bend in your elbows and open only as far as your shoulders comfortably allow.' },
    { id: 'face-pull', name: 'Face Pull', muscle: 'Shoulders', equipment: ['gym'], level: 'beginner', reps: '10–15', rest: 60, cue: 'Set a light cable near face height and pull toward your forehead without shrugging.', variants: {
      dumbbell: { name: 'Prone W Raise', reps: '10–15', rest: 45, cue: 'Lie face down with empty hands in a W and lift them gently without arching your back.' }
    } },
    { id: 'hammer-curl', name: 'Hammer Curl', muscle: 'Arms', equipment: weightedSettings, level: 'beginner', reps: '10–15', rest: 60, cue: 'Keep your palms facing each other and curl without swinging your shoulders.' },
    { id: 'overhead-triceps-extension', name: 'Overhead Triceps Extension', muscle: 'Arms', equipment: weightedSettings, level: 'beginner', reps: '10–15', rest: 60, cue: 'Hold a light dumbbell overhead and bend your elbows without flaring your ribs.' },
    { id: 'calf-raise', name: 'Calf Raise', muscle: 'Legs', equipment: allSettings, level: 'beginner', reps: '12–15', rest: 45, cue: 'Stand on a flat floor, rise onto your toes, and lower slowly while keeping your balance.' },
    { id: 'leg-curl', name: 'Leg Curl', muscle: 'Legs', equipment: ['gym'], level: 'beginner', reps: '10–15', rest: 60, cue: 'Adjust the machine to your knee joint and curl without lifting your hips.', variants: {
      dumbbell: { name: 'Hamstring Walkout', reps: '6–8', rest: 60, cue: 'From a low bridge, take two small heel steps out and back for one rep; lower if control is lost.' },
      bodyweight: { name: 'Hamstring Walkout', reps: '6–8', rest: 60, cue: 'From a low bridge, take two small heel steps out and back for one rep; lower if control is lost.' }
    } },
    { id: 'leg-extension', name: 'Leg Extension', muscle: 'Legs', equipment: ['gym'], level: 'beginner', reps: '10–15', rest: 60, cue: 'Align the machine with your knees and straighten your legs smoothly without kicking.' },
    { id: 'dumbbell-step-up', name: 'Dumbbell Step-Up', muscle: 'Legs', equipment: weightedSettings, level: 'intermediate', reps: '8–10 per side', rest: 90, cue: 'Use a stable low step and drive through the lead foot rather than pushing off the trailing foot.' },
    { id: 'dips', name: 'Dips', muscle: 'Arms', equipment: ['gym'], level: 'intermediate', reps: '6–10', rest: 90, cue: 'Use secure parallel bars and lower only through a comfortable shoulder range without bouncing.' },
    { id: 'inverted-row', name: 'Inverted Row', muscle: 'Back', equipment: ['gym'], level: 'intermediate', reps: '6–12', rest: 90, cue: 'Use a securely fixed bar and keep your body aligned as you draw your chest toward it.' },
    { id: 'mountain-climber', name: 'Mountain Climber', muscle: 'Core', equipment: allSettings, level: 'intermediate', reps: '8–12 per side', rest: 60, cue: 'Keep your hands planted and bring one knee forward at a time without bouncing your hips.' },
    { id: 'burpee', name: 'Burpee', muscle: 'Legs', equipment: allSettings, level: 'advanced', reps: '6–8', rest: 90, cue: 'Step back and forward with control, standing between reps before adding any jump.' },
    { id: 'kettlebell-swing', name: 'Kettlebell Swing', muscle: 'Legs', equipment: ['gym'], level: 'intermediate', reps: '10–15', rest: 90, cue: 'Use a practiced hip hinge to move the kettlebell and avoid lifting it with your arms.' },
    { id: 'farmers-carry', name: "Farmer's Carry", muscle: 'Core', equipment: weightedSettings, level: 'beginner', reps: '20–30 seconds', rest: 60, cue: 'Carry two manageable dumbbells at your sides and walk slowly along a clear path.' }
  ];

  // Each prescription is [canonical ID, sets]. The six-day schedule uses two
  // sets per exercise to keep individual sessions modest at that frequency.
  var sessions = {
    gym: {
      fullA: [['goblet-squat', 3], ['dumbbell-bench-press', 3], ['seated-cable-row', 3], ['romanian-deadlift', 2], ['plank', 2]],
      fullB: [['leg-press', 3], ['lat-pulldown', 3], ['dumbbell-shoulder-press', 2], ['glute-bridge', 2], ['hammer-curl', 2], ['calf-raise', 2]],
      fullC: [['lunges', 2], ['incline-dumbbell-press', 3], ['dumbbell-row', 3], ['leg-curl', 2], ['lateral-raise', 2], ['russian-twist', 2]],
      upperA: [['dumbbell-bench-press', 3], ['seated-cable-row', 3], ['dumbbell-shoulder-press', 2], ['lat-pulldown', 2], ['bicep-curl', 2]],
      lowerA: [['leg-press', 3], ['romanian-deadlift', 3], ['leg-curl', 2], ['calf-raise', 2], ['plank', 2]],
      upperB: [['incline-dumbbell-press', 3], ['dumbbell-row', 3], ['lateral-raise', 2], ['face-pull', 2], ['triceps-pushdown', 2]],
      lowerB: [['goblet-squat', 3], ['lunges', 2], ['glute-bridge', 3], ['leg-curl', 2], ['calf-raise', 2]],
      pushA: [['dumbbell-bench-press', 3], ['dumbbell-shoulder-press', 2], ['lateral-raise', 2], ['triceps-pushdown', 2]],
      pullA: [['lat-pulldown', 3], ['seated-cable-row', 3], ['face-pull', 2], ['hammer-curl', 2]],
      pushB: [['incline-dumbbell-press', 3], ['dumbbell-shoulder-press', 2], ['lateral-raise', 2], ['overhead-triceps-extension', 2]],
      pullB: [['dumbbell-row', 3], ['lat-pulldown', 2], ['face-pull', 2], ['bicep-curl', 2]]
    },
    dumbbell: {
      fullA: [['goblet-squat', 3], ['dumbbell-bench-press', 3], ['dumbbell-row', 3], ['romanian-deadlift', 2], ['plank', 2]],
      fullB: [['lunges', 2], ['dumbbell-shoulder-press', 3], ['dumbbell-row', 3], ['glute-bridge', 2], ['hammer-curl', 2], ['calf-raise', 2]],
      fullC: [['goblet-squat', 3], ['push-up', 2], ['dumbbell-row', 3], ['romanian-deadlift', 2], ['lateral-raise', 2], ['russian-twist', 2]],
      upperA: [['dumbbell-bench-press', 3], ['dumbbell-row', 3], ['dumbbell-shoulder-press', 2], ['hammer-curl', 2], ['overhead-triceps-extension', 2]],
      lowerA: [['goblet-squat', 3], ['romanian-deadlift', 3], ['lunges', 2], ['calf-raise', 2], ['plank', 2]],
      upperB: [['dumbbell-bench-press', 3], ['dumbbell-row', 3], ['lateral-raise', 2], ['bicep-curl', 2], ['overhead-triceps-extension', 2]],
      lowerB: [['lunges', 2], ['romanian-deadlift', 3], ['glute-bridge', 3], ['leg-curl', 2], ['calf-raise', 2]],
      pushA: [['dumbbell-bench-press', 3], ['dumbbell-shoulder-press', 2], ['lateral-raise', 2], ['overhead-triceps-extension', 2]],
      pullA: [['dumbbell-row', 3], ['face-pull', 2], ['hammer-curl', 2], ['farmers-carry', 2]],
      pushB: [['push-up', 3], ['dumbbell-shoulder-press', 2], ['lateral-raise', 2], ['overhead-triceps-extension', 2]],
      pullB: [['dumbbell-row', 3], ['face-pull', 2], ['bicep-curl', 2], ['farmers-carry', 2]]
    },
    bodyweight: {
      fullA: [['squat', 3], ['push-up', 2], ['barbell-row', 2], ['glute-bridge', 3], ['plank', 2]],
      fullB: [['lunges', 2], ['lat-pulldown', 2], ['push-up', 2], ['leg-curl', 2], ['calf-raise', 2]],
      fullC: [['squat', 3], ['push-up', 2], ['barbell-row', 2], ['glute-bridge', 2], ['lateral-raise', 2], ['russian-twist', 2]],
      upperA: [['push-up', 3], ['barbell-row', 3], ['lateral-raise', 2], ['bicep-curl', 2], ['triceps-pushdown', 2]],
      lowerA: [['squat', 3], ['lunges', 2], ['glute-bridge', 3], ['calf-raise', 2], ['plank', 2]],
      upperB: [['push-up', 3], ['lat-pulldown', 3], ['lateral-raise', 2], ['bicep-curl', 2], ['triceps-pushdown', 2]],
      lowerB: [['lunges', 2], ['squat', 3], ['leg-curl', 2], ['glute-bridge', 2], ['calf-raise', 2]],
      pushA: [['push-up', 3], ['lateral-raise', 2], ['triceps-pushdown', 2], ['plank', 2]],
      pullA: [['barbell-row', 3], ['lat-pulldown', 2], ['bicep-curl', 2], ['russian-twist', 2]],
      pushB: [['push-up', 3], ['lateral-raise', 2], ['triceps-pushdown', 2], ['plank', 2]],
      pullB: [['lat-pulldown', 3], ['barbell-row', 2], ['bicep-curl', 2], ['russian-twist', 2]]
    }
  };

  // Monday is day zero. Unlisted weekdays are recovery days; the final gap
  // also preserves recovery before the following Monday.
  var schedules = {
    2: [[0, 'Full body A', 'fullA'], [3, 'Full body B', 'fullB']],
    3: [[0, 'Full body A', 'fullA'], [2, 'Full body B', 'fullB'], [4, 'Full body C', 'fullC']],
    4: [[0, 'Upper body A', 'upperA'], [1, 'Lower body A', 'lowerA'], [3, 'Upper body B', 'upperB'], [4, 'Lower body B', 'lowerB']],
    5: [[0, 'Push', 'pushA'], [1, 'Pull', 'pullA'], [2, 'Legs', 'lowerA'], [4, 'Upper body', 'upperB'], [5, 'Lower body', 'lowerB']],
    6: [[0, 'Push A', 'pushA'], [1, 'Pull A', 'pullA'], [2, 'Legs A', 'lowerA'], [3, 'Push B', 'pushB'], [4, 'Pull B', 'pullB'], [5, 'Legs B', 'lowerB']]
  };
  var weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var byId = {};
  exercises.forEach(function (exercise) { byId[exercise.id] = exercise; });

  function getPlan(days, equipment) {
    var count = Number(days);
    if (!Number.isInteger(count) || count < 2 || count > 6) {
      throw new RangeError('Training days must be a whole number from 2 to 6.');
    }
    if (allSettings.indexOf(equipment) === -1) {
      throw new RangeError('Equipment must be gym, dumbbell, or bodyweight.');
    }
    return schedules[count].map(function (schedule, index) {
      return {
        day: index + 1,
        weekday: weekdays[schedule[0]],
        title: schedule[1],
        exercises: sessions[equipment][schedule[2]].map(function (prescription) {
          var canonical = byId[prescription[0]];
          var variant = canonical.variants && canonical.variants[equipment];
          var selected = variant || canonical;
          return {
            id: canonical.id,
            name: selected.name,
            muscle: canonical.muscle,
            equipment: equipment,
            sets: count === 6 ? 2 : prescription[1],
            reps: selected.reps,
            rest: selected.rest,
            cue: selected.cue
          };
        })
      };
    });
  }

  var progression = [
    { week: 1, focus: 'Find a steady starting point', detail: 'Use a comfortable load or variation and finish sets with about 2–3 good reps available; learn the movements before adding work.' },
    { week: 2, focus: 'Add 1–2 reps if ready', detail: 'If all sets feel controlled and recovery is good, add 1–2 reps within the listed range; otherwise repeat the previous week.' },
    { week: 3, focus: 'Add 2.5–5% load only if ready', detail: 'Only if you reach the top of the rep range with steady technique for two sessions, add 2.5–5% load and return to the lower end; with bodyweight, repeat or slow the lowering phase.' },
    { week: 4, focus: 'Consolidate and recover', detail: 'Repeat the work you can perform well; reduce sets or load if fatigue builds, and take an extra recovery day when needed.' }
  ];

  root.WorkoutData = {
    exercises: exercises,
    getPlan: getPlan,
    progression: progression
  };
})(typeof window !== 'undefined' ? window : globalThis);
