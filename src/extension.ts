
import { start } from 'repl';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "pyspark-dataframe-visualizer" is now active!');

	let hover = vscode.languages.registerHoverProvider("python", {
        provideHover(document, position, token) {
			let dataframes = findAllDataframes(document);
			if (dataframes.length === 0) {return;}

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
export function deactivate() {}

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
		markdownTable += "---" + "|";
	}
	return markdownTable;
}

function formatContents(markdownTable: string, contents: string, header: string) {
	let headerArr = header.split(" ");
	if (contents.includes("{")) {
		// dictionary parsing
		for (let row of contents.split("},{")) {
			markdownTable += "  \n|"
			for (let headerColumn of headerArr) {
				let start=row.indexOf(headerColumn);
				if (start === -1) {
					markdownTable +=  "null |";
					continue;
				}
				let temp = row.slice(start);
				temp = temp.slice(temp.indexOf(":"), temp.indexOf(","));
				markdownTable += temp + "|"
			}
		}
		return markdownTable;
	}

	// tuple parsing
	for (let row of contents.split("),(")) {
		markdownTable += "  \n|"
		for (let column of row.split(",")) {
			markdownTable += column + "|";
		}
	}
	return markdownTable;
}

function findAllDataframes(document: vscode.TextDocument) {
	let text = document.getText();
	let regex = RegExp("createDataFrame\\(","gm");
	let dataframeDefinition: RegExpExecArray | null;
	let dataframeArray: [number,number, string, string][] = [];


	while ((dataframeDefinition = regex.exec(text)) !== null) {
		let firstLineNumber=text.slice(0,dataframeDefinition.index).split("\n").length  -1;
		let [contents, schemaDefinition] = parseDataFrame(text, dataframeDefinition.index);

		let lastLineNumber=text.slice(0,dataframeDefinition.lastIndex).split("\n").length - 1;

		console.log(`found ${dataframeDefinition[0]} at line ${firstLineNumber}`);
		dataframeArray.push([firstLineNumber, lastLineNumber, contents, schemaDefinition]);
	}
	return dataframeArray;
}

function parseDataFrame(text: string, index: number) {
	let contents = getContents(text, index);
	let schemaDefinition = getSchemaDefinition(text, index);

	return [contents, schemaDefinition];


function getContents(text: string, index: number) {
	let textLocal = text.slice(index).replace(/[\n\r]/g,"").replace(/\s+/g,"");
	let startOfContents = "[";
	let endOfContents = "]";
	let startOfContentsIdx = textLocal.indexOf(startOfContents) + endOfContents.length;
	let contents = textLocal.slice(startOfContentsIdx);
	contents = contents.slice(0, contents.indexOf(endOfContents));
	return contents;
}

function getSchemaDefinition(text: string, index: number) {
	let textLocal = text.slice(index).replace(/[\n\r]/g,"").replace(/\s+/g,"");
							 
	let startOfSchema = "schema=StructType([";
	let endOfSchema = "]";
	let startOfSchemaIdx = textLocal.indexOf(startOfSchema) + startOfSchema.length;
	let schemaDefinition = textLocal.slice(startOfSchemaIdx);
	schemaDefinition = schemaDefinition.slice(0, schemaDefinition.indexOf(endOfSchema));
	schemaDefinition = schemaDefinition.replace(/StructField\("/g,"").replace(/",.+?\(\),(True|False)\)/g," ").replace(/,/g,"");

	return schemaDefinition;

}





}

// const decorationType = vscode.window.createTextEditorDecorationType({  backgroundColor: 'green',
// border: '2px solid white',});


// class DataFrameDisplayer {
// 	private decorationTypeArray: vscode.TextEditorDecorationType[]
// 	private decorationType_empty: vscode.TextEditorDecorationType
// 	private dataframeArray: RegExpExecArray[]

// 	constructor() {
// 		this.decorationTypeArray = []
// 		this.decorationType_empty = vscode.window.createTextEditorDecorationType({after: {}})
// 		this.dataframeArray = []
// 		vscode.workspace.onDidChangeTextDocument(ev => this.clear_highlights(ev.document))
// 		//vscode.window.onDidChangeActiveTextEditor(ev => this.run(ev?.document));
// 	}

// 	public run(document: vscode.TextDocument) {
// 		this.findAllDataframes(document)
// 		this.clear_highlights()
// 		this.displayFormattedDataframe()

// 		new vscode.Hover("display dataframe here")
// 		}

// 	private clear_highlights() {
// 		console.log("test")
// 		console.log(this.decorationTypeArray)
// 		vscode.window.visibleTextEditors.forEach(textEditor => {
// 			this.decorationTypeArray.forEach(decorationType => {
// 				textEditor.setDecorations(decorationType, []);
// 			})
// 		});
// 	}

// 	private displayFormattedDataframe() {

// 		let decorationTypeArray: vscode.TextEditorDecorationType[] = [];
// 		let decorationType = vscode.window.createTextEditorDecorationType({
// 			after: {contentText: "There's a dataframe here."},
// 			backgroundColor: 'green',
// 			border: '2px solid white',
// 		});

// 		decorationTypeArray.push(decorationType)

// 		let decorationsArray: vscode.DecorationOptions[] = []
// 		for (let dataframe of this.dataframeArray) {

// 			this.parseDataframe()
// 			this.createDisplayFormat()

// 			const line = dataframe.input.substring(0,dataframe.index).match(/\n/g).length
// 			let range = new vscode.Range(
// 				new vscode.Position(line, 120),
// 				new vscode.Position(line, 120),
// 				)
// 			let decoration = { range }

// 			decorationsArray.push(decoration)
// 			vscode.window.visibleTextEditors.forEach(editor => {
// 				editor.setDecorations(decorationType, decorationsArray);
// 			});
// 		}

// 		this.decorationTypeArray = decorationTypeArray


// 	}

// 	private parseDataframe() {}

// 	private createDisplayFormat() {}

// 	// function displayDataFrameDetection(dataframeArray) {
// 	// 	let decorationsArray: vscode.DecorationOptions[] = []
// 	// 	for (let dataframe of dataframeArray) {
// 	// 		const line = dataframe.input.substring(0,dataframe.index).match(/\n/g).length
// 	// 		let beginning_of_line = dataframe.input.substring(0, dataframe.index).lastIndexOf("\n")
// 	// 		let range = new vscode.Range(
// 	// 			new vscode.Position(line, dataframe.index - beginning_of_line - 1),
// 	// 			new vscode.Position(line, dataframe.index - beginning_of_line + dataframe[0].length),
// 	// 			)
// 	// 		let decoration = { range }
// 	// 		decorationsArray.push(decoration)
// 	// 		vscode.window.visibleTextEditors.forEach(editor => {
// 	// 			editor.setDecorations(decorationType, decorationsArray);
// 	// 		});
// 	// 	}
// 	//}
// }