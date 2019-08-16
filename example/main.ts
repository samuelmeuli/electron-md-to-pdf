/* eslint-disable import/no-extraneous-dependencies */
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import electronDebug from "electron-debug";
import electronUnhandled from "electron-unhandled";
import fs from "fs";

import { mdToPdfFile } from "../index";

electronDebug();
electronUnhandled();

let mainWindow: BrowserWindow | null;
const md = fs.readFileSync(`${__dirname}/text.md`, "utf8");
const pdfPathMain = `${__dirname}/export-main.pdf`;

async function createWindow(): Promise<BrowserWindow> {
	const win = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
		},
	});
	win.on("ready-to-show", (): void => {
		win.show();
	});
	win.on("closed", (): void => {
		// Allow `mainWindow` to be garbage collected
		mainWindow = null;
	});

	// Load HTML file
	await win.loadURL(`file://${__dirname}/index.html`);

	return win;
}

// Quit app when all of its windows have been closed
app.on("window-all-closed", (): void => {
	app.quit();
});

// On app activation (e.g. when clicking dock icon), re-create BrowserWindow if necessary
app.on(
	"activate",
	async (): Promise<void> => {
		if (!mainWindow) {
			mainWindow = await createWindow();
		}
	},
);

async function exportFromMain(): Promise<void> {
	try {
		await mdToPdfFile(md, pdfPathMain, {
			cssFiles: [`${__dirname}/../node_modules/github-markdown-css/github-markdown.css`],
			wrapperClasses: "markdown-body",
		});
		await dialog.showMessageBox({
			title: "Export successful",
			message: `Exported PDF from main process to ${pdfPathMain}`,
		});
	} catch (err) {
		await dialog.showErrorBox("Export error", `Error during export from main process: ${err}`);
	}
}

ipcMain.on("exportMain", exportFromMain);

(async (): Promise<void> => {
	// Wait for Electron to be initialized
	await app.whenReady();

	// Create and show BrowserWindow
	mainWindow = await createWindow();
})();
