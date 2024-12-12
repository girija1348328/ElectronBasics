import { app, BrowserWindow } from 'electron';
import { ipcMainHandle, isDev } from './util.js';
import { getStaticData, pollResources } from './resourceManager.js';
import { getPreloadPath, getUIPath } from './pathResolver.js';
app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: getPreloadPath(),
        },
    });
    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
    }
    else {
        mainWindow.loadFile(getUIPath());
    }
    // handleGetStaticData(()=>{
    //     return getStaticData();
    // })
    pollResources(mainWindow);
    ipcMainHandle('getStaticData', () => {
        return getStaticData();
    });
});
// function handleGetStaticData(callback:()=>StaticData){
//     ipcMain.handle('getStaticData',callback);
// }