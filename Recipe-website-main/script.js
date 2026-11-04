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
    ingredients: ["1/3 small onion", "2 garlic cloves", "mince chicken", "mushrooms", "Pasta", "sauce"],
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
    ]
  },
  {
    id: 2,
    name: "kangkung goreng Belacan",
    cuisine: "Vegetable",
    dish: "Main",
    category: "Vegetable",
    difficulty: "easy",
    description: "Delicious kangkung belacan",
    image: "Kangkung Goreng belacan.jpg",
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
    ]
  }
];

let activeFilter = "all";

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function renderCards(list) {
  const grid = document.getElementById("recipeGrid");
  const noResults = document.getElementById("noResults");
  const countEl = document.getElementById("recipeCount");
  grid.querySelectorAll(".recipe-card").forEach(card => card.remove());
  noResults.style.display = list.length ? "none" : "block";
  countEl.textContent = `${list.length} recipe${list.length === 1 ? "" : "s"}`;

  list.forEach(recipe => {
    const card = document.createElement("article");
    card.className = "recipe-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View ${recipe.name}`);

    const imageWrap = document.createElement("div");
    imageWrap.className = "card-img-wrap";
    imageWrap.appendChild(createTextElement("span", "card-image-placeholder", "✦"));
    if (recipe.image) {
      const image = document.createElement("img");
      image.src = recipe.image;
      image.alt = recipe.name;
      image.loading = "lazy";
      imageWrap.appendChild(image);
    }
    imageWrap.appendChild(createTextElement("span", "card-cuisine", recipe.cuisine));
    const difficulty = createTextElement(
      "span",
      `card-difficulty diff-${recipe.difficulty}`,
      recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)
    );
    imageWrap.appendChild(difficulty);

    const body = document.createElement("div");
    body.className = "card-body";
    body.appendChild(createTextElement("h3", "card-title", recipe.name));
    body.appendChild(createTextElement("p", "card-desc", recipe.description));
    if (recipe.contributor) {
      body.appendChild(createTextElement("p", "card-author", `Shared by ${recipe.contributor}`));
    }

    const meta = document.createElement("div");
    meta.className = "card-meta";
    const time = recipe.totalTime || [recipe.prepTime, recipe.cookTime].filter(Boolean).join(" + ") || "Time varies";
    [
      ["⏱", time],
      ["🍽", `Serves ${recipe.servings}`],
      ["📋", `${recipe.ingredients.length} ingredients`]
    ].forEach(([icon, text]) => {
      const item = document.createElement("span");
      item.className = "meta-item";
      item.appendChild(createTextElement("span", "meta-icon", icon));
      item.appendChild(document.createTextNode(text));
      meta.appendChild(item);
    });
    body.appendChild(meta);

    card.append(imageWrap, body);
    card.addEventListener("click", () => openModal(recipe));
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(recipe);
      }
    });
    grid.appendChild(card);
  });
}

function filterRecipes() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  let list = recipes;

  if (activeFilter !== "all") {
    if (["easy", "medium", "hard"].includes(activeFilter)) {
      list = list.filter(recipe => recipe.difficulty === activeFilter);
    } else if (activeFilter === "Vegetable") {
      list = list.filter(recipe => recipe.category === "Vegetable" || recipe.cuisine === "Vegetable");
    } else if (["Main", "Dessert", "Drink"].includes(activeFilter)) {
      list = list.filter(recipe => recipe.dish.toLowerCase() === activeFilter.toLowerCase());
    } else {
      list = list.filter(recipe => recipe.cuisine.toLowerCase() === activeFilter.toLowerCase());
    }
  }

  if (query) {
    list = list.filter(recipe =>
      [recipe.name, recipe.cuisine, recipe.description, recipe.contributor || ""]
        .some(value => value.toLowerCase().includes(query))
    );
  }
  renderCards(list);
}

function setFilter(filter, element) {
  document.querySelectorAll(".tag").forEach(tag => tag.classList.remove("active"));
  element.classList.add("active");
  activeFilter = filter;
  filterRecipes();
}

function openModal(recipe) {
  const image = document.getElementById("mImg");
  image.alt = recipe.name;
  image.hidden = !recipe.image;
  if (recipe.image) image.src = recipe.image;

  document.getElementById("mTitle").textContent = recipe.name;
  document.getElementById("mCuisine").textContent = recipe.cuisine;
  const mainBadge = document.getElementById("mMain");
  mainBadge.textContent = recipe.dish || "";
  mainBadge.className = `modal-main-badge${recipe.dish ? ` dish-${recipe.dish.toLowerCase()}` : ""}`;
  document.getElementById("mPrepTime").textContent = recipe.prepTime;
  document.getElementById("mCookTime").textContent = recipe.cookTime;
  document.getElementById("mServings").textContent = recipe.servings;

  const ingredients = document.getElementById("mIngredients");
  ingredients.replaceChildren(...recipe.ingredients.map(ingredient => {
    const item = document.createElement("div");
    item.className = "ingredient-item";
    item.append(createTextElement("span", "ingredient-dot", ""), document.createTextNode(ingredient));
    return item;
  }));

  const steps = document.getElementById("mSteps");
  steps.replaceChildren(...recipe.steps.map((step, index) => {
    const item = document.createElement("li");
    item.className = "step-item";
    item.append(createTextElement("span", "step-num", String(index + 1)), document.createTextNode(step));
    return item;
  }));

  const tips = document.getElementById("mTips");
  tips.textContent = recipe.tips || "";
  tips.hidden = !recipe.tips;
  document.getElementById("modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal(event) {
  if (event.target === document.getElementById("modalOverlay")) closeModalDirect();
}

function closeModalDirect() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

function openAddRecipe() {
  document.getElementById("addRecipeOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
  document.querySelector("#addRecipeForm [name=name]").focus();
}

function closeAddRecipe(event) {
  if (event.target === document.getElementById("addRecipeOverlay")) closeAddRecipeDirect();
}

function closeAddRecipeDirect() {
  document.getElementById("addRecipeOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

function showApiStatus(message, isError = false) {
  const status = document.getElementById("apiStatus");
  status.textContent = message;
  status.classList.toggle("status-error", isError);
}

async function readJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();
  if (!contentType.toLowerCase().includes("application/json")) {
    if (/<(?:!doctype|html)\b/i.test(body)) {
      throw new Error("The recipe API returned an HTML page instead of JSON. Start the website with `npm start` and open http://localhost:3000, or deploy server.js with a Node.js host.");
    }
    throw new Error("The recipe API returned an unexpected response instead of JSON.");
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new Error("The recipe API returned invalid JSON.");
  }
}

async function loadCommunityRecipes() {
  try {
    const response = await fetch("/api/recipes");
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const sharedRecipes = await readJsonResponse(response);
    if (!Array.isArray(sharedRecipes)) throw new Error("Recipe data is invalid");
    recipes.push(...sharedRecipes);
    filterRecipes();
    showApiStatus(`${sharedRecipes.length} community recipe${sharedRecipes.length === 1 ? "" : "s"} shared so far`);
  } catch (error) {
    showApiStatus("Community recipes need the website server to be running. Existing recipes are still available.", true);
    console.error("Could not load community recipes:", error);
  }
}

document.getElementById("addRecipeForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const fields = new FormData(form);
  const lines = name => String(fields.get(name)).split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const recipe = {
    name: String(fields.get("name")).trim(),
    cuisine: String(fields.get("cuisine")).trim(),
    dish: String(fields.get("dish")),
    difficulty: String(fields.get("difficulty")),
    description: String(fields.get("description")).trim(),
    image: String(fields.get("image")).trim(),
    prepTime: String(fields.get("prepTime")).trim(),
    cookTime: String(fields.get("cookTime")).trim(),
    servings: String(fields.get("servings")).trim(),
    contributor: String(fields.get("contributor")).trim(),
    ingredients: lines("ingredients"),
    steps: lines("steps")
  };
  const message = document.getElementById("formMessage");
  const submitButton = form.querySelector(".submit-recipe");
  message.textContent = "";
  submitButton.disabled = true;
  submitButton.textContent = "Adding your recipe…";

  try {
    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipe)
    });
    const result = await readJsonResponse(response);
    if (!response.ok) throw new Error(result.error || `Server returned ${response.status}`);

    recipes.push(result);
    filterRecipes();
    form.reset();
    closeAddRecipeDirect();
    showApiStatus("Your recipe is now part of the community cookbook. Thank you for sharing!");
  } catch (error) {
    message.textContent = `${error.message}. Please try again.`;
    console.error("Could not add recipe:", error);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Add to the cookbook <span>→</span>';
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModalDirect();
    closeAddRecipeDirect();
  }
});

renderCards(recipes);
loadCommunityRecipes();
