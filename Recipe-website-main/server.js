const http = require("node:http");
const { randomUUID } = require("node:crypto");
const { readFile, rename, writeFile } = require("node:fs/promises");
const path = require("node:path");

const port = Number(process.env.PORT || 3000);
const allowPortFallback = !process.env.PORT;
const root = __dirname;
const recipesPath = path.join(root, "recipes.json");
const allowedFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/style.css", ["style.css", "text/css; charset=utf-8"]],
  ["/script.js", ["script.js", "text/javascript; charset=utf-8"]],
  ["/spaghetti chicken carbonara.jpg", ["spaghetti chicken carbonara.jpg", "image/jpeg"]],
  ["/Kangkung Goreng belacan.jpg", ["Kangkung Goreng belacan.jpg", "image/jpeg"]],
  ["/ribena drink.png", ["ribena drink.png", "image/png"]]
]);
const submissions = new Map();
let writeQueue = Promise.resolve();

class ValidationError extends Error {}

function listen(server, port, host, allowFallback) {
  return new Promise((resolve, reject) => {
    let currentPort = port;

    const tryListen = () => {
      const onListening = () => {
        server.removeListener("error", onError);
        resolve(currentPort);
      };
      const onError = error => {
        server.removeListener("listening", onListening);
        server.removeListener("error", onError);
        if (allowFallback && error.code === "EADDRINUSE" && currentPort < 65535) {
          currentPort += 1;
          tryListen();
          return;
        }
        reject(error);
      };

      server.once("listening", onListening);
      server.once("error", onError);
      server.listen(currentPort, host);
    };

    tryListen();
  });
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(value));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let tooLarge = false;
    request.setEncoding("utf8");
    request.on("data", chunk => {
      if (tooLarge) return;
      body += chunk;
      if (Buffer.byteLength(body) > 64 * 1024) {
        tooLarge = true;
        reject(Object.assign(new Error("Request body is too large"), { statusCode: 413 }));
        request.resume();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function text(value, field, maxLength, required = true) {
  if (typeof value !== "string") throw new ValidationError(`${field} must be text`);
  const result = value.trim();
  if (required && !result) throw new ValidationError(`${field} is required`);
  if (result.length > maxLength) throw new ValidationError(`${field} is too long`);
  return result;
}

function validateRecipe(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ValidationError("Recipe must be a JSON object");
  }
  const dish = text(input.dish, "Dish type", 20);
  if (!["Main", "Dessert", "Drink", "Side", "Snack"].includes(dish)) {
    throw new ValidationError("Choose a valid dish type");
  }
  const difficulty = text(input.difficulty, "Difficulty", 10);
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    throw new ValidationError("Choose a valid difficulty");
  }
  if (!Array.isArray(input.ingredients) || input.ingredients.length < 1 || input.ingredients.length > 60) {
    throw new ValidationError("Add between 1 and 60 ingredients");
  }
  if (!Array.isArray(input.steps) || input.steps.length < 1 || input.steps.length > 60) {
    throw new ValidationError("Add between 1 and 60 instruction steps");
  }
  const image = text(input.image ?? "", "Photo URL", 500, false);
  if (image) {
    let imageUrl;
    try {
      imageUrl = new URL(image);
    } catch {
      throw new ValidationError("Photo URL must be a valid web URL");
    }
    if (!["http:", "https:"].includes(imageUrl.protocol)) {
      throw new ValidationError("Photo URL must use HTTP or HTTPS");
    }
  }

  return {
    id: randomUUID(),
    name: text(input.name, "Recipe name", 80),
    cuisine: text(input.cuisine, "Cuisine or category", 50),
    dish,
    difficulty,
    description: text(input.description, "Description", 300),
    image,
    prepTime: text(input.prepTime, "Prep time", 30),
    cookTime: text(input.cookTime, "Cook time", 30),
    totalTime: "",
    servings: text(input.servings, "Servings", 20),
    contributor: text(input.contributor ?? "", "Your name", 50, false),
    ingredients: input.ingredients.map((item, index) => text(item, `Ingredient ${index + 1}`, 200)),
    steps: input.steps.map((item, index) => text(item, `Step ${index + 1}`, 500)),
    createdAt: new Date().toISOString()
  };
}

async function getRecipes() {
  const data = await readFile(recipesPath, "utf8");
  if (!data.trim()) return [];
  let recipes;
  try {
    recipes = JSON.parse(data);
  } catch (error) {
    throw new Error("recipes.json contains invalid JSON", { cause: error });
  }
  if (!Array.isArray(recipes)) throw new Error("recipes.json must contain a JSON array");
  return recipes;
}

async function appendRecipe(recipe) {
  const operation = writeQueue.then(async () => {
    const recipes = await getRecipes();
    recipes.push(recipe);
    const temporaryPath = `${recipesPath}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(recipes, null, 2)}\n`, "utf8");
    await rename(temporaryPath, recipesPath);
    return recipe;
  });
  writeQueue = operation.then(
    () => undefined,
    error => {
      console.error("Could not save recipe:", error);
    }
  );
  return operation;
}

function checkSubmissionLimit(request) {
  const now = Date.now();
  const address = request.socket.remoteAddress || "unknown";
  const recent = (submissions.get(address) || []).filter(timestamp => now - timestamp < 10 * 60 * 1000);
  if (recent.length >= 10) return false;
  recent.push(now);
  submissions.set(address, recent);
  return true;
}

async function handleRequest(request, response) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    sendJson(response, 400, { error: "Invalid URL" });
    return;
  }

  if (pathname === "/api/recipes" && request.method === "GET") {
    try {
      sendJson(response, 200, await getRecipes());
    } catch (error) {
      console.error("Could not read recipes.json:", error);
      sendJson(response, 500, { error: "Could not load community recipes" });
    }
    return;
  }

  if (pathname === "/api/recipes" && request.method === "POST") {
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers["content-type"] || "")) {
      sendJson(response, 415, { error: "Send recipe data as JSON" });
      return;
    }
    if (!checkSubmissionLimit(request)) {
      sendJson(response, 429, { error: "Too many submissions. Please try again in a few minutes." });
      return;
    }
    try {
      const input = JSON.parse(await readRequestBody(request));
      const recipe = validateRecipe(input);
      sendJson(response, 201, await appendRecipe(recipe));
    } catch (error) {
      if (error.statusCode) {
        sendJson(response, error.statusCode, { error: error.message });
      } else if (error instanceof SyntaxError || error instanceof ValidationError) {
        sendJson(response, 400, { error: error.message });
      } else {
        console.error("Could not add recipe:", error);
        sendJson(response, 500, { error: "Could not save your recipe" });
      }
    }
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const file = allowedFiles.get(pathname);
  if (!file) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }
  try {
    const contents = await readFile(path.join(root, file[0]));
    response.writeHead(200, {
      "Content-Type": file[1],
      "Content-Length": contents.length,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(request.method === "HEAD" ? undefined : contents);
  } catch (error) {
    console.error(`Could not serve ${file[0]}:`, error);
    sendJson(response, 500, { error: "Could not load this page" });
  }
}

async function start() {
  try {
    const data = await readFile(recipesPath, "utf8");
    if (!data.trim()) await writeFile(recipesPath, "[]\n", "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeFile(recipesPath, "[]\n", { encoding: "utf8", flag: "wx" });
  }

  const server = http.createServer((request, response) => {
    handleRequest(request, response).catch(error => {
      console.error("Request failed:", error);
      if (!response.headersSent) sendJson(response, 500, { error: "Unexpected server error" });
      else response.destroy();
    });
  });
  const listeningPort = await listen(server, port, process.env.HOST || "0.0.0.0", allowPortFallback);
  if (listeningPort !== port) {
    console.warn(`Port ${port} is already in use; using port ${listeningPort} instead.`);
  }
  console.log(`Recipe Book is running at http://localhost:${listeningPort}`);
}

start().catch(error => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the other server or set a different port, for example: $env:PORT=3001; node server.js`);
  } else {
    console.error("Could not start Recipe Book:", error);
  }
  process.exitCode = 1;
});
