
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "pyspark-dataframe-visualizer" is now active!');

	let hover = vscode.languages.registerHoverProvider("python", {
        provideHover(document, position, token) {
			let dataframes = findAllDataframes(document)
			if (dataframes.length == 0) {return}

			for (let dataframe of dataframes) {
				if ((position.line < dataframe[1]) ||
				 (position.line > dataframe[2])) {
					continue
				}
				const range = document.getWordRangeAtPosition(position);
				const word = document.getText(range);
				return new vscode.Hover(word)
			}



			}
		})
	context.subscriptions.push(hover)

	//let dd = new DataFrameDisplayer()
}

export function deactivate() {}

function findAllDataframes(document: vscode.TextDocument) {
	const text = document.getText()
	let regex = RegExp("createDataFrame","g")
	let dataframe_definition
	let dataframeArray: Regexp= []


	while ((dataframe_definition = regex.exec(text)) !== null) {
		let first_line_number=text.slice(0,dataframe_definition.index).split("\n").length  -1
		let last_line_number=text.slice(0,dataframe_definition.lastIndex).split("\n").length - 1

		console.log(`found ${dataframe_definition[0]} at line ${first_line_number}`)
		dataframeArray.push([dataframe_definition, first_line_number, last_line_number])
	}
	return dataframeArray
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