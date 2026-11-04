const recipes = [
  {
    id: 1,
    name: "Spaghetti Chicken Carbonara",
    cuisine: "Italian",
    dish: "Main",
    difficulty: "medium",
    description: "A delicious and creamy pasta dish with chicken.",
    image: "spaghetti chicken carbonara.jpg",
    prepTime: "10 min",
    cookTime: "",
    totalTime: "",
    servings: "1",
    ingredients: ["1/3 small onion", "2 garlic cloves", "mince chicken","mushrooms", "Pasta", "sauce"],
    steps: [
      "difrose chicken",
      "peel onion and garlic",
      "Boil pasta",
      "Dice onion and garlic",
      "cut mushrooms",
      "Heat oil in a pan",
      "Add onion and garlic then stir until translucent",
      "wait until smell rises",
      "add the mince chicken",
      "stir the mince chicken until it is cooked",
      "pour the sauce in",
      "Add the pasta into the pan",
      "stir until it is cooked perfectly",
      "Add shredded cheese",
      "Add salt to taste",
      "Add blackpepper",
      "Enjoy your meal!"
    ],
  },

  {
    id: 2,
    name: "kangkung goreng Belacan",
    cuisine: "Vegetable",
    dish: "Main",
    category: "Vegetable",
    difficulty: "easy",
    description: "Delicious kangkung belacan",
    image: "kangkung Goreng Belacan.jpg",
    prepTime: "2 min",
    cookTime: "4 min",
    totalTime: "6 min",
    servings: "2",
    ingredients: ["3 cloves garlic", "1 prawn", "Kangkung", "Chilli Blend", "Oyster Sauce"],
    steps: [
      "chop 3 of the garlic",
      "Put the garlic inside the pan",
      "wait until the garlic is cooked",
      "Put the kangkung inside the pan",
      "Add the blend chilli",
      "Add Oyster sauce",
      "Add Ajino moto",
      "Enjoy Your Meal❤️"
    ],
  },
];

let activeFilter = 'all';

function renderCards(list) {
  const grid = document.getElementById('recipeGrid');
  const noResults = document.getElementById('noResults');
  const countEl = document.getElementById('recipeCount');
  const existing = grid.querySelectorAll('.recipe-card');
  existing.forEach(c => c.remove());

  if (list.length === 0) {
    noResults.style.display = 'block';
    countEl.textContent = '0 recipes';
  } else {
    noResults.style.display = 'none';
    countEl.textContent = `${list.length} recipe${list.length !== 1 ? 's' : ''}`;
    list.forEach(r => {
      const diffClass = r.difficulty === 'easy' ? 'diff-easy' : r.difficulty === 'hard' ? 'diff-hard' : 'diff-medium';
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${r.image}" alt="${r.name}" loading="lazy">
          <span class="card-cuisine">${r.cuisine}</span>
          <span class="card-difficulty ${diffClass}">${r.difficulty.charAt(0).toUpperCase() + r.difficulty.slice(1)}</span>
        </div>
        <div class="card-body">
          <div class="card-title">${r.name}</div>
          <div class="card-desc">${r.description}</div>
          <div class="card-meta">
            <span class="meta-item"><span class="meta-icon">⏱</span> ${r.totalTime}</span>
            <span class="meta-item"><span class="meta-icon">🍽</span> Serves ${r.servings}</span>
            <span class="meta-item"><span class="meta-icon">📋</span> ${r.ingredients.length} ingredients</span>
          </div>
        </div>`;
      card.addEventListener('click', () => openModal(r));
      grid.appendChild(card);
    });
  }
}

function filterRecipes() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  let list = recipes;

  if (activeFilter !== 'all') {
    if (['easy', 'medium', 'hard'].includes(activeFilter)) {
      // Filter by difficulty
      list = list.filter(r => r.difficulty === activeFilter);
    } else if (activeFilter === 'Vegetarian') {
      // Filter by vegetarian category
      list = list.filter(r => r.category === 'Vegetarian');
    } else if (['Main', 'Dessert', 'Drink'].includes(activeFilter)) {
      // Filter by dish type
      list = list.filter(r => r.dish === activeFilter.toLowerCase());
    } else {
      // Filter by cuisine
      list = list.filter(r => r.cuisine === activeFilter);
    }
  }

  if (q) list = list.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.cuisine.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q)
  );

  renderCards(list);
}

function setFilter(filter, el) {
  document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activeFilter = filter;
  filterRecipes();
}

function openModal(r) {
  document.getElementById('mImg').src = r.image;
  document.getElementById('mImg').alt = r.name;
  document.getElementById('mTitle').textContent = r.name;
  document.getElementById('mCuisine').textContent = r.cuisine;
  const mainBadge = document.getElementById('mMain');
  mainBadge.textContent = r.dish ? r.dish.charAt(0).toUpperCase() + r.dish.slice(1) : '';
  mainBadge.className = 'modal-main-badge' + (r.dish ? ` dish-${r.dish}` : '');
  document.getElementById('mPrepTime').textContent = r.prepTime;
  document.getElementById('mCookTime').textContent = r.cookTime;
  document.getElementById('mServings').textContent = r.servings;

  const ingGrid = document.getElementById('mIngredients');
  ingGrid.innerHTML = r.ingredients.map(ing =>
    `<div class="ingredient-item"><span class="ingredient-dot"></span>${ing}</div>`
  ).join('');

  const stepsList = document.getElementById('mSteps');
  stepsList.innerHTML = r.steps.map((s, i) =>
    `<li class="step-item"><span class="step-num">${i + 1}</span><span>${s}</span></li>`
  ).join('');

  document.getElementById('mTips').innerHTML = r.tips || '';
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModalDirect();
}

function closeModalDirect() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModalDirect();
});

renderCards(recipes);