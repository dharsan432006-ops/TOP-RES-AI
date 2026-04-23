# Troubleshooting: Blank Page Error

## Root Causes of Blank Page Error

If you're seeing a blank page when accessing the application, here are the most common causes and solutions:

### 1. **JavaScript Bundle Loading Issue**
**Symptoms**: Page loads but is completely blank, no console errors initially
**Solutions**:
- Check Network tab in DevTools (F12)
- Ensure the main JavaScript bundle loads (look for `index-*.js`)
- If bundle fails to load, run `npm run build` again
- Clear browser cache: Ctrl+Shift+Delete

### 2. **React Mount Point Missing**
**Symptoms**: Console error "Could not find root element to mount to"
**Solution**: 
- The `index.html` must contain `<div id="root"></div>`
- This is where React renders the application
- The file is already correct in this project

### 3. **Component Rendering Error**
**Symptoms**: Page was loading but now blank (error in component code)
**Solution**:
- Check browser console (F12 → Console tab)
- Look for red error messages
- The ErrorBoundary component will catch these errors
- Refresh the page if needed

### 4. **Missing Dependencies**
**Symptoms**: Console errors about "module not found" or "cannot find module"
**Solutions**:
```bash
# Reinstall all dependencies
npm install

# Or specifically check for missing packages
npm ls react react-dom react-router-dom
```

### 5. **Incorrect Import Paths**
**Symptoms**: Module not found errors in console
**Solutions**:
- Verify all imports include the `.ts` or `.tsx` extension
- ✅ Correct: `import App from './App.tsx'`
- ❌ Wrong: `import App from './App'`
- Check that relative paths are correct from the file location

### 6. **Environment Configuration Issue**
**Symptoms**: Page loads but certain features don't work
**Solutions**:
- Ensure `.env.local` has required environment variables
- Check that `GEMINI_API_KEY` is set if needed
- Restart the dev server after changing `.env.local`

## How to Debug

### Step 1: Check Browser Console
```
F12 → Console tab
```
Look for:
- Red error messages
- Warning messages about missing modules
- Network-related errors

### Step 2: Check Network Tab
```
F12 → Network tab → Reload page
```
Look for:
- Failed requests (marked in red)
- 404 errors on bundle files
- Hanging requests

### Step 3: Check Application Tab
```
F12 → Application tab → Local Storage
```
Look for:
- Any stored data that might be corrupt
- Clear storage if needed: right-click → Clear

### Step 4: Run in Development Mode
```bash
npm run dev
```
The dev server provides better error messages and hot reload.

## Common Error Messages and Solutions

### "Cannot find module 'react'"
```bash
npm install react react-dom
```

### "Cannot find module './services/geminiService'"
- Check that the file exists at that path
- Ensure the filename and path capitalization match
- Include the `.ts` extension in imports

### "ReferenceError: window is not defined"
- This code is running on the server instead of client
- Wrap in: `if (typeof window !== 'undefined') { ... }`

### "TypeError: Cannot read property 'map' of undefined"
- A component is trying to render an undefined or null value
- Add null checks: `items?.map()` or `{items && items.map()}`

## Quick Fixes

### 1. Restart Dev Server
```bash
# Press Ctrl+C in the terminal to stop
# Then restart:
npm run dev
```

### 2. Clear Cache and Rebuild
```bash
# Remove build artifacts
rm -r dist

# Clear node cache
npm cache clean --force

# Reinstall dependencies
npm install

# Rebuild
npm run build

# Start dev server
npm run dev
```

### 3. Hard Refresh Browser
- Windows/Linux: Ctrl+Shift+R
- Mac: Cmd+Shift+R

### 4. Try Incognito Mode
- Sometimes cache causes issues
- Open DevTools → Settings → Disable cache (while DevTools open)

## Verification Steps

After fixing the issue, verify with:

```bash
# Check TypeScript has no errors
npx tsc --noEmit

# Check linting
npm run lint

# Build successfully
npm run build

# Dev server runs without errors
npm run dev
```

## Application Structure

```
.
├── index.html          # Entry point HTML
├── index.tsx           # React mount point
├── index.css           # Global styles
├── App.tsx             # Main App component with routing
├── components/
│   ├── ErrorBoundary.tsx   # Error boundary component
│   ├── UI.tsx              # Reusable UI components
│   └── ModernDashboard.tsx # Main dashboard
├── services/
│   ├── geminiService.ts    # AI service
│   ├── storage.ts          # LocalStorage helper
│   └── geminiMock.js       # Mock for testing
├── utils/
│   ├── logger.ts           # Logging utility
│   └── validation.ts       # Input validation
└── config.ts               # Application config
```

## Testing the Application

1. **Homepage**: http://localhost:3000/
   - Should show ModernDashboard component
   - Displays charts and navigation

2. **Login Page**: http://localhost:3000/#/login
   - Default credentials: admin / admin123
   - Should allow login and navigate to gateway

3. **Gateway**: http://localhost:3000/#/gateway
   - Main HR panel
   - Upload and analyze resumes

4. **Lab**: http://localhost:3000/#/lab
   - Candidate view
   - View own resume

## If Still Not Working

1. Check that you're in the correct directory: `C:\Users\ADMIN\OneDrive\Desktop\AI-Resume-Ranker`
2. Verify Node.js is installed: `node --version`
3. Verify npm is installed: `npm --version`
4. Run `npm install` to ensure all dependencies are present
5. Try the quick fixes section above
6. Check the ERROR_BOUNDARY has been added to index.tsx

## ErrorBoundary Component

The application now includes an ErrorBoundary component that:
- Catches component rendering errors
- Displays a user-friendly error message
- Shows the error details for debugging
- Provides buttons to return home or reload

If you see an error screen with details, that means the error boundary caught a rendering error. Check the error message for clues about what went wrong.