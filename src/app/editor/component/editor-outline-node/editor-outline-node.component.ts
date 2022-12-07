import { Component, Input } from "@angular/core"
import { EditorOutlineNodeModel } from "../../model/editor-outline-node.model"
import { EditorService } from "../../service/editor.service"

@Component({
	selector: "editor-outline-node",
	templateUrl: "./editor-outline-node.component.html",
	styleUrls: ["./editor-outline-node.component.scss"]
})
export class EditorOutlineNodeComponent {

	@Input()
	editorOutlineNode: EditorOutlineNodeModel = null!

	@Input()
	depth = 0

	@Input()
	childDepth = 0

	constructor(
		private editorService: EditorService
	) { }

	ngOnInit() {
		this.childDepth = (this.depth + 1)
	}

	toggleIsExpanded(event: MouseEvent) {
		event.stopPropagation()
		if (!(this.editorOutlineNode.isExpanded = !this.editorOutlineNode.isExpanded)) {
			const nodeChildren: EditorOutlineNodeModel[] = []
			nodeChildren.push(...this.editorOutlineNode.children)
			while (!!nodeChildren.length) {
				const nodeChildrenLength = nodeChildren.length
				for (let i = 0; (i < nodeChildrenLength); i++) {
					const currentNodeChild = nodeChildren[0]
					currentNodeChild.isExpanded = false
					nodeChildren.shift()
					nodeChildren.push(...currentNodeChild.children)
				}
			}
		}
	}

	handleSubselectionMouseOver = (event: MouseEvent, node: EditorOutlineNodeModel | null) => this.editorService.subselectionMouseOverSubject.next({
		event: event,
		node: node
	})

	handleSubselectionMouseLeave = (event: MouseEvent) => this.editorService.subselectionMouseLeaveSubject.next(event)

}