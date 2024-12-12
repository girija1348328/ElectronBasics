import { ipcMain } from "electron";
import { getUIPath } from "./pathResolver.js";
import { pathToFileURL } from 'url';
export function isDev() {
    return process.env.NODE_ENV === 'developement';
}
export function ipcMainHandle(key, handler) {
    ipcMain.handle(key, (event) => {
        const senderFrame = event.senderFrame;
        if (!senderFrame) {
            throw new Error('senderFrame is null or undefined');
        }
        const frameUrl = senderFrame.url;
        console.log('Event Frame URL:', frameUrl);
        console.log('Expected UI Path:', getUIPath());
        validateEventFrame(senderFrame); // Validate the frame using the updated function
        return handler();
    });
}
export function ipcWebContentsSend(key, webContents, payload) {
    webContents.send(key, payload);
}
export function validateEventFrame(frame) {
    console.log(frame.url);
    if (!frame) {
        throw new Error('Frame is null or undefined');
    }
    const frameUrl = frame.url; // Directly access the URL of WebFrameMain
    // Check if the URL is from localhost in dev mode
    if (isDev() && new URL(frameUrl).host === 'localhost:5125') {
        return;
    }
    // Compare with the expected UI path
    if (frameUrl !== pathToFileURL(getUIPath()).toString()) {
        throw new Error('Malicious event');
    }
}
