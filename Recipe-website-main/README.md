# The Recipe Book

Run the site with Node.js 18 or newer:

```powershell
npm start
```

Then open http://localhost:3000. The first run creates `recipes.json` if it is
missing. New community recipes are added to that file and appear for everyone
using this server.

To let people on the internet contribute, deploy the Node server on a host that
supports a long-running Node.js app and persistent writable storage. A static
file host alone cannot accept submissions or save the shared JSON file.
