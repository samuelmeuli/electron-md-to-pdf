const { ipcRenderer } = require("electron");
const { dialog } = require("electron").remote;
const fs = require("fs");

const { mdToPdfFile } = require("../index");

const PDF_PATH_RENDERER = `${__dirname}/export-renderer.pdf`;
const md = fs.readFileSync(`${__dirname}/text.md`, "utf8");

function exportFromRenderer() {
	mdToPdfFile(md, PDF_PATH_RENDERER)
		.then(() => {
			dialog.showMessageBox(null, {
				title: "Export successful",
				message: `Exported PDF from renderer.js to ${PDF_PATH_RENDERER}`,
			});
		})
		.catch(err => {
			dialog.showErrorBox("Export error", `Error during export from renderer.js: ${err}`);
		});
}

function requestExportFromMain() {
	ipcRenderer.send("exportMain");
}

document.getElementById("button-export-main").onclick = requestExportFromMain;
document.getElementById("button-export-renderer").onclick = exportFromRenderer;
