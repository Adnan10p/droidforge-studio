# 🤝 Contributing to DroidForge Studio

Thank you for your interest in contributing to **DroidForge Studio**! We welcome developers, testers, and team members to collaborate, report bugs, suggest features, and submit Pull Requests to improve the visual Android app builder.

---

## 📜 Code of Conduct & Principles
- All contributions are maintained under the official repository: **[https://github.com/Adnan10p/droidforge-studio](https://github.com/Adnan10p/droidforge-studio)**
- Respect project architecture, maintain clean code, and test features thoroughly before submitting PRs.
- Unauthorized commercial re-branding or re-uploading under a different name is strictly prohibited per our [LICENSE](LICENSE).

---

## 🐛 Reporting Bugs & Suggesting Features

If you discover a bug, UI issue, or compilation error:
1. Go to the [GitHub Issues](https://github.com/Adnan10p/droidforge-studio/issues) page.
2. Click **New Issue**.
3. Describe the bug clearly, including:
   - Steps to reproduce
   - Expected behavior vs actual behavior
   - Screenshots or console log tracebacks

---

## 🛠️ How to Contribute & Submit Pull Requests (PRs)

### Step 1: Fork & Clone
1. Fork the official repository: `https://github.com/Adnan10p/droidforge-studio`
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/droidforge-studio.git
   cd droidforge-studio
   ```

### Step 2: Install & Setup
```bash
npm install
npm run dev
```

### Step 3: Create a Feature/Bugfix Branch
```bash
git checkout -b fix/your-bug-description
# or
git checkout -b feature/your-feature-name
```

### Step 4: Make Changes & Test locally
- Ensure TypeScript compiles without errors:
  ```bash
  npm run lint
  ```
- Test building the production package:
  ```bash
  npm run build
  ```

### Step 5: Commit & Push
```bash
git add .
git commit -m "Fix: Resolved [issue description]"
git push origin fix/your-bug-description
```

### Step 6: Create a Pull Request (PR)
1. Go to `https://github.com/Adnan10p/droidforge-studio`.
2. Click **New Pull Request**.
3. Select your feature branch and submit for review.
4. Project maintainer **Adnan (@Adnan10p)** will review, provide feedback, and merge your changes into the main branch!

---

## 👥 Team Member Guidelines
For designated team members working directly on the core repository:
- Push changes to feature branches (`feature/...` or `fix/...`).
- Create Pull Requests for peer review before merging to `main`.
- Keep documentation and screenshot guides up to date.

Thank you for helping build the ultimate Visual Android Builder! 🚀
