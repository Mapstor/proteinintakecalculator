/* PROTEIN INTAKE CALCULATOR - ENHANCED JAVASCRIPT */

const PROTEIN_FACTORS = {
  sedentary: { min: 0.36, optimal: 0.5, max: 0.6, label: 'Sedentary' },
  light: { min: 0.5, optimal: 0.6, max: 0.7, label: 'Light Activity' },
  moderate: { min: 0.6, optimal: 0.7, max: 0.8, label: 'Moderate Exercise' },
  active: { min: 0.7, optimal: 0.8, max: 1.0, label: 'Active' },
  athlete: { min: 0.8, optimal: 1.0, max: 1.2, label: 'Athlete/Intense' }
};

const INTENSITY_FACTORS = {
  beginner: { factor: 0.8, label: 'Beginner (0-1 years)' },
  moderate: { factor: 1.0, label: 'Intermediate (1-3 years)' },
  advanced: { factor: 1.1, label: 'Advanced (3+ years)' },
  intense: { factor: 1.2, label: 'Elite/Competitive' }
};

const DEFICIT_FACTORS = {
  small: { factor: 0.9, label: 'Small (~0.5 lb/week)', rate: 0.5 },
  moderate: { factor: 1.0, label: 'Moderate (~1 lb/week)', rate: 1.0 },
  aggressive: { factor: 1.1, label: 'Aggressive (~1.5-2 lb/week)', rate: 1.75 }
};

const GOAL_LABELS = {
  maintain: 'Maintain Health',
  build: 'Build Muscle',
  lose: 'Lose Weight'
};

document.addEventListener('DOMContentLoaded', init);

function init() {
  setupTabs();
  setupCalculateButtons();
  setupFAQ();
  setupMobileNav();
  setupPrintButtons();
}

function setupTabs() {
  document.querySelectorAll('.calc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.calc-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('panel-' + tabId).classList.add('active');
    });
  });
}

function setupCalculateButtons() {
  document.getElementById('calc-daily-btn')?.addEventListener('click', calculateDaily);
  document.getElementById('calc-muscle-btn')?.addEventListener('click', calculateMuscle);
  document.getElementById('calc-loss-btn')?.addEventListener('click', calculateLoss);
  document.getElementById('calc-meal-btn')?.addEventListener('click', calculateMeal);
}

function setupPrintButtons() {
  document.querySelectorAll('.print-btn').forEach(btn => {
    btn.addEventListener('click', () => window.print());
  });
}

// =====================================================
// TAB 1: DAILY PROTEIN - Enhanced
// =====================================================
function calculateDaily() {
  const weight = parseFloat(document.getElementById('weight')?.value) || 150;
  const unit = document.getElementById('weight-unit')?.value || 'lbs';
  const activity = document.getElementById('activity')?.value || 'moderate';
  const goal = document.getElementById('goal')?.value || 'maintain';

  const weightLbs = unit === 'kg' ? weight * 2.205 : weight;
  const weightKg = unit === 'kg' ? weight : weight / 2.205;

  let factors = { ...PROTEIN_FACTORS[activity] };

  // Adjust for goal
  if (goal === 'build') {
    factors.min += 0.2;
    factors.optimal += 0.2;
    factors.max += 0.2;
  } else if (goal === 'lose') {
    factors.min += 0.3;
    factors.optimal += 0.3;
    factors.max += 0.2;
  }

  const minProtein = Math.round(weightLbs * factors.min);
  const optimalProtein = Math.round(weightLbs * factors.optimal);
  const maxProtein = Math.round(weightLbs * factors.max);

  displayDailyResults({
    optimal: optimalProtein,
    min: minProtein,
    max: maxProtein,
    perLb: factors.optimal,
    perKg: factors.optimal * 2.205,
    weight: weightLbs,
    weightKg: weightKg,
    unit: unit,
    activity: activity,
    activityLabel: PROTEIN_FACTORS[activity].label,
    goal: goal,
    goalLabel: GOAL_LABELS[goal]
  });
}

function displayDailyResults(results) {
  const section = document.getElementById('daily-results');
  if (!section) return;

  // Primary result
  document.getElementById('daily-protein').textContent = results.optimal;
  document.getElementById('daily-sublabel').textContent = results.perLb.toFixed(2) + 'g per lb body weight';

  // Range values
  document.getElementById('protein-min').textContent = results.min + 'g';
  document.getElementById('protein-optimal').textContent = results.optimal + 'g';
  document.getElementById('protein-max').textContent = results.max + 'g';
  document.getElementById('protein-per-lb').textContent = results.perLb.toFixed(2) + 'g';

  // Range bar
  const rangePercent = ((results.optimal - results.min) / (results.max - results.min)) * 100;
  document.getElementById('protein-range-fill').style.width = Math.min(95, rangePercent + 25) + '%';
  document.getElementById('range-min').textContent = results.min + 'g';
  document.getElementById('range-max').textContent = results.max + 'g';

  // Enhanced results
  const enhancedContainer = document.getElementById('daily-enhanced');
  if (enhancedContainer) {
    enhancedContainer.innerHTML = generateEnhancedDailyResults(results);
  }

  section.classList.add('visible');
}

function generateEnhancedDailyResults(r) {
  const perMeal3 = Math.round(r.optimal / 3);
  const perMeal4 = Math.round(r.optimal / 4);
  const percentCalories = Math.round((r.optimal * 4) / (r.weight * 15) * 100); // rough estimate

  return `
    <!-- Input Summary -->
    <div class="results-card">
      <div class="results-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <h3>Your Inputs</h3>
      </div>
      <table class="summary-table">
        <tr><td>Body Weight</td><td>${Math.round(r.weight)} lbs (${Math.round(r.weightKg)} kg)</td></tr>
        <tr><td>Activity Level</td><td>${r.activityLabel}</td></tr>
        <tr><td>Goal</td><td>${r.goalLabel}</td></tr>
      </table>
    </div>

    <!-- Key Results -->
    <div class="results-card">
      <div class="results-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h3>Your Key Results</h3>
      </div>
      <table class="summary-table">
        <tr><td>Optimal Daily Protein</td><td class="highlight">${r.optimal}g</td></tr>
        <tr><td>Acceptable Range</td><td>${r.min}g - ${r.max}g</td></tr>
        <tr><td>Protein per lb Body Weight</td><td>${r.perLb.toFixed(2)}g</td></tr>
        <tr><td>Protein per kg Body Weight</td><td>${r.perKg.toFixed(1)}g</td></tr>
        <tr><td>Per Meal (3 meals)</td><td>${perMeal3}g</td></tr>
        <tr><td>Per Meal (4 meals)</td><td>${perMeal4}g</td></tr>
      </table>
    </div>

    <!-- What This Means -->
    <div class="meaning-box">
      <h4>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        What This Means
      </h4>
      <p>${getInterpretation(r)}</p>
    </div>

    <!-- Actionable Tips -->
    <div class="results-card">
      <div class="results-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        <h3>How to Hit Your Target</h3>
      </div>
      <div class="tips-grid">
        ${generateTips(r)}
      </div>
    </div>

    <button class="print-btn" onclick="window.print()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
      Print or Save Results
    </button>
  `;
}

function getInterpretation(r) {
  if (r.goal === 'build') {
    return `At ${r.optimal}g of protein daily, you're giving your body the amino acids it needs to build and repair muscle tissue. This is ${r.perLb.toFixed(1)}g per pound of body weight—well within the research-supported range for muscle growth. Focus on spreading this across 3-4 meals, with 25-40g per meal for optimal muscle protein synthesis.`;
  } else if (r.goal === 'lose') {
    return `During weight loss, your ${r.optimal}g daily protein target helps preserve muscle mass while you're in a calorie deficit. This higher intake (${r.perLb.toFixed(1)}g/lb) also helps with satiety, keeping you fuller longer. Prioritize lean protein sources to maximize protein while minimizing excess calories.`;
  } else {
    return `Your ${r.optimal}g daily protein target supports general health, immune function, and maintenance of your current muscle mass. This is a balanced intake that's appropriate for your activity level. You have flexibility within the ${r.min}g-${r.max}g range—aim for the higher end on more active days.`;
  }
}

function generateTips(r) {
  const perMeal = Math.round(r.optimal / 4);
  const tips = [
    { icon: 'clock', title: 'Spread It Out', desc: `Aim for ~${perMeal}g at each of 4 meals for optimal absorption.` },
    { icon: 'sunrise', title: 'Start Strong', desc: 'Include 25-30g protein at breakfast to front-load your intake.' },
    { icon: 'shopping-bag', title: 'Prep Ahead', desc: 'Cook protein in batches on weekends for easy weekday meals.' },
    { icon: 'target', title: 'Track Initially', desc: 'Use an app for 2 weeks to learn portion sizes, then estimate.' }
  ];

  return tips.map(t => `
    <div class="tip-item">
      <div class="tip-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>
      <div class="tip-content"><h4>${t.title}</h4><p>${t.desc}</p></div>
    </div>
  `).join('');
}

// =====================================================
// TAB 2: MUSCLE BUILDING - Enhanced
// =====================================================
function calculateMuscle() {
  const weight = parseFloat(document.getElementById('muscle-weight')?.value) || 180;
  const useLBM = document.getElementById('use-lbm')?.checked || false;
  const lbm = parseFloat(document.getElementById('lbm-input')?.value) || 150;
  const intensity = document.getElementById('intensity')?.value || 'moderate';

  const baseWeight = useLBM ? lbm : weight;
  const intensityData = INTENSITY_FACTORS[intensity];
  const proteinPerLb = intensityData.factor;

  const protein = Math.round(baseWeight * proteinPerLb);
  const proteinMin = Math.round(baseWeight * 0.8);
  const proteinMax = Math.round(baseWeight * 1.2);

  displayMuscleResults({
    optimal: protein,
    min: proteinMin,
    max: proteinMax,
    perLb: proteinPerLb,
    baseWeight: baseWeight,
    totalWeight: weight,
    useLBM: useLBM,
    intensity: intensity,
    intensityLabel: intensityData.label
  });
}

function displayMuscleResults(results) {
  const section = document.getElementById('muscle-results');
  if (!section) return;

  document.getElementById('muscle-protein').textContent = results.optimal;
  document.getElementById('muscle-sublabel').textContent = results.perLb + 'g per lb ' + (results.useLBM ? 'lean mass' : 'body weight');

  document.getElementById('muscle-base').textContent = results.baseWeight + ' lbs';
  document.getElementById('muscle-per-lb').textContent = results.perLb + 'g';
  document.getElementById('muscle-min').textContent = results.min + 'g';
  document.getElementById('muscle-max').textContent = results.max + 'g';

  // Enhanced results
  const enhancedContainer = document.getElementById('muscle-enhanced');
  if (enhancedContainer) {
    enhancedContainer.innerHTML = generateEnhancedMuscleResults(results);
  }

  section.classList.add('visible');
}

function generateEnhancedMuscleResults(r) {
  const perMeal4 = Math.round(r.optimal / 4);
  const perMeal5 = Math.round(r.optimal / 5);

  return `
    <div class="results-card">
      <div class="results-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <h3>Your Inputs</h3>
      </div>
      <table class="summary-table">
        <tr><td>${r.useLBM ? 'Lean Body Mass' : 'Body Weight'}</td><td>${r.baseWeight} lbs</td></tr>
        ${r.useLBM ? `<tr><td>Total Body Weight</td><td>${r.totalWeight} lbs</td></tr>` : ''}
        <tr><td>Training Level</td><td>${r.intensityLabel}</td></tr>
        <tr><td>Calculation Method</td><td>${r.useLBM ? 'Lean Body Mass' : 'Total Body Weight'}</td></tr>
      </table>
    </div>

    <div class="results-card">
      <div class="results-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h3>Your Muscle Building Targets</h3>
      </div>
      <table class="summary-table">
        <tr><td>Optimal Daily Protein</td><td class="highlight">${r.optimal}g</td></tr>
        <tr><td>Acceptable Range</td><td>${r.min}g - ${r.max}g</td></tr>
        <tr><td>Per Meal (4 meals)</td><td>${perMeal4}g</td></tr>
        <tr><td>Per Meal (5 meals)</td><td>${perMeal5}g</td></tr>
        <tr><td>Post-Workout (within 2 hrs)</td><td>30-40g</td></tr>
      </table>
    </div>

    <div class="meaning-box">
      <h4>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        What This Means for Muscle Growth
      </h4>
      <p>At ${r.perLb}g per pound, you're consuming the amount of protein research shows optimizes muscle protein synthesis for your training level. ${r.intensity === 'beginner' ? 'As a beginner, you can build muscle efficiently at this moderate intake. As you advance, your needs may increase.' : r.intensity === 'intense' ? 'As an elite trainee, you need maximum protein to squeeze out every bit of potential muscle growth.' : 'This intake supports continued muscle development while being practical to achieve consistently.'}</p>
    </div>

    <div class="results-card">
      <div class="results-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
        <h3>Muscle Building Tips</h3>
      </div>
      <div class="tips-grid">
        <div class="tip-item">
          <div class="tip-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>
          <div class="tip-content"><h4>Post-Workout Priority</h4><p>Consume 30-40g within 2 hours of training for optimal recovery.</p></div>
        </div>
        <div class="tip-item">
          <div class="tip-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>
          <div class="tip-content"><h4>Quality Sources</h4><p>Prioritize complete proteins: meat, fish, eggs, dairy, soy.</p></div>
        </div>
        <div class="tip-item">
          <div class="tip-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>
          <div class="tip-content"><h4>Even Distribution</h4><p>Spread ${r.optimal}g across 4-5 meals (~${perMeal4}-${perMeal5}g each).</p></div>
        </div>
        <div class="tip-item">
          <div class="tip-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>
          <div class="tip-content"><h4>Before Bed</h4><p>Casein protein or cottage cheese supports overnight recovery.</p></div>
        </div>
      </div>
    </div>

    <button class="print-btn" onclick="window.print()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
      Print or Save Results
    </button>
  `;
}

// =====================================================
// TAB 3: WEIGHT LOSS - Enhanced
// =====================================================
function calculateLoss() {
  const currentWeight = parseFloat(document.getElementById('current-weight')?.value) || 200;
  const goalWeight = parseFloat(document.getElementById('goal-weight')?.value) || 170;
  const deficit = document.getElementById('deficit')?.value || 'moderate';

  const deficitData = DEFICIT_FACTORS[deficit];
  const proteinPerLb = deficitData.factor;

  const protein = Math.round(currentWeight * proteinPerLb);
  const proteinGoal = Math.round(goalWeight * proteinPerLb);
  const proteinMin = Math.round(currentWeight * 0.8);
  const weightToLose = currentWeight - goalWeight;
  const weeksToGoal = Math.round(weightToLose / deficitData.rate);

  displayLossResults({
    optimal: protein,
    atGoal: proteinGoal,
    min: proteinMin,
    perLb: proteinPerLb,
    currentWeight: currentWeight,
    goalWeight: goalWeight,
    weightToLose: weightToLose,
    deficit: deficit,
    deficitLabel: deficitData.label,
    weeksToGoal: weeksToGoal
  });
}

function displayLossResults(results) {
  const section = document.getElementById('loss-results');
  if (!section) return;

  document.getElementById('loss-protein').textContent = results.optimal;
  document.getElementById('loss-sublabel').textContent = 'Higher protein preserves muscle during weight loss';

  document.getElementById('loss-current').textContent = results.currentWeight + ' lbs';
  document.getElementById('loss-per-lb').textContent = results.perLb + 'g/lb';
  document.getElementById('loss-at-goal').textContent = results.atGoal + 'g';
  document.getElementById('loss-min').textContent = results.min + 'g';

  // Enhanced results
  const enhancedContainer = document.getElementById('loss-enhanced');
  if (enhancedContainer) {
    enhancedContainer.innerHTML = generateEnhancedLossResults(results);
  }

  section.classList.add('visible');
}

function generateEnhancedLossResults(r) {
  const perMeal4 = Math.round(r.optimal / 4);

  return `
    <div class="results-card">
      <div class="results-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <h3>Your Inputs</h3>
      </div>
      <table class="summary-table">
        <tr><td>Current Weight</td><td>${r.currentWeight} lbs</td></tr>
        <tr><td>Goal Weight</td><td>${r.goalWeight} lbs</td></tr>
        <tr><td>Weight to Lose</td><td>${r.weightToLose} lbs</td></tr>
        <tr><td>Deficit Size</td><td>${r.deficitLabel}</td></tr>
      </table>
    </div>

    <div class="results-card">
      <div class="results-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h3>Your Weight Loss Protein Targets</h3>
      </div>
      <table class="summary-table">
        <tr><td>Current Daily Target</td><td class="highlight">${r.optimal}g</td></tr>
        <tr><td>Minimum Recommended</td><td>${r.min}g</td></tr>
        <tr><td>At Goal Weight</td><td>${r.atGoal}g</td></tr>
        <tr><td>Per Meal (4 meals)</td><td>${perMeal4}g</td></tr>
        <tr><td>Estimated Time to Goal</td><td>~${r.weeksToGoal} weeks</td></tr>
      </table>
    </div>

    <div class="meaning-box">
      <h4>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        Why High Protein During Weight Loss
      </h4>
      <p>At ${r.perLb}g per pound, you're consuming enough protein to preserve your muscle mass while in a calorie deficit. ${r.deficit === 'aggressive' ? 'With an aggressive deficit, your body is more likely to break down muscle for energy—this higher protein intake helps prevent that.' : 'This intake also helps with satiety, keeping you fuller for longer and making your diet more sustainable.'} As you lose weight, recalculate every 10-15 lbs to adjust your target downward.</p>
    </div>

    <div class="results-card">
      <div class="results-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
        <h3>Weight Loss Protein Tips</h3>
      </div>
      <div class="tips-grid">
        <div class="tip-item">
          <div class="tip-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>
          <div class="tip-content"><h4>Lean Sources</h4><p>Choose chicken, fish, egg whites, and low-fat dairy to maximize protein per calorie.</p></div>
        </div>
        <div class="tip-item">
          <div class="tip-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>
          <div class="tip-content"><h4>Protein First</h4><p>Build meals around protein, then add vegetables, then carbs/fats.</p></div>
        </div>
        <div class="tip-item">
          <div class="tip-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>
          <div class="tip-content"><h4>Stay Consistent</h4><p>Hit ${r.optimal}g daily. Protein is your muscle-protecting priority.</p></div>
        </div>
        <div class="tip-item">
          <div class="tip-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>
          <div class="tip-content"><h4>Recalculate</h4><p>Update your target every 10-15 lbs lost to match your new weight.</p></div>
        </div>
      </div>
    </div>

    <button class="print-btn" onclick="window.print()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
      Print or Save Results
    </button>
  `;
}

// =====================================================
// TAB 4: PER MEAL - Enhanced
// =====================================================
function calculateMeal() {
  const dailyProtein = parseFloat(document.getElementById('daily-protein-input')?.value) || 150;
  const meals = parseInt(document.getElementById('meals')?.value) || 4;

  const perMeal = Math.round(dailyProtein / meals);
  const isOptimal = perMeal >= 25 && perMeal <= 50;

  displayMealResults({
    daily: dailyProtein,
    meals: meals,
    perMeal: perMeal,
    isOptimal: isOptimal
  });
}

function displayMealResults(results) {
  const section = document.getElementById('meal-results');
  if (!section) return;

  document.getElementById('per-meal-protein').textContent = results.perMeal;
  document.getElementById('meal-sublabel').textContent = results.daily + 'g split across ' + results.meals + ' meals';

  // Generate meal breakdown
  const mealContainer = document.getElementById('meal-breakdown');
  const mealNames = results.meals === 3 ? ['Breakfast', 'Lunch', 'Dinner'] :
                   results.meals === 4 ? ['Breakfast', 'Lunch', 'Snack', 'Dinner'] :
                   results.meals === 5 ? ['Breakfast', 'Snack', 'Lunch', 'Snack', 'Dinner'] :
                   Array.from({length: results.meals}, (_, i) => 'Meal ' + (i + 1));

  mealContainer.innerHTML = mealNames.map(name => `
    <div class="meal-item">
      <div class="meal-item-label">${name}</div>
      <div class="meal-item-value">${results.perMeal}</div>
      <div class="meal-item-unit">grams</div>
    </div>
  `).join('');

  document.getElementById('meal-total').textContent = results.daily + 'g';
  document.getElementById('meal-count').textContent = results.meals;

  // Enhanced results
  const enhancedContainer = document.getElementById('meal-enhanced');
  if (enhancedContainer) {
    enhancedContainer.innerHTML = generateEnhancedMealResults(results);
  }

  section.classList.add('visible');
}

function generateEnhancedMealResults(r) {
  const optimalNote = r.isOptimal
    ? 'Your per-meal amount is in the optimal 25-50g range for muscle protein synthesis.'
    : r.perMeal < 25
      ? 'Your per-meal amount is below 25g. Consider fewer, larger meals for better muscle protein synthesis.'
      : 'Your per-meal amount exceeds 50g. Consider adding more meals to optimize absorption.';

  return `
    <div class="results-card">
      <div class="results-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h3>Meal Distribution Summary</h3>
      </div>
      <table class="summary-table">
        <tr><td>Daily Target</td><td>${r.daily}g</td></tr>
        <tr><td>Number of Meals</td><td>${r.meals}</td></tr>
        <tr><td>Per Meal Target</td><td class="highlight">${r.perMeal}g</td></tr>
        <tr><td>Optimal Range per Meal</td><td>25-50g</td></tr>
      </table>
    </div>

    <div class="meaning-box">
      <h4>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        Optimization Note
      </h4>
      <p>${optimalNote}</p>
    </div>

    <div class="results-card">
      <div class="results-card-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
        <h3>Sample Foods for ${r.perMeal}g Protein</h3>
      </div>
      <table class="summary-table">
        <thead><tr><th>Food</th><th>Amount for ~${r.perMeal}g</th></tr></thead>
        <tbody>
          <tr><td>Chicken Breast</td><td>${Math.round(r.perMeal / 31 * 4)} oz</td></tr>
          <tr><td>Greek Yogurt</td><td>${Math.round(r.perMeal / 17 * 170)}g (${Math.round(r.perMeal / 17)} cups)</td></tr>
          <tr><td>Eggs</td><td>${Math.round(r.perMeal / 6)} whole eggs</td></tr>
          <tr><td>Salmon</td><td>${Math.round(r.perMeal / 25 * 4)} oz</td></tr>
          <tr><td>Cottage Cheese</td><td>${Math.round(r.perMeal / 14 * 113)}g (~${Math.round(r.perMeal / 14)} cups)</td></tr>
        </tbody>
      </table>
    </div>

    <button class="print-btn" onclick="window.print()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
      Print or Save Results
    </button>
  `;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function setupFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

function setupMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.nav-mobile');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => mobileNav.classList.toggle('active'));
  }
}
