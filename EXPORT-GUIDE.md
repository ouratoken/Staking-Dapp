# 📦 How to Export from Figma Make and Deploy

## Overview
Figma Make doesn't have a traditional "export button." Here's how to get your code and deploy it.

---

## 🎯 Option 1: Copy Code Files Manually (Recommended)

Since you're in Figma Make, you can access all your code but need to manually transfer it to deploy.

### Step-by-Step Process:

#### 1. Create a Local Project

On your computer, create a new folder:
```bash
mkdir oura-staking
cd oura-staking
```

#### 2. Initialize npm Project

```bash
npm init -y
```

#### 3. Copy package.json

Copy the contents from your Figma Make `package.json` file to your local `package.json`.

Your `package.json` should have these key sections:
```json
{
  "name": "oura-staking",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "mongodb": "^7.0.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "sonner": "2.0.3",
    "lucide-react": "0.487.0",
    ... (all other dependencies from Figma Make)
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@vitejs/plugin-react": "4.7.0",
    "tailwindcss": "4.1.12",
    "vite": "6.3.5"
  }
}
```

#### 4. Install Dependencies

```bash
npm install
```

#### 5. Create Project Structure

Create these folders:
```bash
mkdir -p src/app/components
mkdir -p src/app/lib
mkdir -p src/styles
mkdir -p public
mkdir -p netlify/functions
```

#### 6. Copy All Files

Copy these files from Figma Make to your local project:

**Configuration Files:**
- `vite.config.ts`
- `tsconfig.json`
- `index.html`
- `tailwind.config.js` (if exists)

**Source Files:**
```
src/
├── app/
│   ├── components/
│   │   ├── AdminPanel.tsx
│   │   ├── Dashboard.tsx
│   │   ├── LoginPage.tsx
│   │   ├── Staking.tsx
│   │   └── Wallet.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── App.tsx
│   └── main.tsx
├── styles/
│   ├── theme.css
│   └── fonts.css
└── index.css
```

**Assets:**
- Copy any images from `public/` folder
- Copy the background image (cloud image)

#### 7. Create Missing Configuration Files

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

**index.html:**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Oura Staking Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### 8. Test Locally

```bash
npm run dev
```

Visit `http://localhost:5173` to test your app.

#### 9. Build for Production

```bash
npm run build
```

This creates a `dist/` folder with your production-ready app.

---

## 🚀 Option 2: Use Git Integration (Better)

### Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit - Oura Staking Platform"
```

### Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it: `oura-staking`
3. Don't initialize with README (you have one)
4. Click **Create repository**

### Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/oura-staking.git
git branch -M main
git push -u origin main
```

### Deploy to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub**
4. Select your `oura-staking` repository
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables (if using MongoDB)
7. Click **Deploy site**

---

## 📋 Quick Checklist

Before deploying, ensure you have:

- [ ] All React component files copied
- [ ] All library files (api.ts, types.ts, utils.ts) copied
- [ ] All style files (CSS) copied
- [ ] All images/assets copied
- [ ] package.json with correct dependencies
- [ ] vite.config.ts configured
- [ ] index.html created
- [ ] Tested locally with `npm run dev`
- [ ] Built successfully with `npm run build`
- [ ] Git repository initialized (if using Git)

---

## 🔧 MongoDB Integration (Optional)

If you want to use MongoDB instead of localStorage:

### 1. Update API File

Replace the localStorage-based `api.ts` with MongoDB calls.

### 2. Create Netlify Functions

See `DEPLOYMENT.md` for complete MongoDB setup instructions.

---

## 🐛 Common Issues

### Missing Dependencies
```bash
npm install
```

### Build Errors
Check that all imports are correct and files exist.

### Vite Not Found
```bash
npm install -D vite
```

### TypeScript Errors
```bash
npm install -D typescript @types/react @types/react-dom
```

---

## 📱 Alternative: Download as ZIP

If Figma Make provides an export/download option:

1. Look for **Export** or **Download** button
2. Download as ZIP
3. Extract locally
4. Run `npm install`
5. Follow deployment steps above

---

## 🎉 Success Path

```
Figma Make → Copy Code → Local Project → Test → Git → GitHub → Netlify → Live! 🚀
```

---

## ⚠️ Important Notes

1. **Don't forget environment variables** - Add them in Netlify dashboard
2. **Test before deploying** - Always test locally first
3. **Keep backups** - Save your code in multiple places
4. **Use version control** - Git is your friend

---

## 📞 Need Help?

If you encounter issues:

1. Check that all files are copied correctly
2. Verify dependencies in package.json
3. Test locally before deploying
4. Check Netlify build logs
5. Review error messages carefully

---

**Next Steps**: After successfully exporting, follow `DEPLOYMENT.md` for MongoDB and Netlify setup!

Good luck! 🍀
