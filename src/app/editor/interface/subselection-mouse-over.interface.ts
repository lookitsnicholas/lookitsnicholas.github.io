import { EditorElementNodeModel } from "../model/editor-element-node.model"
import { EditorOutlineNodeModel } from "../model/editor-outline-node.model"

export interface SubselectionMouseOverInterface {
	event: MouseEvent
	node: EditorElementNodeModel | EditorOutlineNodeModel | null
}