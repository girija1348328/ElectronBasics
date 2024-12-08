import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  subscribeStatistics: (callback: (statistics: any) => void) => {
    const listener = (_: any, stats: any) => {
      callback(stats);
    };

    ipcRenderer.on("statistics", listener);

    // Return a cleanup function to remove the listener
    return () => {
      ipcRenderer.removeListener("statistics", listener);
    };
  },
  getStaticData: () => {
    console.log("Static data requested");
  },
});
