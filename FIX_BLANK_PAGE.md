# How to Fix Blank Page Error - Step by Step

## Immediate Steps to Fix

### Step 1: Clear Everything and Restart
```bash
# Navigate to project directory
cd "C:\Users\ADMIN\OneDrive\Desktop\AI-Resume-Ranker"

# Kill the dev server (Ctrl+C in terminal if running)

# Clear all caches
npm cache clean --force

# Remove node_modules
rmdir /s /q node_modules

# Remove dist folder
rmdir /s /q dist

# Reinstall dependencies
npm install

# Start dev server
npm run dev
```

Then visit: **http://localhost:3000**

### Step 2: Check Browser Console (Most Important!)
1. Open your browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab (not Network, not Application - just Console)
4. Look for **RED ERROR MESSAGES**
5. **Copy and paste the error message here** for diagnosis

### Step 3: If You See an Error, Check What It Says

#### Error Type A: "Cannot find module"
- Missing a file or wrong import path
- Solution: Run `npm install` again
- Make sure file extensions include `.ts` or `.tsx`

#### Error Type B: "Cannot read property 'X' of undefined"
- A component tried to access something that doesn't exist
- Solution: Look at the file path in the error and check that file

#### Error Type C: "Unexpected token"
- Syntax error in code
- Solution: Look at the line number mentioned in error
- Check for missing commas, brackets, or quotes

### Step 4: Hard Refresh Browser
Sometimes it's just cache:
- **Windows/Linux**: Ctrl + Shift + R
- **Mac**: Cmd + Shift + R

### Step 5: Check if Files Are All There
```bash
# List all main files (should all be there)
dir
```

You should see:
- ✅ `App.tsx`
- ✅ `index.html`
- ✅ `index.tsx`
- ✅ `index.css`
- ✅ `components` (folder)
- ✅ `services` (folder)
- ✅ `utils` (folder)
- ✅ `config.ts`

### Step 6: Verify Build Works
```bash
npm run build
```

You should see something like:
```
✓ 2746 modules transformed.
✓ built in X seconds
```

If you see ❌ errors, there's a code issue. **Share those errors.**

## What To Do If Still Blank

### Option A: Check Network Tab
1. Press **F12**
2. Go to **Network** tab
3. **Reload** the page (F5)
4. Look for any RED entries (failed requests)
5. Check if `index-*.js` file loaded (it's quite large, ~900KB)

### Option B: Try Different Port
```bash
# Stop the current server (Ctrl+C)
# Try a different port
npm run dev -- --port 3001
```

Then visit: **http://localhost:3001**

### Option C: Check for Syntax Errors
```bash
# Run TypeScript compiler
npx tsc --noEmit
```

This will show any syntax errors in the code.

### Option D: Run Linter
```bash
npm run lint
```

This will show any code quality issues.

## What Information To Provide

When reporting the blank page issue, please provide:

1. **Browser Console Errors** (screenshot or copy-paste)
2. **Output from**: `npm run build`
3. **Output from**: `npx tsc --noEmit`
4. **Which URL you're visiting**: 
   - http://localhost:3000/
   - http://localhost:3000/#/login
   - etc.
5. **Browser**: Chrome, Firefox, Safari, Edge?
6. **Operating System**: Windows, Mac, Linux?

## Quick Diagnostic Command

Run this and share the output:

```bash
cd "C:\Users\ADMIN\OneDrive\Desktop\AI-Resume-Ranker"
echo "=== Checking Node ===" && node --version
echo "=== Checking NPM ===" && npm --version
echo "=== Running Build ===" && npm run build
echo "=== Checking TypeScript ===" && npx tsc --noEmit
echo "=== Done ==="
```

## Application Layout

The app shows different pages depending on URL:

- **http://localhost:3000/** → Shows ModernDashboard (colorful landing page)
- **http://localhost:3000/#/login** → Shows Login page (login form)
- **http://localhost:3000/#/gateway** → Shows HR Dashboard (need to login first)
- **http://localhost:3000/#/lab** → Shows Candidate view (need to login first)

## Expected First Load Behavior

1. Browser requests http://localhost:3000/
2. Server returns `index.html`
3. HTML loads `index.tsx` as JavaScript module
4. `index.tsx` mounts React app to `<div id="root">`
5. React renders `<App />` component (with ErrorBoundary)
6. `<App />` renders `<Router>` component
7. Router shows `<ModernDashboard />` for `/` route
8. Page should show: **TopRes AI** title with logo and content

## Error Boundary

If an error occurs in any component, you'll see:
- **Red error box** with error message
- Button to "Return to Home"
- Button to "Reload Page"

This is the **ErrorBoundary** catching the error to prevent complete blank page.

## If Nothing Works

1. Make sure you're in the right directory:
   ```
   C:\Users\ADMIN\OneDrive\Desktop\AI-Resume-Ranker
   ```
   (NOT the old long-named directory)

2. Delete everything and start fresh:
   ```bash
   cd C:\Users\ADMIN\OneDrive\Desktop
   rmdir /s /q AI-Resume-Ranker
   git clone https://github.com/dharsan432006-ops/TOP-RES-AI.git AI-Resume-Ranker
   cd AI-Resume-Ranker
   npm install
   npm run dev
   ```

3. If still nothing, provide the diagnostic output from above.

## Helpful Resources

- Browser DevTools: F12
- Console Tab: Shows JavaScript errors
- Network Tab: Shows file loading
- Application Tab: Shows stored data
- Sources Tab: For breakpoint debugging