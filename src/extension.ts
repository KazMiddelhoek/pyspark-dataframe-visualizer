
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "pyspark-dataframe-visualizer" is now active!');

	let hover = vscode.languages.registerHoverProvider("python", {
		provideHover(document, position, token) {
			let dataframes = findAllDataframesInFile(document);
			if (dataframes.length === 0) { return; }

			for (let dataframe of dataframes) {
				if ((position.line < dataframe[0]) ||
					(position.line > dataframe[1])) {
					continue;
				}
				return new vscode.Hover(formatMarkdownTable(dataframe[3], dataframe[2]));
			}
		}
	});
	context.subscriptions.push(hover);
}

export function deactivate() { }

function findAllDataframesInFile(document: vscode.TextDocument) {
	let text = document.getText();
	let regex = RegExp("createDataFrame\\(", "gm");
	let dataframeDefinition: RegExpExecArray | null;
	let dataframeArray: [number, number, string, string][] = [];


	while ((dataframeDefinition = regex.exec(text)) !== null) {
		let firstLineNumber = text.slice(0, dataframeDefinition.index).split("\n").length - 1;
		let lastLineNumber = findNumberOfLinesOfDataframeDefintion(text.slice(regex.lastIndex)) + firstLineNumber;

		let [contents, schemaDefinition] = parseDataFrame(text, dataframeDefinition.index);

		dataframeArray.push([firstLineNumber, lastLineNumber, contents, schemaDefinition]);
	}
	return dataframeArray;
}

function findNumberOfLinesOfDataframeDefintion(dataframe: string) {
	let nChars = 0;
	let nOpening = 1;
	let nClosing = 0;
	for (let character of dataframe) {
		nChars += 1;
		if (character === ")") { nClosing += 1; }
		else if (character === "(") { nOpening += 1; }
		if (nOpening === nClosing) { break; }
	}
	let linesSinceDataframeDefinition = dataframe.slice(0, nChars).split("\n").length - 1;
	return linesSinceDataframeDefinition;
}

function parseDataFrame(text: string, index: number) {
	let contents = getContents(text, index);
	let schemaDefinition = getSchemaDefinition(text, index);
	return [contents, schemaDefinition];
}

function getContents(text: string, index: number) {
	let textLocal = text.slice(index).replace(/[\n\r]/g, "").replace(/\s+/g, "");
	let startOfContents = "[";
	let endOfContents = "]";
	let startOfContentsIdx = textLocal.indexOf(startOfContents) + endOfContents.length;
	let contents = textLocal.slice(startOfContentsIdx);
	contents = contents.slice(0, contents.indexOf(endOfContents));
	return contents;
}

function getSchemaDefinition(text: string, index: number) {
	let textLocal = text.slice(index).replace(/[\n\r]/g, "").replace(/\s+/g, "");

	let startOfSchema = "schema=StructType([";
	let endOfSchema = "]";
	let startOfSchemaIdx = textLocal.indexOf(startOfSchema) + startOfSchema.length;
	let schemaDefinition = textLocal.slice(startOfSchemaIdx);
	schemaDefinition = schemaDefinition.slice(0, schemaDefinition.indexOf(endOfSchema));
	schemaDefinition = (schemaDefinition.replace(/StructField\("/g, "")
		.replace(/",.+?\(\),(True|False)\)/g, " ")
		.replace(/,/g, "").slice(0, -1)
	); // slice to remove trailing space
	return schemaDefinition;
}

function formatMarkdownTable(header: string, contents: string) {
	let markdownTable: string = "|";
	markdownTable = formatHeader(markdownTable, header);
	markdownTable = formatContents(markdownTable, contents, header);
	return markdownTable;
}

function formatHeader(markdownTable: string, header: string) {
	for (let column of header.split(" ")) {
		markdownTable += column + "|";
	}
	markdownTable += "  \n|";
	for (let _ of header.split(" ")) {
		markdownTable += ":---:" + "|";
	}
	return markdownTable;
}

function formatContents(markdownTable: string, contents: string, header: string) {
	if (contents.includes("{")) {
		let headerArr = header.split(" ");
		markdownTable = parseDictContents(contents, markdownTable, headerArr);
		return markdownTable;
	}

	markdownTable = parseTupleContents(contents, markdownTable);
	return markdownTable;
}

function parseDictContents(contents: string, markdownTable: string, headerArr: string[]) {
	for (let row of contents.split("},{")) {
		markdownTable += "  \n|";
		if (row.endsWith("},")) { row = row.slice(0, -2); }

		for (let headerColumn of headerArr) {
			let start = row.indexOf("\"" + headerColumn + "\"");
			if (start === -1) {
				markdownTable += "null |";
				continue;
			}
			let startOfColumnContents = row.slice(start + headerColumn.length + 3);
			let nScopes = 0;
			for (let character of startOfColumnContents) {
				if ((nScopes === 0) && (character === ",")) {
					break;
				}
				markdownTable += character;
				if (character === "(") { nScopes += 1; }
				else if (character === ")") { nScopes -= 1; }
			}
			markdownTable += "|";

		}
	}
	return markdownTable;
}

function parseTupleContents(contents: string, markdownTable: string) {
	for (let row of contents.split("),(")) {
		markdownTable += "  \n|";
		if (row.startsWith("(")) { row = row.slice(1); }
		if (row.endsWith("),")) { row = row.slice(0, -2); }

		let nScopes = 0;
		for (let character of row) {
			if ((nScopes === 0) && (character === ",")) {
				markdownTable += "|";
				continue;
			}
			markdownTable += character;
			if (character === "(") { nScopes += 1; }
			else if (character === ")") { nScopes -= 1; }
		}
	}
	return markdownTable;
}
