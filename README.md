# ANVAY — Practice Management Platform

Modern practice management infrastructure for independent therapists and clinical psychologists.

---

## Quick Start (How to Run Locally)

Follow these exact steps to run the application on your computer:

### 1. Open Terminal in the Root Directory
Make sure your terminal is located in the **main project root directory** where `package.json` is located.
Do **not** run `cd server` or `cd src`.

If you are in a subfolder, return to the root folder:
```bash
cd ..
```
Your prompt should look like:
```powershell
C:\Users\...\ANVAY\ANVAY->
```

### 2. Install Project Dependencies
Run the following command once to install all dependencies (this installs `tsx`, `express`, `vite`, `react`, etc. so you will never see `'tsx' is not recognized`):
```bash
npm install
```

### 3. Start the Development Server
Run:
```bash
npm run dev
```

You will see:
```text
  ANVAY Practice Management Server running on port 3000
  Platform: Full-Stack React + Express + Socket.io
  Dev URL:  http://localhost:3000
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Why Those VS Code Errors Appeared & How They Were Solved

### 1. `'tsx' is not recognized as an internal or external command`
* **Cause**: `npm run dev` was run inside the `server/` or `src/` subdirectories (`cd server` / `cd src`), or before running `npm install` in the root directory.
* **Solution**: Stay in the main root directory (`ANVAY-`) and run `npm install` first. Then run `npm run dev`.

### 2. VS Code Red Squiggly Lines (`Cannot find module`, `Cannot find name 'process'`, `Cannot find name 'http'`)
* **Cause**: In `tsconfig.json`, the compiler was set to only include browser types (`"types": ["vite/client"]`), which hid Node.js global types (`process`, `crypto`, `http`, `path`) from VS Code. Also, `node_modules` was not yet installed on your machine.
* **Solution**: Updated `tsconfig.json` to include `"node"` (`"types": ["vite/client", "node"]`). Once you run `npm install`, all red squiggles in VS Code will disappear.

### 3. Removal of Razorpay & External Gateways
* The platform uses direct practice billing (bank transfers, in-clinic cash/check, card terminal, and insurance reimbursement). No Razorpay accounts, API keys, or third-party configurations are needed.

---

## Features Overview

* **Guest Exploration Mode**: Explore all pages, appointments, client records, and SOAP notes without registering or logging in.
* **Clinical Calendar & Scheduling**: Conflict-free booking with inter-session buffer management.
* **Client CRM**: Patient directory, intake questionnaires, and contact history.
* **SOAP Notes**: Encrypted, lockable clinical session documentation.
* **Direct Practice Invoicing**: Automated receipt generation (`INV-2026-XXXX`) and revenue tracking.
* **Secure Messaging**: Real-time client-therapist communication via WebSockets.
