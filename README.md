# electron-md-to-pdf

**Convert Markdown to PDF in Electron apps**

This simple library first converts a Markdown string to HTML (using [Showdown](http://showdownjs.com)) and then to PDF (using Chromium's built-in print functionality). This makes it possible to convert Markdown to PDF with a minimal number of dependencies in Electron apps.

## Installation

```sh
npm install electron-md-to-pdf
```

## Usage

This module exposes two functions:

- **`mdToPdfBuffer(md, options)`**, which generates a PDF from the provided Markdown string (`md`) and returns it as a `Buffer`
- **`mdToPdfFile(md, filePath, options)`**, which generates a PDF from the provided Markdown string and saves it at the provided `filePath`

Both functions return promises.

The `options` parameter is optional. It's an object which may contain the following values:

- `cssString` (String): CSS string to inject into the HTML which is generated from the Markdown string (e.g. `"body { color: red; }"`)
- `cssFiles` (String array): Array of CSS files to inject into the HTML (e.g. `["./path/to/styles.css"]`)
- `mdFlavor` (String): Markdown flavor to use, one of `["original", "vanilla", "github"]` (see the [Showdown docs](https://github.com/showdownjs/showdown#flavors)). Default is `"github"`
- `pdfOptions` (Object): Options to pass to Electron's PDF print function (see the [Electron docs](https://electronjs.org/docs/api/web-contents#contentsprinttopdfoptions-callback))
- `showdownOptions` (Object): Other options for the HTML generation (see the [Showdown docs](https://github.com/showdownjs/showdown#valid-options))
- `wrapperClasses` (String): Class(es) to apply to the wrapper `div` around the Markdown HTML

**See the examples on how to use the module in the [main process](./example/main.js) and [renderer process](./example/renderer.js).**

## Development

Make sure you have Node.js and Yarn installed.

1. Clone this repo: `git clone REPO_URL`
2. Install the dependencies: `yarn`
3. Run the test app: `yarn start`

## Contributing

Suggestions and contributions are always welcome! Please first discuss changes via issue before submitting a pull request.
