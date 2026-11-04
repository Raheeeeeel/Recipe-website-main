# The Recipe Book

From the repository root, start the website with Node.js 18 or newer:

```powershell
node server.js
```

Or use the npm start script:

```powershell
npm start
```

Then open the URL printed in the terminal. The server uses port 3000 by
default and automatically tries the next port if 3000 is already in use. To
choose a port explicitly in PowerShell, run `$env:PORT=3001; npm start`.
Community recipes are stored in `Recipe-website-main/recipes.json`. A static
file host alone cannot accept submissions; deploy the Node.js server with
persistent writable storage to enable recipe sharing online.
