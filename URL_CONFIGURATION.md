# FieldDB URL Configuration Analysis

## Overview

The FieldDB application uses a complex system to determine which server URLs to connect to for authentication, corpus data, and other services. This document explains how the system works and provides options for forcing localhost connections during development.

## How Connection URLs Work

### 1. FieldDB.Connection.defaultConnection()

The core of URL configuration is in `@/Users/gina/fielddbhome/FieldDB/api/corpus/Connection.js:700-874`.

**Priority Order for Determining Connection:**

1. **`process.env.NODE_ENV`** (Node.js environment)
2. **`localStorage.getItem("serverLabel")`** (Browser storage)
3. **`FieldDBObject.application.serverLabel`** (Application config)
4. **`Connection.otherwise`** (Fallback variable)
5. **Default: "beta"** (if nothing else is set)

### 2. Known Connections

Defined in `@/Users/gina/fielddbhome/FieldDB/api/corpus/Connection.js:619-690`:

```javascript
Connection.knownConnections = {
  localhost: {
    protocol: "https://",
    domain: "localhost",
    port: "6984",
    authUrls: ["https://localhost:3183"],
    corpusUrls: ["https://localhost:6984"],
    userFriendlyServerName: "Localhost"
  },
  beta: {
    domain: "corpusdev.example.org",
    authUrls: ["https://authdev.example.org"],
    corpusUrls: ["https://corpusdev.example.org"],
    userFriendlyServerName: "Example Beta"
  },
  production: {
    domain: "corpus.example.org",
    authUrls: ["https://auth.example.org"],
    corpusUrls: ["https://corpus.example.org"],
    userFriendlyServerName: "Example.org"
  }
}
```

### 3. URL Detection Logic

`Connection.defaultConnection()` also detects the environment from:
- **window.location.href** - Checks if URL contains "localhost", "lingsync.org", etc.
- **Chrome extension IDs** - Maps specific extension IDs to servers
- **CouchApp design document URLs** - Detects server from `_design/` paths

## How URLs Are Stored in User Data

### User's Connection Settings

User objects store connection information in multiple places:

1. **`userPrivate.corpora[]`** - Array of corpus connections the user has access to
   - Each corpus connection includes: `dbname`, `corpusUrl`, `authUrl`, etc.

2. **`userPrivate.mostRecentIds.connection`** - The most recently accessed corpus connection
   - Used to restore the user's last session

3. **`userPrivate.authUrl`** - The authentication server URL

### Corpus Connection Settings

Each corpus has its own connection object stored in:
- **`corpus.connection`** - Full connection details for that corpus
  - Includes: `dbname`, `protocol`, `domain`, `port`, `corpusUrls[]`, `authUrls[]`

### How Connections Are Merged

When a user logs in or loads a corpus:

1. User's stored connection is loaded from their private data
2. `FieldDB.Connection.defaultConnection()` is called to get the current environment's connection
3. The stored connection is **merged** with the default connection
4. Only the `dbname` is preserved from the stored connection
5. All URLs (auth, corpus, etc.) are **overwritten** with the default connection's URLs

**Code example from `@/Users/gina/fielddbhome/FieldDB/backbone_client/user/User.js:92-96`:**
```javascript
originalModel.mostRecentIds.connection = new FieldDB.Connection(originalModel.mostRecentIds.connection);
normalizedConnection = FieldDB.Connection.defaultConnection();
normalizedConnection.dbname = originalModel.mostRecentIds.connection.dbname;
originalModel.mostRecentIds.connection.merge("self", normalizedConnection, "overwrite");
```

## Current Localhost Overrides (test-login branch)

### 1. Connection.otherwise Setting

`@/Users/gina/fielddbhome/FieldDB/backbone_client/corpus_online_dashboard.js:112`:
```javascript
FieldDB.Connection.otherwise = window.location.hostname === 'localhost' ? 'localhost' : 'production';
```

`@/Users/gina/fielddbhome/FieldDB/backbone_client/user_online_dashboard.js:104`:
```javascript
FieldDB.Connection.otherwise = window.location.hostname === 'localhost' ? 'localhost' : 'production';
```

### 2. OPrime.getCouchUrl() Override

`@/Users/gina/fielddbhome/FieldDB/backbone_client/libs/OPrime.js:50-56`:
```javascript
// forcing production server
url = url.replace("corpusdev", "corpus");

// Forcing localhost
if (window.location.hostname === "localhost") {
  url = url.replace("corpus.lingsync.org", "localhost:6984");
}
```

### 3. RequireJS Configuration

`@/Users/gina/fielddbhome/FieldDB/backbone_client/corpus_online_dashboard.js:33`:
```javascript
"OPrime": "libs/webservicesconfig_devserver"
```

This loads the dev server config by default. There are multiple config files:
- `webservicesconfig_local.js` - Localhost URLs (ports 3182-3188)
- `webservicesconfig_devserver.js` - Dev server URLs
- `webservicesconfig_myaamia.js` - Custom deployment

## Problems with Current Approach

1. **User data contains production URLs** - When a user logs in, their stored corpus connections have production URLs embedded
2. **Merge overwrites stored URLs** - The merge process replaces URLs, but only if `Connection.otherwise` is set correctly
3. **Multiple override points** - Overrides are scattered across multiple files
4. **jQuery.couch.urlPrefix not configured** - The `$.couch` library uses its own `urlPrefix` which isn't being set
5. **localStorage.serverLabel may be stale** - If set to "production" from a previous session, it overrides `Connection.otherwise`

## Options to Force Localhost

### Option 1: Set localStorage.serverLabel (Recommended)

**Where:** Early in application initialization, before any connections are made

**Implementation:**
```javascript
// In corpus_online_dashboard.js and user_online_dashboard.js
if (window.location.hostname === 'localhost') {
  localStorage.setItem('serverLabel', 'localhost');
  localStorage.setItem('brand', 'localhost');
}
```

**Pros:**
- High priority in the decision chain
- Persists across page reloads
- Affects all connection decisions

**Cons:**
- Stored in browser, could persist if user switches to production

### Option 2: Configure jQuery.couch.urlPrefix

**Where:** After jQuery.couch is loaded

**Implementation:**
```javascript
// In corpus_online_dashboard.js after requirejs loads
if (window.location.hostname === 'localhost') {
  $.couch.urlPrefix = 'http://localhost:5984';
}
```

**Pros:**
- Directly controls CouchDB API calls
- Simple and targeted

**Cons:**
- Only affects $.couch calls, not FieldDB.Connection
- Requires coordination with other URL settings

### Option 3: Set Connection.otherwise Early (Current Approach)

**Where:** In dashboard initialization files

**Current implementation:**
```javascript
FieldDB.Connection.otherwise = window.location.hostname === 'localhost' ? 'localhost' : 'production';
```

**Pros:**
- Already implemented in test-login branch
- Works for most cases

**Cons:**
- Lower priority than localStorage
- Doesn't affect $.couch directly

### Option 4: Comprehensive Initialization Function (Best Practice)

**Where:** New initialization module loaded first

**Implementation:**
```javascript
// Create: backbone_client/libs/localhost_init.js
(function() {
  if (window.location.hostname === 'localhost') {
    // Set localStorage
    localStorage.setItem('serverLabel', 'localhost');
    localStorage.setItem('brand', 'localhost');
    
    // Set Connection.otherwise (when FieldDB loads)
    if (typeof FieldDB !== 'undefined' && FieldDB.Connection) {
      FieldDB.Connection.otherwise = 'localhost';
    }
    
    // Set jQuery.couch when it loads
    if (typeof $ !== 'undefined' && $.couch) {
      $.couch.urlPrefix = 'http://localhost:5984';
    }
  }
})();
```

Load this in RequireJS config or as early script in HTML.

**Pros:**
- Centralized configuration
- Handles all override points
- Easy to maintain

**Cons:**
- Requires adding a new file
- Need to ensure it loads at the right time

### Option 5: Use webservicesconfig_local.js

**Where:** RequireJS configuration

**Implementation:**
```javascript
// In corpus_online_dashboard.js
require.config({
  paths: {
    "OPrime": window.location.hostname === 'localhost' 
      ? "libs/webservicesconfig_local" 
      : "libs/webservicesconfig_devserver"
  }
});
```

**Pros:**
- Uses existing configuration system
- Defines all service URLs in one place

**Cons:**
- Only affects OPrime.authUrl, OPrime.corpusUrl, etc.
- Doesn't affect FieldDB.Connection directly
- webservicesconfig_local.js uses different ports than Docker setup

## Recommended Solution: Option 5 with Consolidated Configuration

**Use `webservicesconfig_local.js` as the single source of truth for localhost configuration.**

This approach consolidates all localhost overrides (Options 1, 2, 3, and test-login branch changes) into a single configuration file that is conditionally loaded based on hostname.

### Implementation

1. **Update `webservicesconfig_local.js`** to include:
   - Service URLs (authUrl, corpusUrl, etc.) matching Docker ports
   - localStorage configuration (Option 1)
   - jQuery.couch.urlPrefix configuration (Option 2)
   - FieldDB.Connection.otherwise fallback (Option 3)
   - OPrime.getCouchUrl() override from test-login branch

2. **Update RequireJS configuration** in dashboard files to conditionally load:
   ```javascript
   "OPrime": window.location.hostname === 'localhost' 
     ? "libs/webservicesconfig_local" 
     : "libs/webservicesconfig_devserver"
   ```

3. **Remove duplicate overrides** from dashboard initialization code

### Benefits

- **Single source of truth**: All localhost configuration in one file
- **No code duplication**: Overrides defined once, not scattered across files
- **Easy to maintain**: Update one file to change localhost behavior
- **Follows existing patterns**: Uses the webservicesconfig system already in place
- **Defense in depth**: Multiple override mechanisms ensure localhost is used

### Files Modified

- `@/Users/gina/fielddbhome/FieldDB/backbone_client/libs/webservicesconfig_local.js` - Consolidated configuration
- `@/Users/gina/fielddbhome/FieldDB/backbone_client/corpus_online_dashboard.js` - Conditional loading
- `@/Users/gina/fielddbhome/FieldDB/backbone_client/user_online_dashboard.js` - Conditional loading

## Implementation Checklist

- [x] Update `webservicesconfig_local.js` with Options 1, 2, 3
- [x] Move `OPrime.getCouchUrl()` override to `webservicesconfig_local.js`
- [x] Update `corpusUrl` to use Docker port 6984
- [x] Add conditional RequireJS loading in `corpus_online_dashboard.js`
- [x] Add conditional RequireJS loading in `user_online_dashboard.js`
- [x] Remove duplicate `Connection.otherwise` from dashboard files
- [ ] Build and deploy to test
- [ ] Run UI tests to verify all connections use localhost
