import { BaseParserInterface } from "../../interface/base-parser.interface"
import { BaseParserResultModel } from "../base-parser-result.model"
import { CharacterNodeModel } from "../character-node.model"
import { EditorElementNodeModel } from "../editor-element-node.model"
import { EditorOutlineNodeModel } from "../editor-outline-node.model"
import { EditorRowModel } from "../editor-row.model"
import { PreferencesModel } from "../preferences.model"

const selfClosingTagMap: Record<string, 1> = ({
	area: 1,
	base: 1,
	br: 1,
	col: 1,
	embed: 1,
	hr: 1,
	img: 1,
	input: 1,
	link: 1,
	meta: 1,
	param: 1,
	source: 1,
	track: 1,
	wbr: 1,
	command: 1,
	keygen: 1,
	menuitem: 1,
	// li: 1
} as const)

export class HtmlParserModel implements BaseParserInterface {

	parse(
		preferences: PreferencesModel,
		sourceStr: string
	): BaseParserResultModel {

		const currentTheme = preferences.theme
		let currentColour = currentTheme.text
		let currentElementNode = new EditorElementNodeModel(
			"document (root)",
			0,
			0,
			[],
			null,
			[]
		)

		let isCharRendered = false
		let isEnclosingComment = false
		let isContainingError = false

		let currentOpeningTag = ""
		const currentOpeningCharacterNodes: CharacterNodeModel[] = []
		const currentOpeningTags: string[] = []

		let isTrackingOpeningTag = false
		let isTrackingAttributes = false
		let isTrackingAttributeNames = false
		let enclosingAttributeNameChar = null
		let isEnclosingAttributeNames = false
		let currentAttribute = ""
		const currentAttributes: string[] = []
		let currentAttributeName = ""
		let isTrackingSelfClosingTag = false

		let currentClosingTag = ""
		let isGreedyClosingTagSet = false
		let isTrackingClosingTag = false

		const newLineStrLength = preferences.newLineStr.length
		const rowAndColumns = [
			new EditorRowModel(
				0,
				0,
				[]
			)
		]
		let currentRow = rowAndColumns[0]
		let i = 0

		const enclosedAttributeDelimiterMap: Record<string, 1> = {
			'"': 1,
			"'": 1
		}
		const whitespaceDelimiterMap: Record<string, 1> = {
			" ": 1,
			"\t": 1,
			[preferences.newLineStr]: 1
		}

		function setIsContainingError() {
			currentColour = currentTheme.errorText
			isContainingError = true
		}

		const getLastCurrentOpeningTag = () => (currentOpeningTags[(currentOpeningTags.length - 1)])

		function getIsSelfClosingTagOrSetError(openingTag: string) {
			const isValid = !!selfClosingTagMap[openingTag.toLocaleLowerCase()]
			if (!isValid)
				setIsContainingError()
			return isValid
		}

		function mergeTagAndResetCurrentColour() {
			currentRow.editorNodes.push(
				new CharacterNodeModel(
					">",
					currentTheme.tag,
					null
				)
			)
			currentColour = currentTheme.text
			currentElementNode.endSourceIndex++
			currentRow.endSourceIndex++
			i++
			isCharRendered = true
		}

		function navigateToElementNodeNewChild(pendingIsTrackingAttributes: boolean) {
			currentOpeningTags.push(currentOpeningTag)
			const pendingNodeChild = new EditorElementNodeModel(
				currentOpeningTag,
				(i - currentOpeningTag.length - 1),
				i,
				[],
				currentElementNode,
				[]
			)
			currentElementNode.children.push(pendingNodeChild)
			currentElementNode = pendingNodeChild
			currentOpeningCharacterNodes.forEach(characterNode => (characterNode.elementNode = currentElementNode))
			currentOpeningCharacterNodes.length = 0
			currentOpeningTag = ""
			if ((isTrackingAttributes = pendingIsTrackingAttributes))
				currentColour = currentTheme.attribute
			isTrackingOpeningTag = false
		}

		function mergeCurrentAttributes() {
			mergeCurrentAttribute()
			currentElementNode.attributes.push(...currentAttributes)
			currentAttributes.length = 0
			isTrackingAttributes = false
		}

		function mergeCurrentAttribute() {
			if (!!currentAttribute.length)
				currentAttributes.push(currentAttribute)
			currentAttribute = ""
		}

		function navigateToElementNodeParent() {
			(currentElementNode = currentElementNode.parent!).endSourceIndex = (currentElementNode.endSourceIndex = i)
			currentOpeningTags.splice((currentOpeningTags.length - 1), 1)
		}

		while ((i < sourceStr.length)) {
			isCharRendered = false
			const currentChar = sourceStr.charAt(i)
			const seekAheadReturnStr = sourceStr.slice(i, (i + newLineStrLength))
			if ((preferences.newLineStr === seekAheadReturnStr)) {
				currentRow.endSourceIndex += newLineStrLength
				i += newLineStrLength
				rowAndColumns.push(
					new EditorRowModel(
						currentRow.endSourceIndex,
						currentRow.endSourceIndex,
						[]
					)
				)
				currentRow = rowAndColumns[(rowAndColumns.length - 1)]
				isCharRendered = true
			} else {
				if (isEnclosingComment) {
					if ((currentChar === "-")) {
						const seekAheadOpeningCommentStr = sourceStr.slice(i, (i + 3))
						if ((seekAheadOpeningCommentStr === "-->")) {
							currentRow.editorNodes.push(
								new CharacterNodeModel(
									"-",
									currentColour,
									null
								),
								new CharacterNodeModel(
									"-",
									currentColour,
									null
								),
								new CharacterNodeModel(
									">",
									currentColour,
									null
								)
							)
							currentColour = currentTheme.text
							currentElementNode.endSourceIndex += 3
							currentRow.endSourceIndex += 3
							i += 3
							isCharRendered = !(isEnclosingComment = false)
						}
					}

				} else if (!isContainingError) {

					if (isTrackingOpeningTag) {
						if ((!!whitespaceDelimiterMap[currentChar] || (currentChar === "/") || (currentChar === ">"))) {
							if (!!currentOpeningTag.length) {
								if ((currentChar === "/")) {
									if (getIsSelfClosingTagOrSetError(currentOpeningTag)) {
										isTrackingSelfClosingTag = true
										navigateToElementNodeNewChild(false)
									}
								} else if (!!selfClosingTagMap[currentOpeningTag.toLocaleLowerCase()]) {
									if ((currentChar === ">")) {
										mergeTagAndResetCurrentColour()
										navigateToElementNodeNewChild(false)
										navigateToElementNodeParent()
									} else
										navigateToElementNodeNewChild(true)
								} else {
									navigateToElementNodeNewChild(!!whitespaceDelimiterMap[currentChar])
									if ((currentChar === ">"))
										mergeTagAndResetCurrentColour()
								}
							} else {
								if (((currentChar === "/") && !!currentOpeningTags.length))
									isTrackingClosingTag = !(isTrackingOpeningTag = false)
								else
									setIsContainingError()
							}
						} else
							//TODO NICK: add regex
							currentOpeningTag += currentChar
					} else if (isTrackingAttributes) {
						if (isEnclosingAttributeNames) {
							if ((currentChar === enclosingAttributeNameChar)) {
								currentRow.editorNodes.push(
									new CharacterNodeModel(
										enclosingAttributeNameChar,
										currentColour,
										null
									)
								)
								currentColour = currentTheme.text
								currentElementNode.endSourceIndex++
								currentRow.endSourceIndex++
								i++
								isCharRendered = true
								currentColour = currentTheme.attribute
								enclosingAttributeNameChar = null
								isEnclosingAttributeNames = (isTrackingAttributeNames = false)
							}
						} else if (isTrackingAttributeNames) {
							if (!!enclosedAttributeDelimiterMap[currentChar]) {
								if (!!currentAttributeName.length)
									setIsContainingError()
								else {
									currentColour = currentTheme.attributeName
									enclosingAttributeNameChar = currentChar
									isEnclosingAttributeNames = true
								}
								currentAttributeName = ""
							} else
								//TODO NICK: add regex
								currentAttributeName += currentChar
						} else if ((!!whitespaceDelimiterMap[currentChar] && !!currentAttribute.length))
							mergeCurrentAttribute()
						else if (!!enclosedAttributeDelimiterMap[currentChar]) {
							currentAttribute = ""
							currentElementNode.attributes.push(...currentAttributes)
							currentAttributes.length = 0
							setIsContainingError()
						} else if ((currentChar === "=")) {
							if (!currentAttribute.length)
								setIsContainingError()
							else {
								mergeCurrentAttribute()
								isTrackingAttributeNames = true
							}
							currentAttribute = ""
						} else if ((currentChar === "<")) {
							currentAttribute = ""
							currentElementNode.attributes.push(...currentAttributes)
							currentAttributes.length = 0
							setIsContainingError()
						} else if ((currentChar === "/")) {
							mergeCurrentAttributes()
							if (getIsSelfClosingTagOrSetError(getLastCurrentOpeningTag())) {
								currentColour = currentTheme.tag
								isTrackingSelfClosingTag = true
							}
						} else if ((currentChar === ">")) {
							mergeCurrentAttributes()
							mergeTagAndResetCurrentColour()
							if (!!selfClosingTagMap[getLastCurrentOpeningTag().toLocaleLowerCase()])
								navigateToElementNodeParent()
						} else
							currentAttribute += currentChar
					} else if (isTrackingSelfClosingTag) {
						if ((currentChar === ">")) {
							mergeTagAndResetCurrentColour()
							navigateToElementNodeParent()
							isTrackingSelfClosingTag = false
						} else
							setIsContainingError()
					} else if (isTrackingClosingTag) {
						currentClosingTag += currentChar
						const lastCurrentOpeningTag = getLastCurrentOpeningTag()
						if (!lastCurrentOpeningTag) {
							currentClosingTag = ""
							setIsContainingError()
						} else if ((currentClosingTag === lastCurrentOpeningTag)) {
							currentClosingTag = ""
							isGreedyClosingTagSet = !(isTrackingClosingTag = false)
						} else if ((currentClosingTag !== lastCurrentOpeningTag.slice(0, currentClosingTag.length))) {
							currentClosingTag = ""
							setIsContainingError()
						}
					} else if (isGreedyClosingTagSet) {
						if ((currentChar === ">")) {
							mergeTagAndResetCurrentColour()
							navigateToElementNodeParent()
							isGreedyClosingTagSet = (isTrackingClosingTag = false)
						} else if (!whitespaceDelimiterMap[currentChar])
							setIsContainingError()
					} else if ((currentChar === "<")) {
						const seekAheadOpeningCommentStr = sourceStr.slice(i, (i + 4))
						if ((seekAheadOpeningCommentStr === "<!--")) {
							currentColour = currentTheme.comment
							currentRow.editorNodes.push(
								new CharacterNodeModel(
									"<",
									currentColour,
									null
								),
								new CharacterNodeModel(
									"!",
									currentColour,
									null
								),
								new CharacterNodeModel(
									"-",
									currentColour,
									null
								),
								new CharacterNodeModel(
									"-",
									currentColour,
									null
								)
							)
							currentElementNode.endSourceIndex += 4
							currentRow.endSourceIndex += 4
							i += 4
							isCharRendered = (isEnclosingComment = true)
						} else {
							currentColour = currentTheme.tag
							isTrackingOpeningTag = true
						}
					}

				}

				if (!isCharRendered) {
					const characterNodeModel = new CharacterNodeModel(
						currentChar,
						currentColour,
						null
					)
					if (((currentChar !== "<") && !isContainingError && isTrackingOpeningTag))
						currentOpeningCharacterNodes.push(characterNodeModel)
					currentRow.editorNodes.push(characterNodeModel)
					currentElementNode.endSourceIndex++
					currentRow.endSourceIndex++
					i++
				}
			}
		}

		while (!!currentElementNode.parent)
			currentElementNode = currentElementNode.parent
		const orphanElementNode = (elementNode: EditorElementNodeModel) => delete (elementNode as any).parent
		orphanElementNode(currentElementNode)
		const nodeChildren: EditorElementNodeModel[] = []
		nodeChildren.push(...currentElementNode.children)
		while (!!nodeChildren.length) {
			const nodeChildrenLength = nodeChildren.length
			for (let i = 0; (i < nodeChildrenLength); i++) {
				const currentNodeChild = nodeChildren[0]
				orphanElementNode(currentNodeChild)
				nodeChildren.shift()
				nodeChildren.push(...currentNodeChild.children)
			}
		}

		function mapOutlineNodeProperties(elementNode: any) {
			const allowedPropertyNames: Record<string, 1> = {
				"element": 1,
				"children": 1,
				"startSourceIndex": 1,
				"endSourceIndex": 1
			}
			Object.keys(elementNode)
				.forEach(propertyName => {
					if (!allowedPropertyNames[propertyName])
						delete elementNode[propertyName]
				})
			elementNode.isExpanded = false
		}
		const outlineNode: any = JSON.parse(JSON.stringify(currentElementNode))
		mapOutlineNodeProperties(outlineNode)
		const outlineNodeChildren: any[] = []
		outlineNodeChildren.push(...outlineNode.children)
		while (!!outlineNodeChildren.length) {
			const editorNodeChildrenLength = outlineNodeChildren.length
			for (let i = 0; (i < editorNodeChildrenLength); i++) {
				const currentOutlineNodeChild = outlineNodeChildren[0]
				mapOutlineNodeProperties(currentOutlineNodeChild)
				outlineNodeChildren.shift()
				outlineNodeChildren.push(...currentOutlineNodeChild.children)
			}
		}

		const associateElementNodeChildrenWithParent = (elementNode: EditorElementNodeModel) => elementNode.children.forEach(nodeChild => (nodeChild.parent = elementNode))
		nodeChildren.length = 0
		nodeChildren.push(...currentElementNode.children)
		currentElementNode.parent = null
		associateElementNodeChildrenWithParent(currentElementNode)
		while (!!nodeChildren.length) {
			const nodeChildrenLength = nodeChildren.length
			for (let i = 0; (i < nodeChildrenLength); i++) {
				const currentNodeChild = nodeChildren[0]
				associateElementNodeChildrenWithParent(currentNodeChild)
				nodeChildren.shift()
				nodeChildren.push(...currentNodeChild.children)
			}
		}

		return new BaseParserResultModel(
			isContainingError,
			(outlineNode as EditorOutlineNodeModel),
			rowAndColumns
		)

	}

}