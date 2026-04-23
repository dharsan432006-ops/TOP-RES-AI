# Blank Page Error Debugging Guide

## Issue: Blank Page Error

If you're experiencing a blank page, follow these troubleshooting steps:

### 1. Check Browser Console
- Open your browser's Developer Tools (F12 or Ctrl+Shift+I)
- Go to the **Console** tab
- Look for any red error messages
- Share the error message for diagnosis

### 2. Check Network Tab
- Go to the **Network** tab in Developer Tools
- Reload the page
- Look for failed requests (marked in red)
- Check if bundle files are loading properly

### 3. Common Issues and Solutions

#### Issue: "Could not find root element to mount to"
- **Cause**: The `<div id="root"></div>` is missing from index.html
- **Solution**: Verify that index.html has the root div element

#### Issue: Module not found errors
- **Cause**: Import paths are incorrect
- **Solution**: 
  - Check that all imports use correct paths
  - Ensure all files are in the correct directories

#### Issue: Vite Hot Module Replacement (HMR) issues
- **Cause**: Network/connectivity problems
- **Solution**: 
  - Restart the dev server: `npm run dev`
  - Clear browser cache
  - Try incognito mode

### 4. Restart Development Server
```bash
# Kill the existing server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### 5. Check for Configuration Issues
- Verify `vite.config.ts` is correct
- Check `tsconfig.json` for TypeScript errors
- Ensure all imports have correct paths

### 6. Clear Build Cache
```bash
# Remove dist folder
rm -r dist

# Reinstall dependencies if needed
rm -r node_modules
npm install

# Try building again
npm run build

# Start dev server
npm run dev
```

### 7. Verify Import Paths
Common import path issues:
- ✅ Correct: `import { gemini } from "./services/geminiService.ts"`
- ❌ Wrong: `import { gemini } from "./services/geminiService"`
- ❌ Wrong: `import { gemini } from "services/geminiService.ts"`

### 8. Check React and ReactDOM
- Ensure React and ReactDOM are installed: `npm list react react-dom`
- If missing: `npm install react react-dom`

## Debugging Commands

```bash
# Check npm script names
npm run

# Build with verbose output
npm run build --verbose

# Check for TypeScript errors
npx tsc --noEmit

# Run linter to find issues
npm run lint
```

## Next Steps

If the issue persists:
1. Take a screenshot of the browser console errors
2. Run `npm run build` and share any error messages
3. Check that all required environment variables are set
4. Verify that the application was properly built with `npm run build`

## Application Startup Flow

1. Browser loads `index.html`
2. `index.html` loads `index.tsx` as a module
3. `index.tsx` mounts React app to `#root` element
4. App.tsx renders with Router and main components
5. Page should load showing the Modern Dashboard or Login page

If any step fails, you'll see errors in the browser console.
