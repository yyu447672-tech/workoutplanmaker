(function (root) {
  'use strict';

  function fail(code, field, message) {
    var error = new Error(message);
    error.name = 'WorkoutInputError';
    error.code = code;
    error.field = field;
    throw error;
  }

  function readNumber(value, field) {
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      fail('REQUIRED_FIELD', field, 'Enter a value for ' + field + '.');
    }
    if (typeof value === 'string') {
      var text = value.trim();
      if (!/^[+-]?(?:\d+|\d*\.\d+)$/.test(text)) {
        fail('INVALID_NUMBER', field, 'Enter a complete decimal number for ' + field + '.');
      }
      value = Number(text);
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      fail('INVALID_NUMBER', field, 'Enter a finite number for ' + field + '.');
    }
    return value;
  }

  function inRange(value, min, max, field) {
    if (value < min || value > max) {
      fail('NUMBER_RANGE', field, field + ' must be between ' + min + ' and ' + max + '.');
    }
    return value;
  }

  function readInteger(value, min, max, field) {
    var number = readNumber(value, field);
    if (!Number.isInteger(number)) {
      fail('INTEGER_REQUIRED', field, 'Enter a whole number for ' + field + '.');
    }
    return inRange(number, min, max, field);
  }

  function readChoice(value, choices, field) {
    if (value === undefined || value === null || value === '') {
      fail('REQUIRED_FIELD', field, 'Choose a value for ' + field + '.');
    }
    if (!choices.includes(value)) {
      fail('INVALID_CHOICE', field, 'Choose a supported value for ' + field + '.');
    }
    return value;
  }

  function normalizeProfile(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      fail('INVALID_PROFILE', 'profile', 'Provide the assessment answers as an object.');
    }
    var heightUnit = readChoice(raw.heightUnit === undefined ? 'metric' : raw.heightUnit, ['metric', 'imperial'], 'heightUnit');
    var weightUnit = readChoice(raw.weightUnit === undefined ? 'metric' : raw.weightUnit, ['metric', 'imperial'], 'weightUnit');
    var heightCm;
    var weightKg;

    if (heightUnit === 'imperial') {
      var feet = readInteger(raw.heightFeet, 0, 8, 'heightFeet');
      var inches = readNumber(raw.heightInches, 'heightInches');
      if (inches < 0 || inches >= 12) {
        fail('NUMBER_RANGE', 'heightInches', 'Inches must be at least 0 and less than 12.');
      }
      heightCm = (feet * 12 + inches) * 2.54;
    } else {
      heightCm = readNumber(raw.heightCm, 'heightCm');
    }
    weightKg = weightUnit === 'imperial'
      ? readNumber(raw.weightLb, 'weightLb') * 0.45359237
      : readNumber(raw.weightKg, 'weightKg');

    return {
      age: readInteger(raw.age, 16, 80, 'age'),
      sex: readChoice(raw.sex, ['male', 'female'], 'sex'),
      heightCm: inRange(heightCm, 120, 230, 'heightCm'),
      weightKg: inRange(weightKg, 30, 250, 'weightKg'),
      goal: readChoice(raw.goal, ['lose', 'gain', 'maintain'], 'goal'),
      activity: readChoice(raw.activity, ['sedentary', 'light', 'moderate', 'high'], 'activity'),
      days: readInteger(raw.days, 2, 6, 'days'),
      equipment: readChoice(raw.equipment, ['gym', 'dumbbell', 'bodyweight'], 'equipment')
    };
  }

  function macros(calories, weightKg, goal) {
    calories = readNumber(calories, 'calories');
    weightKg = inRange(readNumber(weightKg, 'weightKg'), 30, 250, 'weightKg');
    goal = readChoice(goal, ['lose', 'gain', 'maintain'], 'goal');
    if (calories < 800 || calories > 8000) {
      fail('CALORIES_OUT_OF_RANGE', 'calories', 'This calculator supports 800 to 8000 kcal. Review the input; this range is not a personal nutrition recommendation.');
    }

    var proteinRatio = { lose: 2, gain: 1.8, maintain: 1.6 }[goal];
    var protein = proteinRatio * weightKg;
    var fat = 0.9 * weightKg;
    var carbohydrateEnergy = calories - protein * 4 - fat * 9;
    if (carbohydrateEnergy < 0) {
      fail('NEGATIVE_CARBS', 'calories', 'The calorie target cannot cover the specified protein and fat. Review the calorie target and weight.');
    }
    var carbs = carbohydrateEnergy / 4;
    var proteinPercent = protein * 4 / calories * 100;
    var fatPercent = fat * 9 / calories * 100;

    return {
      calories: calories,
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs),
      percent: {
        protein: proteinPercent,
        fat: fatPercent,
        carbs: 100 - (proteinPercent + fatPercent)
      },
      raw: { protein: protein, fat: fat, carbs: carbs }
    };
  }

  function mealSplit(daily) {
    if (!daily || typeof daily !== 'object' || Array.isArray(daily)) {
      fail('INVALID_MACROS', 'macros', 'Provide daily macro grams as an object.');
    }
    var nutrients = ['protein', 'fat', 'carbs'];
    var meals = ['Breakfast', 'Lunch', 'Dinner'].map(function (name) { return { name: name }; });
    nutrients.forEach(function (nutrient) {
      var grams = readInteger(daily[nutrient], 0, Number.MAX_SAFE_INTEGER, nutrient);
      var base = Math.floor(grams / 3);
      var remainder = grams % 3;
      meals.forEach(function (meal, index) {
        meal[nutrient] = base + (index < remainder ? 1 : 0);
      });
    });
    return meals;
  }

  function bodyFat(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      fail('INVALID_PROFILE', 'measures', 'Provide body-fat measurements as an object.');
    }
    var isBlank = function (value) {
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    };
    if (['waist', 'neck', 'hips'].every(function (field) { return isBlank(raw[field]); })) {
      return null;
    }

    var sex = readChoice(raw.sex, ['male', 'female'], 'sex');
    var unit = readChoice(raw.unit === undefined ? 'cm' : raw.unit, ['cm', 'in'], 'unit');
    var required = sex === 'female' ? ['waist', 'neck', 'hips'] : ['waist', 'neck'];
    required.forEach(function (field) {
      if (isBlank(raw[field])) {
        fail('MISSING_MEASURES', field, 'Complete every required circumference or leave the whole group blank.');
      }
    });

    var cm = {};
    ['heightCm'].concat(required).forEach(function (field) {
      var value = readNumber(raw[field], field);
      // Height is already normalized to centimeters; only circumference inputs convert.
      cm[field] = value * (field !== 'heightCm' && unit === 'in' ? 2.54 : 1);
      if (!Number.isFinite(cm[field]) || cm[field] <= 0) {
        fail('BODY_FAT_DOMAIN', field, 'Body-fat measurements must be finite and greater than zero.');
      }
    });

    var difference = sex === 'male' ? cm.waist - cm.neck : cm.waist + cm.hips - cm.neck;
    if (!Number.isFinite(difference) || difference <= 0) {
      fail('BODY_FAT_DOMAIN', 'measures', 'Review the circumferences: the formula requires a positive circumference difference.');
    }
    // These density coefficients require centimeters, including height.
    var denominator = sex === 'male'
      ? 1.0324 - 0.19077 * Math.log10(difference) + 0.15456 * Math.log10(cm.heightCm)
      : 1.29579 - 0.35004 * Math.log10(difference) + 0.22100 * Math.log10(cm.heightCm);
    if (!Number.isFinite(denominator) || denominator <= 0) {
      fail('BODY_FAT_DOMAIN', 'measures', 'These measurements do not produce a valid body-fat formula denominator.');
    }
    var percent = 495 / denominator - 450;
    if (!Number.isFinite(percent) || percent < 0 || percent > 70) {
      fail('BODY_FAT_RANGE', 'measures', 'The estimate is outside this calculator’s supported 0 to 70 percent range. Review the measurements and units.');
    }
    return percent;
  }

  function calculate(raw) {
    var profile = normalizeProfile(raw);
    if (profile.age < 18) {
      fail('ADULT_ONLY', 'age', 'Adult calorie and macro estimates are available from age 18.');
    }
    var heightM = profile.heightCm / 100;
    var bmi = profile.weightKg / (heightM * heightM);
    var bmiCategory = bmi < 18.5 ? 'underweight'
      : bmi < 25 ? 'normal'
        : bmi < 30 ? 'overweight' : 'obesity';
    var sexOffset = profile.sex === 'male' ? 5 : -161;
    var bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + sexOffset;
    var activityFactor = { sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725 }[profile.activity];
    var tdee = bmr * activityFactor;
    var targets = { maintain: tdee, lose: tdee - 400, gain: tdee + 250 };
    var calories = targets[profile.goal];
    var dailyMacros = macros(calories, profile.weightKg, profile.goal);

    return {
      profile: profile,
      bmi: bmi,
      bmiCategory: bmiCategory,
      bmr: bmr,
      tdee: tdee,
      activityFactor: activityFactor,
      targets: targets,
      calories: calories,
      macros: dailyMacros,
      meals: mealSplit(dailyMacros)
    };
  }

  root.WorkoutCore = Object.freeze({
    normalizeProfile: normalizeProfile,
    calculate: calculate,
    macros: macros,
    mealSplit: mealSplit,
    bodyFat: bodyFat
  });
})(globalThis);
