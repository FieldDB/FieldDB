# FieldDB Development Guide

## Project Overview

FieldDB is an offline/online field database application with multiple client implementations:
- **backbone_client/** - Main Backbone.js web application (prototype)
- **angular_client/** - Angular.js client (deprecated)
- **react_client/** - React client
- **api/** - Core FieldDB JavaScript API (CommonJS module)

## Architecture

```
FieldDB/
├── api/                    # Core FieldDB API (fielddb.js)
├── backbone_client/        # Backbone.js web app source
│   ├── corpus.html         # Main corpus dashboard
│   ├── user.html           # User dashboard
│   ├── corpus_online_dashboard.js  # Entry point for corpus
│   ├── user_online_dashboard.js    # Entry point for user
│   └── bower_components/   # Client dependencies (including fielddb.js)
├── couchapp_prototype/     # CouchApp for deployment to CouchDB
│   ├── _attachments/       # Built assets (generated)
│   ├── .couchapprc         # CouchApp config
│   └── couchapp.json       # CouchApp metadata
├── scripts/                # Build and deployment scripts
└── test-e2e/               # Playwright E2E tests
```

## Build Process

### 1. Build the Core API

```bash
cd FieldDB
npm install
npm run build
```

This creates `fielddb.js` in the root directory using browserify.

### 2. Build the Backbone Client (Full Build)

```bash
cd FieldDB
bash scripts/build_fielddb_minified.sh
```

This script:
1. Runs `npm run build` to create `fielddb.js`
2. Installs backbone_client dependencies (`npm install`, `bower install`)
3. Compiles Handlebars templates
4. Copies `fielddb.js` to `backbone_client/bower_components/fielddb/`
5. Uses RequireJS to build optimized bundles:
   - `corpus_online_dashboard.js` → `release/corpus_online_dashboard.js`
   - `user_online_dashboard.js` → `release/user_online_dashboard.js`
6. Copies all assets to `couchapp_prototype/_attachments/`

### 3. Alternative: Quick Build with Grunt

```bash
cd FieldDB
npm install -g grunt-cli  # if not installed
npm install
grunt chromeapp           # builds and copies to couchapp_prototype
```

## Deploying to CouchDB (CouchApp)

### Prerequisites

Install CMSCouchapp (Python 3 compatible couchapp):

```bash
cd FieldDB/couchapp_prototype
python3 -m venv myenv
source myenv/bin/activate
pip install CMSCouchapp
```

### Deploy to Local CouchDB

```bash
# Activate virtual environment
cd FieldDB/couchapp_prototype
source myenv/bin/activate

# Deploy to prototypedev database
CMSCouchapp push -p $(pwd) -c https://admin:none@localhost:6984/prototypedev
```

### Deploy to Docker CouchDB

When using the AuthenticationWebService Docker setup:

```bash
# Ensure Docker containers are running
cd AuthenticationWebService
docker compose up -d

# Build FieldDB
cd ../FieldDB
bash scripts/build_fielddb_minified.sh

# Deploy to CouchDB in Docker
cd couchapp_prototype
source myenv/bin/activate
CMSCouchapp push -p $(pwd) -c https://admin:none@localhost:6984/prototypedev
```

**Note**: Use `https://localhost:6984` (HTTPS port) for CouchDB access.

## Running UI Tests

### Prerequisites

1. Docker services running (AuthenticationWebService)
2. CouchApp deployed to `prototypedev` database
3. Playwright installed

### Run Tests

```bash
cd FieldDB/test-e2e
npm install
npx playwright install chromium  # first time only

# Run against local Docker CouchDB
BASE_URL=https://localhost:6984 BASE_PATH=/prototypedev/_design/prototype npm test
```

### Test Structure

```
test-e2e/test/
├── corpus/
│   └── import-existing.spec.js  # Import data tests
├── login/
│   ├── lingllama.spec.js        # Sample user login
│   ├── public.spec.js           # Public user login
│   └── user.spec.js             # Regular user login
└── register/
    └── fielddb.spec.js          # User registration
```

## Development Workflow

### Making Changes to the Frontend

1. **Edit source files** in `backbone_client/`
   - JavaScript: `corpus_online_dashboard.js`, `libs/OPrime.js`, etc.
   - HTML: `corpus.html`, `user.html`
   - CSS: `app/*.css`

2. **Rebuild the app**:
   ```bash
   cd FieldDB
   bash scripts/build_fielddb_minified.sh
   ```

3. **Deploy to CouchDB**:
   ```bash
   cd couchapp_prototype
   source myenv/bin/activate
   CMSCouchapp push -p $(pwd) -c https://admin:none@localhost:6984/prototypedev
   ```

4. **Run UI tests**:
   ```bash
   cd test-e2e
   BASE_URL=https://localhost:6984 BASE_PATH=/prototypedev/_design/prototype npm test
   ```

### Making Changes to the Core API

1. **Edit source files** in `api/`

2. **Rebuild**:
   ```bash
   npm run build
   ```

3. **Copy to backbone_client** (if testing in browser):
   ```bash
   cp fielddb.js backbone_client/bower_components/fielddb/fielddb.js
   ```

## Key Files for Localhost Testing

The `test-login` branch contains changes to force localhost connections:

### `backbone_client/corpus_online_dashboard.js`
```javascript
FieldDB.Connection.otherwise = window.location.hostname === 'localhost' ? 'localhost' : 'production';
```

### `backbone_client/libs/OPrime.js`
```javascript
// Forcing localhost
if (window.location.hostname === "localhost") {
  url = url.replace("corpus.lingsync.org", "localhost:6984");
}
```

These changes ensure the app connects to the local Docker CouchDB instead of production servers.

## Database Structure

The CouchApp is deployed to a database (e.g., `prototypedev`) with this structure:

```
prototypedev/
├── _design/prototype/        # CouchApp design document
│   ├── _attachments/         # Static files
│   │   ├── corpus.html       # Main app entry
│   │   ├── user.html         # User dashboard
│   │   ├── corpus_online_dashboard.js
│   │   ├── user_online_dashboard.js
│   │   └── bower_components/fielddb/fielddb.js
│   └── views/                # CouchDB views (if any)
```

Access the app at: `https://localhost:6984/prototypedev/_design/prototype/corpus.html`

## Troubleshooting

### CouchApp push fails

1. Ensure CouchDB is running and accessible
2. Check credentials: `admin:none` for local Docker
3. Verify database exists: `curl -k https://admin:none@localhost:6984/prototypedev`

### UI tests fail with "element not found"

1. Verify CouchApp is deployed: visit `https://localhost:6984/prototypedev/_design/prototype/corpus.html`
2. Check browser console for JavaScript errors
3. Ensure localhost connection overrides are in place (test-login branch)

### Build fails

1. Check Node.js version (>4.2.2 required)
2. Run `npm install` in both `FieldDB/` and `FieldDB/backbone_client/`
3. Run `bower install` in `backbone_client/`

## Quick Reference

| Task | Command |
|------|---------|
| Build API | `npm run build` |
| Build full app | `bash scripts/build_fielddb_minified.sh` |
| Deploy CouchApp | `CMSCouchapp push -p $(pwd) -c URL/prototypedev` |
| Run UI tests | `BASE_URL=https://localhost:6984 BASE_PATH=/prototypedev/_design/prototype npm test` |
| Start dev server | `cd backbone_client && npm start` |
