// Background script for Doomboard Extension
console.log("Doomboard Extension Background Service Worker Loaded");

chrome.runtime.onInstalled.addListener(() => {
    console.log("Doomboard Extension Installed");
});
