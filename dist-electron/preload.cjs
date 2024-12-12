"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron = require('electron');
electron_1.contextBridge.exposeInMainWorld("electron", {
    subscribeStatistics: (callback) => {
        ipcOn("statistics", (stats) => {
            callback(stats);
        });
        // Return a cleanup function to remove the listener
        // return () => {
        //   ipcRenderer.removeListener("statistics", listener);
        // };
    },
    getStaticData: () => ipcInvoke('getStaticData'),
});
function ipcInvoke(key) {
    return electron.ipcRenderer.invoke(key);
}
function ipcOn(key, callback) {
    electron.ipcRenderer.on(key, (_, payload) => callback(payload));
}
