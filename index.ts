import electron, { PrintToPDFOptions } from "electron";
import fs from "fs";
import { normalize } from "path";
import showdown, { Flavor, ShowdownOptions } from "showdown";

const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;

interface Options {
	basePath: string;
	cssString: string;
	cssFiles: string[];
	mdFlavor: Flavor;
	pdfOptions: PrintToPDFOptions;
	showdownOptions: ShowdownOptions;
	wrapperClasses: string;
}

const DEFAULT_OPTIONS: Options = {
	basePath: __dirname,
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
			basePath,
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
				<head>
					<base href="file://${normalize(basePath)}/" />
				</head>
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
				webSecurity: false, // Required for loading local resources (e.g. images)
			},
		});
		pdfWindow.on("closed", () => {
			// Allow `pdfWindow` to be garbage collected
			// @ts-ignore
			pdfWindow = null;
		});
		pdfWindow.webContents.on("did-finish-load", async () => {
			await pdfWindow.webContents.insertCSS(css);
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
