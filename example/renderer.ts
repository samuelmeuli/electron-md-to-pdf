import { ipcRenderer, remote } from "electron";
import fs from "fs";

import { mdToPdfFile } from "../index";

const md = fs.readFileSync(`${__dirname}/text.md`, "utf8");
const pdfPathRenderer = `${__dirname}/export-renderer.pdf`;

const mainExportButton = document.getElementById("button-export-main") as HTMLButtonElement;
const rendererExportButton = document.getElementById("button-export-renderer") as HTMLButtonElement;

async function exportFromRenderer(): Promise<void> {
	try {
		await mdToPdfFile(md, pdfPathRenderer, {
			basePath: __dirname,
			cssFiles: [`${__dirname}/styles.css`],
			wrapperClasses: "markdown-body",
		});
		await remote.dialog.showMessageBox({
			title: "Export successful",
			message: `Exported PDF from renderer process to ${pdfPathRenderer}`,
		});
	} catch (err) {
		await remote.dialog.showErrorBox(
			"Export error",
			`Error during export from renderer process: ${err}`,
		);
	}
}

function requestExportFromMain(): void {
	ipcRenderer.send("exportMain");
}

mainExportButton.onclick = requestExportFromMain;
rendererExportButton.onclick = exportFromRenderer;
