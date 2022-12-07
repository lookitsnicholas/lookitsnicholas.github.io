import { CharacterNodeModel } from "./character-node.model"

export class EditorRowModel {

	constructor(
		public startSourceIndex: number,
		public endSourceIndex: number,
		public editorNodes: CharacterNodeModel[]
	) { }

}