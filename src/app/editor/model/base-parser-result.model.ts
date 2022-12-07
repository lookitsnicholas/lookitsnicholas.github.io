import { EditorOutlineNodeModel } from "./editor-outline-node.model"
import { EditorRowModel } from "./editor-row.model"

export class BaseParserResultModel {

	constructor(
		public isContainingError: boolean,
		public outline: EditorOutlineNodeModel,
		public rowAndColumns: EditorRowModel[]
	) { }

}