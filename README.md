# The Recipe Book

From the repository root, start the website with Node.js 18 or newer:

```powershell
node server.js
```

Or use the npm start script:

```powershell
npm start
```

Then open http://localhost:3000. Community recipes are stored in
`Recipe-website-main/recipes.json`. A static file host alone cannot accept
submissions; deploy the Node.js server with persistent writable storage to
enable recipe sharing online.
