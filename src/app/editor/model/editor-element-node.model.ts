export class EditorElementNodeModel {

	constructor(
		public element: string,
		public startSourceIndex: number,
		public endSourceIndex: number,
		public children: EditorElementNodeModel[],
		public parent: EditorElementNodeModel | null,
		public attributes: string[],
	) { }

}