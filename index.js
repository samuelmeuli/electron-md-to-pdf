const BrowserWindow = require("electron").BrowserWindow
	? require("electron").BrowserWindow
	: require("electron").remote.BrowserWindow;
const fs = require("fs");
const showdown = require("showdown");

const DEFAULT_OPTIONS = {
	cssString: "",
	cssFiles: [],
	mdFlavor: "github",
	pdfOptions: {},
	showdownOptions: {},
	wrapperClasses: "",
};

function mdToPdfBuffer(md, options) {
	return new Promise((resolve, reject) => {
		const optionsWithDefaults = {
			...DEFAULT_OPTIONS,
			...options,
		};
		const {
			cssString,
			cssFiles,
			mdFlavor,
			pdfOptions,
			showdownOptions,
			wrapperClasses,
		} = optionsWithDefaults;

		// Read and concatenate CSS files and CSS string
		let css = "";
		cssFiles.forEach(filePath => {
			const fileString = fs.readFileSync(filePath, "utf8");
			css += `${fileString}\n\n`;
		});
		css += cssString;

		const converter = new showdown.Converter(showdownOptions);
		showdown.setFlavor(mdFlavor);

		// Convert Markdown to HTML
		const html = converter.makeHtml(md);
		const htmlWrapped = `
			<!DOCTYPE html>
			<html>
				<body>
					<div class="${wrapperClasses}">
						${html}
					</div>
				</body>
			</html>
		`;
		const htmlEncoded = encodeURIComponent(htmlWrapped);

		// Open new BrowserWindow and print it when it has finished loading
		let pdfWindow = new BrowserWindow({
			show: false,
			webPreferences: {
				nodeIntegration: false,
			},
		});
		pdfWindow.webContents.on("did-finish-load", () => {
			pdfWindow.webContents.insertCSS(css);
			pdfWindow.webContents.printToPDF(pdfOptions, (err, data) => {
				if (err) {
					return reject(err);
				}
				pdfWindow.close();
				return resolve(data);
			});
		});
		pdfWindow.on("closed", () => {
			pdfWindow = null;
		});

		// Load Markdown HTML into pdfWindow
		pdfWindow.loadURL(`data:text/html;charset=UTF-8,${htmlEncoded}`);
	});
}

function mdToPdfFile(md, filePath, options) {
	return new Promise((resolve, reject) => {
		return mdToPdfBuffer(md, options)
			.then(pdfBuffer => {
				fs.writeFileSync(filePath, pdfBuffer);
				return resolve();
			})
			.catch(err => {
				return reject(err);
			});
	});
}

module.exports = {
	mdToPdfBuffer,
	mdToPdfFile,
};
