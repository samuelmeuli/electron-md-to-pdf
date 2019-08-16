import electron, { PrintToPDFOptions } from "electron";
import fs from "fs";
import showdown, { Flavor, ShowdownOptions } from "showdown";

const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;

interface Options {
	cssString: string;
	cssFiles: string[];
	mdFlavor: Flavor;
	pdfOptions: PrintToPDFOptions;
	showdownOptions: ShowdownOptions;
	wrapperClasses: string;
}

const DEFAULT_OPTIONS: Options = {
	cssString: "",
	cssFiles: [],
	mdFlavor: "github",
	pdfOptions: {},
	showdownOptions: {},
	wrapperClasses: "",
};

export function mdToPdfBuffer(md: string, options: Partial<Options>): Promise<Buffer> {
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
		pdfWindow.on("closed", () => {
			// Allow `pdfWindow` to be garbage collected
			pdfWindow = null!;
		});
		pdfWindow.webContents.on("did-finish-load", () => {
			pdfWindow.webContents.insertCSS(css);
			pdfWindow.webContents
				.printToPDF(pdfOptions)
				.then(data => {
					resolve(data);
				})
				.catch(err => {
					reject(err);
				})
				.then(() => {
					pdfWindow.close();
				});
		});

		// Load Markdown HTML into pdfWindow
		pdfWindow.loadURL(`data:text/html;charset=UTF-8,${htmlEncoded}`);
	});
}

export async function mdToPdfFile(
	md: string,
	filePath: string,
	options: Partial<Options>,
): Promise<void> {
	const pdfBuffer = await mdToPdfBuffer(md, options);
	fs.writeFileSync(filePath, pdfBuffer);
}
