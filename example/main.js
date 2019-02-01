/* eslint-disable import/no-extraneous-dependencies */
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const electronDebug = require("electron-debug");

const { mdToPdfFile } = require("../index");

electronDebug();

const PDF_PATH_MAIN = `${__dirname}/export-main.pdf`;
let mainWindow;
const md = "# Hello\n\nWorld!"; // TODO replace

function onClosed() {
	mainWindow = null;
}

function createMainWindow() {
	const win = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
		},
	});
	win.loadURL(`file://${__dirname}/index.html`);
	win.on("closed", onClosed);
	return win;
}

function exportFromMain() {
	mdToPdfFile(md, PDF_PATH_MAIN)
		.then(() => {
			dialog.showMessageBox(null, {
				title: "Export successful",
				message: `Exported PDF from main.js to ${PDF_PATH_MAIN}`,
			});
		})
		.catch(err => {
			dialog.showErrorBox("Export error", `Error during export from main.js: ${err}`);
		});
}

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on("ready", () => {
	mainWindow = createMainWindow();
});

ipcMain.on("exportMain", () => {
	exportFromMain();
});
