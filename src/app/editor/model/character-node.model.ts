import { EditorElementNodeModel } from "./editor-element-node.model"

export class CharacterNodeModel {

	constructor(
		public data: string,
		public colour: string | null,
		public elementNode: EditorElementNodeModel | null
	) { }

}