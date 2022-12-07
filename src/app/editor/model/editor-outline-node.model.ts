export class EditorOutlineNodeModel {

	constructor(
		public element: string,
		public startSourceIndex: number,
		public endSourceIndex: number,
		public children: EditorOutlineNodeModel[],
		public isExpanded: boolean = false
	) { }

}