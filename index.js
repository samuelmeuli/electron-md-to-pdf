const BrowserWindow = require("electron").BrowserWindow
	? require("electron").BrowserWindow
	: require("electron").remote.BrowserWindow;
const fs = require("fs");
const showdown = require("showdown");

const converter = new showdown.Converter();

function mdToPdfBuffer(md) {
	return new Promise((resolve, reject) => {
		// Convert Markdown to HTML
		const html = converter.makeHtml(md);
		const htmlEncoded = encodeURIComponent(html);

		// Open new BrowserWindow and print it when it has finished loading
		let pdfWindow = new BrowserWindow({
			show: false,
		});
		pdfWindow.webContents.on("did-finish-load", () => {
			pdfWindow.webContents.printToPDF(
				{
					pageSize: "A4",
				},
				(err, data) => {
					if (err) {
						return reject(err);
					}
					pdfWindow.close();
					return resolve(data);
				},
			);
		});
		pdfWindow.on("closed", () => {
			pdfWindow = null;
		});

		// Load Markdown HTML into pdfWindow
		pdfWindow.loadURL(`data:text/html;charset=UTF-8,${htmlEncoded}`);
	});
}

function mdToPdfFile(md, filePath) {
	return new Promise(resolve => {
		return mdToPdfBuffer(md).then(pdfBuffer => {
			fs.writeFileSync(filePath, pdfBuffer);
			return resolve();
		});
	});
}

module.exports = {
	mdToPdfBuffer,
	mdToPdfFile,
};
