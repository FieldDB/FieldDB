# FieldDB Agent Guidelines

## Core Principles

### DO NOT Modify Vendor/Library Code

**NEVER modify files in these directories:**
- `backbone_client/libs/` - Third-party libraries (jQuery.couch, Backbone, etc.)
- `backbone_client/bower_components/` - Bower dependencies
- `node_modules/` - NPM dependencies
- Any vendored or third-party code

**Why?**
- Changes will be lost on dependency updates
- Makes debugging and maintenance extremely difficult
- Violates separation of concerns
- Creates technical debt

### Proper Approaches Instead

1. **Configuration Over Modification**
   - Use environment variables
   - Use configuration files
   - Use build-time settings

2. **Wrapper/Adapter Pattern**
   - Create wrapper functions in application code
   - Extend or adapt third-party APIs in your own modules
   - Keep customizations in application-specific files

3. **Fork and Maintain Properly**
   - If you absolutely must modify a library, fork it properly
   - Maintain it as a separate package
   - Document all changes
   - Keep it version controlled separately

## FieldDB-Specific Guidelines

### Localhost Development

For localhost development, **all configuration is centralized in `webservicesconfig_local.js`**:

1. **Configuration file**: `backbone_client/libs/webservicesconfig_local.js`
   - Contains all service URLs (auth, corpus, audio, etc.)
   - Sets `localStorage.serverLabel = 'localhost'` (highest priority)
   - Configures `$.couch.urlPrefix = 'http://localhost:5984'`
   - Sets `FieldDB.Connection.otherwise = 'localhost'` (fallback)
   - Overrides `OPrime.getCouchUrl()` to force localhost URLs

2. **Conditional loading**: Dashboard files automatically load the correct config:
   ```javascript
   // In corpus_online_dashboard.js and user_online_dashboard.js
   "OPrime": window.location.hostname === 'localhost' 
     ? "libs/webservicesconfig_local" 
     : "libs/webservicesconfig_devserver"
   ```

3. **DO NOT add localhost overrides elsewhere** - All configuration should be in `webservicesconfig_local.js`

### CouchApp Deployment

Use the deployment script `scripts/deploy_couchapp.sh` instead of manual deployment:

```bash
# Deploy to localhost
./scripts/deploy_couchapp.sh localhost

# Deploy to production
./scripts/deploy_couchapp.sh production
```

### Testing

- UI tests run against `https://localhost:6984/prototypedev/_design/prototype`
- Ensure AuthenticationWebService Docker is running: `cd AuthenticationWebService && npm run test:docker`
- Run tests: `cd test-e2e && BASE_URL=https://localhost:6984 BASE_PATH=/prototypedev/_design/prototype npm test`

## Build Process

1. **Build the core API**: `npm run build` (runs browserify)
2. **Build the minified client**: `bash scripts/build_fielddb_minified.sh`
3. **Deploy CouchApp**: `bash scripts/deploy_couchapp.sh localhost`
4. **Run tests**: See Testing section above

## Common Pitfalls to Avoid

- ❌ Editing `jquery.couch.js` to change URLs
- ❌ Modifying Backbone.js or other framework code
- ❌ Hardcoding URLs in library files
- ✅ Use application-level configuration
- ✅ Use wrapper functions in your own code
- ✅ Follow existing patterns in the codebase
