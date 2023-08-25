
import { start } from 'repl';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "pyspark-dataframe-visualizer" is now active!');

	let hover = vscode.languages.registerHoverProvider("python", {
        provideHover(document, position, token) {
			let dataframes = findAllDataframes(document);
			if (dataframes.length === 0) {return;}

			for (let dataframe of dataframes) {
				if ((position.line < dataframe[1]) ||
				 (position.line > dataframe[2])) {
					continue;
				}
				const range = document.getWordRangeAtPosition(position);
				const word = document.getText(range);
				return new vscode.Hover(dataframe[4] + "  \n" + dataframe[3]);
			}



			}
		});
	context.subscriptions.push(hover);

	//let dd = new DataFrameDisplayer()
}
export function deactivate() {}

function findAllDataframes(document: vscode.TextDocument) {
	let text = document.getText();
	let regex = RegExp("createDataFrame\\(","gm");
	let dataframeDefinition;
	let dataframeArray = [];


	while ((dataframeDefinition = regex.exec(text)) !== null) {
		let firstLineNumber=text.slice(0,dataframeDefinition.index).split("\n").length  -1;
		let [contents, schema_definition] = parseDataFrame(text, dataframeDefinition.index);

		let lastLineNumber=text.slice(0,dataframeDefinition.lastIndex).split("\n").length - 1;

		console.log(`found ${dataframeDefinition[0]} at line ${firstLineNumber}`);
		dataframeArray.push([dataframeDefinition, firstLineNumber, lastLineNumber, contents, schema_definition]);
	}
	return dataframeArray;
}

function parseDataFrame(text:string, index) {
	let contents = get_contents(text, index);
	let schema_definition = get_schema_definition(text, index);

	return [contents, schema_definition];


function get_contents(text, index) {
	let text_local = text.slice(index).replace(/[\n\r]/g,"").replace(/\s+/g,"");
	let start_of_contents = "[";
	let end_of_contents = "]";
	let startOfContentsIdx = text_local.indexOf(start_of_contents) + end_of_contents.length;
	let contents = text_local.slice(startOfContentsIdx);
	contents = contents.slice(0, contents.indexOf(end_of_contents));
	return contents;
}

function get_schema_definition(text, index) {
	let text_local = text.slice(index).replace(/[\n\r]/g,"").replace(/\s+/g,"");
							 
	let start_of_schema = "schema=StructType([";
	let end_of_schema = "]";
	let startOfSchemaIdx = text_local.indexOf(start_of_schema) + start_of_schema.length;
	let schema_definition = text_local.slice(startOfSchemaIdx);
	schema_definition = schema_definition.slice(0, schema_definition.indexOf(end_of_schema));
	schema_definition = schema_definition.replace(/StructField\("/g,"").replace(/",.+?\(\),(True|False)\)/g," ");
	return schema_definition;

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