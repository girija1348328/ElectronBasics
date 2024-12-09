# Electron Practice

A sample Electron application integrated with Vite, React, and TypeScript.

---

## **Project Overview**

This project sets up an Electron app using Vite for fast development, React for UI, and TypeScript for type safety. It includes instructions for building and packaging the application for Windows and Linux using Electron Builder.

---

## **Installation Steps**

### **1. Setup Vite with React and TypeScript**
1. Initialize the Vite project:
   ```bash
   npm install vite
Choose the react+typescript template.

Make a UI folder where you can add all the root directory.

<img src="https://github.com/user-attachments/assets/6d357966-4db2-4ef2-b680-38e31aaa606e" width="500" height="300" />
Make changes in the index.html file:

<img src="https://github.com/user-attachments/assets/6d357966-4db2-4ef2-b680-38e31aaa606e" width="500" height="300" />
Remove the public folder and also remove all the necessary things present in app.js.

Run the command:

bash
Copy code
npm run build
Then make changes in vite.config.ts:

<img src="https://github.com/user-attachments/assets/600048e6-5c7a-4522-b246-fb17e3ad28eb" width="500" height="300" />
Installation Electron
Install Electron as a development dependency:

bash
Copy code
npm install --save-dev electron
Create an electron folder and add a file.

Then add the following Vite config in the vite.config.ts:

ts
Copy code
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base:'./',
  build:{
    outDir:'dist-react',
  },
})
Update the package.json file:

<img src="https://github.com/user-attachments/assets/600048e6-5c7a-4522-b246-fb17e3ad28eb" width="500" height="300" />
Electron-builder for every device
Install Electron Builder:

bash
Copy code
npm install --save-dev electron-builder
Create a file named electron-builder.json:

<img src="https://github.com/user-attachments/assets/c62364c7-d68c-4c73-82af-b25da6a3d6b9" width="500" height="300" />
Add these configurations in package.json:

<img src="https://github.com/user-attachments/assets/47a65339-f87e-40ae-95ee-b137f688dfae" width="500" height="300" />
Then run the command:

bash
Copy code
npm run dist:win
For Linux users:

<img src="https://github.com/user-attachments/assets/0ef74fb7-312b-4397-b968-81696e1da499" width="500" height="300" />
Here is the package.json file:

<img src="https://github.com/user-attachments/assets/924e13b1-0816-4a16-b4a3-040ad37fbe96" width="500" height="300" />
If it doesn't run and shows an error about adding an email or other information, add it in package.json:

<img src="https://github.com/user-attachments/assets/1b9acda4-0e5b-43a1-a38e-b23604604f36" width="500" height="300" />
Install the cross-env package:

bash
Copy code
npm install cross-env
Then create a file named util.js under the electron folder:

js
Copy code
export function isDev() {
  return process.env.NODE_ENV === 'development'
}
Then add this code in main.ts:

ts
Copy code
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { isDev } from './util.js';

app.on('ready', () => {
  const mainWindow = new BrowserWindow({})

  if (isDev()) {
      mainWindow.loadURL('http://localhost:5123');
  } else {
      mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'))
  }
});
Update package.json:

json
Copy code
"dev:electron": "cross-env NODE_ENV=development electron .",
Run parallel application
Install:

bash
Copy code
npm install --save-dev npm-run-all
Then change the package.json file:

json
Copy code
"dev": "npm-run-all --parallel dev:react dev:electron",
<img src="https://github.com/user-attachments/assets/5a03100a-af4f-46a5-8f4f-32af8772feb7" width="500" height="300" />
Reading System Resources
Install:

bash
Copy code
npm install --save-dev @types/os-utils
If it doesn't work, install:

bash
Copy code
npm install --save-dev os-utils
Then create a file named resourceManager.ts under the electron folder:

ts
Copy code
import osUtils from 'os-utils';

const POLLING_INTERVAL = 500;

export function pollResources() {
    setInterval(async () => {
        const cpuUsage = await getCpuUsage();
        const ramUsage = getRamUsage()
        console.log({cpuUsage,ramUsage});
    }, POLLING_INTERVAL)
}

export function getStaticData(){
    const totalStorage = getStorageData().total;
    const cpuModel = os.cpus()[0].model;
    const totalMemoryGB = Math.floor(osUtils.totalmem()/1024);

    return  {
        totalStorage,
        cpuModel,
        totalMemoryGB
    }
}

function getCpuUsage(){
    return new Promise((resolve)=>{
        osUtils.cpuUsage(resolve);
    });
}

function getRamUsage(){
    return 1 - osUtils.freememPercentage();
}

function getStorageData (){
    const stats = fs.statfsSync(process.platform === 'win32' ? 'C://' : '/');
    const total = stats.bsize * stats.blocks;
    const free = stats.bsize * stats.bfree;

    return{
        total: Math.floor(total / 1_000_000_000),
        usage: 1 - free / total,
    }
}
Communicating with UI
Add a file pathResolver.ts:

ts
Copy code
import path from 'path';
import { app } from 'electron';
import { isDev } from './util.js';

export function getPreloadPath(){
    return path.join(
        app.getAppPath(),
        isDev() ? '.' : '..',
        'dist-electron/preload.cjs'
    );
}
Add a file preload.cts for data:

ts
Copy code
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  subscribeStatistics: (callback: (statistics: any) => void) => {
    const listener = (_: any, stats: any) => {
      callback(stats);
    };

    ipcRenderer.on("statistics", listener);

    return () => {
      ipcRenderer.removeListener("statistics", listener);
    };
  },
  getStaticData: () => {
    console.log("Static data requested");
  },
});
Update main.ts to include the preload path:

ts
Copy code
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { pollResources } from './resourceManager.js';
import { getPreloadPath } from './pathResolver.js';

app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        webPreferences:{
            preload: getPreloadPath(),
        },
    })

    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'))
    }

    pollResources(mainWindow);
});
Update your React code to handle the statistics:

js
Copy code
useEffect(() => {
  const unsubscribe = window.electron.subscribeStatistics((stats) => {
    console.log(stats);
  });

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []);
Finally, create a global.d.ts file:

ts
Copy code
export {};

declare global {
  interface Window {
    electron: {
      subscribeStatistics: (callback: (statistics: any) => void) => () => void;
      getStaticData: () => void;
    };
  }
}
