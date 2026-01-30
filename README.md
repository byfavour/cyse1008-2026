# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Assignment 1 — Getting Started with Git & GitHub

## Objective

In this assignment you will:

- Set up your development environment
- Learn the basics of Git and GitHub
- Fork a repository correctly
- Work on a specific branch (`assignment1`)
- Commit and push code to your own GitHub repository

This assignment uses the ICE framework (Ideas, Connections, Extensions).

---

## ⚠️ Important Rules (Read First)

- You must fork the repository
- You must push to your own GitHub account
- All work must be done on the `assignment1` branch
- If you push code to `ccoulteratloyalist/cyse1008-2026`, you have done it incorrectly

If your username does not appear in the GitHub URL, stop and ask for help.

---

## 1. Install Required Software (Ideas)

### Visual Studio Code

Download and install VS Code:  
https://code.visualstudio.com/

---

### Git & GitHub

Install Git:  
https://git-scm.com/downloads

Verify installation:

    git --version

Create or sign in to your GitHub account using your student email:  
https://github.com/

---

### Node.js & npm

Install the LTS version:  
https://nodejs.org/

Verify installation:

    node --version
    npm --version

---

## 2. Install GitHub CLI (gh) (Ideas)

We will use the GitHub CLI to authenticate and interact with GitHub.

### Windows

Download and install:  
https://cli.github.com/

Verify:

    gh --version

---

### macOS

Using Homebrew:

    brew install gh

Or download from:  
https://cli.github.com/

Verify:

    gh --version

---

### Ubuntu / Linux

    sudo apt update
    sudo apt install gh

Verify:

    gh --version

---

### Authenticate with GitHub

    gh auth login

- Choose GitHub.com
- Choose HTTPS
- Authenticate in your browser
- Sign in using your student GitHub account

---

## 3. Fork the Repository (Ideas)

Go to:  
https://github.com/ccoulteratloyalist/cyse1008-2026

1. Click Fork
2. Uncheck “Copy the main branch only”
3. Confirm the repository now appears under your GitHub username

---

## 4. Clone Your Fork (Ideas)

Clone your fork, not the instructor’s repository:

    git clone https://github.com/YOUR-USERNAME/cyse1008-2026.git
    cd cyse1008-2026

---

## 5. Switch to the Assignment Branch (Ideas)

All work must be done on `assignment1`:

    git checkout assignment1

---

## 6. Edit the Application (Connections)

1. Open `src/App.js`
2. Modify the file so it displays your name, for example:

    Hello, Your Name!

---

## 7. Run the App Locally (Connections)

    npm install
    npm start

Confirm:
- The app runs
- Your name appears in the browser

---

## 8. Commit and Push Your Changes (Connections)

    git add .
    git commit -m "Assignment 1: added my name"
    git push origin assignment1

Verify:
- Your commit appears on your GitHub repository
- The `assignment1` branch contains your changes

---

## 9. Extensions (Optional)

For additional credit, you may:

- Create an additional branch and repeat the workflow
- Open a Pull Request from `assignment1` → `main` in your fork
- Explore commit history using GitHub or the CLI

---

## Submission

Submit the following on Canvas:

- URL of your forked repository
- Confirmation that commits exist on the `assignment1` branch
- Screenshots or links for any Extensions work

---

## Completion

By completing this assignment, you will have:

- Installed essential development tools
- Learned basic Git and GitHub workflow
- Successfully pushed code to your own repository
- Prepared for future collaborative assignments
