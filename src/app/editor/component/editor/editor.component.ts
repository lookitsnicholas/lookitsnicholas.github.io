import { Component, HostListener, OnDestroy, OnInit } from "@angular/core"
import { Subscription } from "rxjs"
// import { page3 } from "src/app/util/test-html.pages"
import { createWriteStream } from "streamsaver"
import { BaseParserInterface } from "../../interface/base-parser.interface"
import { EditorThemeModel } from "../../interface/editor-theme.interface"
import { SubselectionMouseOverInterface } from "../../interface/subselection-mouse-over.interface"
import { CharacterNodeModel } from "../../model/character-node.model"
import { EditorElementNodeModel } from "../../model/editor-element-node.model"
import { EditorOutlineNodeModel } from "../../model/editor-outline-node.model"
import { EditorRowModel } from "../../model/editor-row.model"
import { EditorTab } from "../../model/editor-tab.model"
import { ParserLanguageAliases, ParserLanguageEnum, ParserLanguageEnumType } from "../../model/enum/parser-language.enum"
import { ThemeAliases, ThemeEnum, ThemeEnumType } from "../../model/enum/theme.enum"
import { HtmlParserModel } from "../../model/parser/html.parser"
import { PlaintextParserModel } from "../../model/parser/plaintext.parser"
import { PreferencesModel } from "../../model/preferences.model"
import { DarkTheme } from "../../model/theme/dark.theme"
import { LightTheme } from "../../model/theme/light.theme"
import { PurpleTheme } from "../../model/theme/purple.theme"
import { EditorService } from "../../service/editor.service"

@Component({
	selector: "editor",
	templateUrl: "./editor.component.html",
	styleUrls: ["./editor.component.scss"]
})

export class EditorComponent implements OnInit, OnDestroy {

	currentTabIndex = 0
	tabFilenames: string[] = []
	rowsAndColumns = [
		new EditorRowModel(
			0,
			0,
			[]
		)
	]
	isContainingError = false
	isEditorFocused = true
	isSubselectionEnabled = false
	properties = {
		selectedRowIndex: 0,
		selectedColumnIndex: 0
	}

	iframeSourceStr: string = ""
	// sourceStr: string = page3
	sourceStr: string = null!
	outline: EditorOutlineNodeModel = null!

	currentParserLanguage: ParserLanguageEnumType = ParserLanguageEnum.PLAINTEXT
	parserLanguages = (Object.values(ParserLanguageEnum) as ParserLanguageEnumType[])
	ParserLanguageAliases = ParserLanguageAliases
	languageParserMap = ({
		"HTML": new HtmlParserModel()
	} as Record<ParserLanguageEnumType, BaseParserInterface>)
	plaintextParser = new PlaintextParserModel()

	currentTheme: ThemeEnumType = ThemeEnum.LIGHT
	themes = (Object.values(ThemeEnum) as ThemeEnumType[])
	ThemeAliases = ThemeAliases
	themeMap: Record<ThemeEnumType, EditorThemeModel> = {
		"DARK": DarkTheme,
		"LIGHT": LightTheme,
		"PURPLE": PurpleTheme
	}
	lightTheme = LightTheme
	subscriptionMap: Record<string, Subscription> = {}

	constructor(
		private editorService: EditorService
	) { }

	ngOnInit(): void {
		this.subscriptionMap["subselectionMouseOver"] = this.editorService.subselectionMouseOverSubject.subscribe({
			next: (value: SubselectionMouseOverInterface) => this.handleSubselectionMouseOver(value.event, value.node)
		})
		this.subscriptionMap["subselectionMouseLeave"] = this.editorService.subselectionMouseLeaveSubject.subscribe({
			next: (event: MouseEvent) => this.handleSubselectionMouseLeave(event)
		})
		const tabFilenames: string[] = []
		for (let i = 0; (i < localStorage.length); i++) {
			const localStorageKey = localStorage.key(i)!
			if (!!localStorageKey.startsWith("file")) {
				const deserialisedTab: EditorTab = JSON.parse(localStorage.getItem(localStorageKey)!)
				tabFilenames[i] = deserialisedTab.filename
			}
		}
		this.tabFilenames = (!!tabFilenames.length ? tabFilenames : ["New File"])
		this.switchTab(0)
	}

	@HostListener("document:keydown", ["$event"])
	handleKeydown(event: KeyboardEvent) {
		if (this.isEditorFocused) {
			const newLineStrLength = newLineStr.length
			const properties = this.properties
			const rowsAndColumns = this.rowsAndColumns
			const selectedTheme = this.getSelectedTheme()
			if (((event.key === "ArrowUp") && !!properties.selectedRowIndex)) {
				const prevRow = rowsAndColumns[(properties.selectedRowIndex - 1)]
				properties.selectedColumnIndex = Math.min(properties.selectedColumnIndex, prevRow.editorNodes.length)
				properties.selectedRowIndex--
			} else if (((event.key === "ArrowDown") && (properties.selectedRowIndex < (rowsAndColumns.length - 1)))) {
				const nextRow = rowsAndColumns[(properties.selectedRowIndex + 1)]
				properties.selectedColumnIndex = Math.min(properties.selectedColumnIndex, nextRow.editorNodes.length)
				properties.selectedRowIndex++
			} else if (((event.key === "ArrowLeft") && (!!properties.selectedColumnIndex || !!properties.selectedRowIndex))) {
				if (!properties.selectedColumnIndex) {
					const prevRow = rowsAndColumns[(properties.selectedRowIndex - 1)]
					properties.selectedRowIndex--
					properties.selectedColumnIndex = prevRow.editorNodes.length
				} else
					properties.selectedColumnIndex--
			} else if ((
				(event.key === "ArrowRight") &&
				!(
					(properties.selectedRowIndex === (rowsAndColumns.length - 1)) &&
					(properties.selectedColumnIndex === rowsAndColumns[(rowsAndColumns.length - 1)].editorNodes.length)
				)
			)) {
				const nextRow = rowsAndColumns[(properties.selectedRowIndex + 1)]
				if ((!!nextRow && (properties.selectedColumnIndex === rowsAndColumns[properties.selectedRowIndex].editorNodes.length))) {
					properties.selectedColumnIndex = 0
					properties.selectedRowIndex++
				} else
					properties.selectedColumnIndex++
			} else if ((event.key === "Enter")) {
				const selectedRow = rowsAndColumns[properties.selectedRowIndex]
				const newLineInsertionIndex = (selectedRow.startSourceIndex + properties.selectedColumnIndex)
				this.sourceStr = (this.sourceStr.slice(0, newLineInsertionIndex) + newLineStr + this.sourceStr.slice(newLineInsertionIndex))
				const isNewLineContainingReturn = (properties.selectedRowIndex !== (rowsAndColumns.length - 1))
				if (!!selectedRow.editorNodes.length) {
					const deletedNodes = selectedRow.editorNodes.splice(properties.selectedColumnIndex, (selectedRow.editorNodes.length - properties.selectedColumnIndex))
					selectedRow.endSourceIndex += ((isNewLineContainingReturn ? 0 : newLineStrLength) - deletedNodes.length)
					rowsAndColumns.splice(
						(properties.selectedRowIndex + 1),
						0,
						new EditorRowModel(
							selectedRow.endSourceIndex,
							(selectedRow.endSourceIndex + deletedNodes.length + (isNewLineContainingReturn ? newLineStrLength : 0)),
							deletedNodes
						)
					)
					properties.selectedColumnIndex = 0
				} else {
					selectedRow.endSourceIndex += newLineStrLength
					this.rowsAndColumns.splice(
						(properties.selectedRowIndex + 1),
						0,
						new EditorRowModel(
							selectedRow.endSourceIndex,
							(selectedRow.endSourceIndex + (isNewLineContainingReturn ? newLineStrLength : 0)),
							[]
						)
					)
				}
				properties.selectedRowIndex++
				this.handleSourceStrParse()
			} else if ((event.key === "Tab")) {
				//TODO NICK: copy this everywhere...?
				event.preventDefault()
				const selectedRow = rowsAndColumns[properties.selectedRowIndex]
				if (event.shiftKey) {
					if (this.sourceStr.slice(selectedRow.startSourceIndex, (selectedRow.startSourceIndex + 1)) === "\t") {
						this.sourceStr = (this.sourceStr.slice(0, selectedRow.startSourceIndex) + this.sourceStr.slice((selectedRow.startSourceIndex + 1)))
						properties.selectedColumnIndex--
						selectedRow.endSourceIndex--
						this.handleSourceStrParse()
					}
				} else {
					const selectedRow = rowsAndColumns[properties.selectedRowIndex]
					const newCharInsertionIndex = (selectedRow.startSourceIndex + properties.selectedColumnIndex)
					this.sourceStr = (this.sourceStr.slice(0, newCharInsertionIndex) + "\t" + this.sourceStr.slice(newCharInsertionIndex))
					selectedRow.editorNodes.splice(
						properties.selectedColumnIndex,
						0,
						new CharacterNodeModel(
							"\t",
							selectedTheme.text,
							null
						)
					)
					properties.selectedColumnIndex++
					selectedRow.endSourceIndex++
					this.handleSourceStrParse()
				}
			} else if (((event.key === "Backspace") && (!!properties.selectedRowIndex || !!properties.selectedColumnIndex))) {
				const selectedRow = rowsAndColumns[properties.selectedRowIndex]
				if (!!properties.selectedColumnIndex) {
					const charRemovalIndex = (selectedRow.startSourceIndex + properties.selectedColumnIndex - 1)
					this.sourceStr = this.sourceStr.slice(0, charRemovalIndex) + this.sourceStr.slice((charRemovalIndex + 1))
					selectedRow.editorNodes.splice(--properties.selectedColumnIndex, 1)
					selectedRow.endSourceIndex--
				} else {
					const prevRow = rowsAndColumns[--properties.selectedRowIndex]
					const newLineRemovalIndex = (prevRow.endSourceIndex - newLineStrLength)
					this.sourceStr = (this.sourceStr.slice(0, newLineRemovalIndex) + this.sourceStr.slice(prevRow.endSourceIndex))
					properties.selectedColumnIndex = prevRow.editorNodes.length
					prevRow.endSourceIndex += (selectedRow.endSourceIndex - selectedRow.startSourceIndex - newLineStrLength)
					prevRow.editorNodes.push(...rowsAndColumns.splice((properties.selectedRowIndex + 1), 1)[0].editorNodes)
				}
				this.handleSourceStrParse()
			} else if ((event.key === "Delete") &&
				!(
					(properties.selectedRowIndex === (rowsAndColumns.length - 1)) &&
					(properties.selectedColumnIndex === rowsAndColumns[(rowsAndColumns.length - 1)].editorNodes.length)
				)) {
				const selectedRow = rowsAndColumns[properties.selectedRowIndex]
				if ((properties.selectedColumnIndex === selectedRow.editorNodes.length)) {
					const nextRow = rowsAndColumns[(properties.selectedRowIndex + 1)]
					const newLineRemovalIndex = (selectedRow.endSourceIndex - newLineStrLength)
					this.sourceStr = (this.sourceStr.slice(0, newLineRemovalIndex) + this.sourceStr.slice(newLineRemovalIndex + newLineStrLength))
					selectedRow.endSourceIndex += (nextRow.endSourceIndex - nextRow.startSourceIndex - newLineStrLength)
					selectedRow.editorNodes.push(...rowsAndColumns.splice((properties.selectedRowIndex + 1), 1)[0].editorNodes)
				} else {
					const charRemovalIndex = (selectedRow.startSourceIndex + properties.selectedColumnIndex)
					selectedRow.editorNodes.splice(charRemovalIndex, 1)
					this.sourceStr = (this.sourceStr.slice(0, charRemovalIndex) + this.sourceStr.slice((charRemovalIndex + 1)))
					selectedRow.endSourceIndex--
				}
				this.handleSourceStrParse()
			}
		}
	}

	@HostListener("document:keypress", ["$event"])
	async handleKeypress(event: KeyboardEvent) {
		if (this.isEditorFocused) {
			const properties = this.properties
			const rowsAndColumns = this.rowsAndColumns
			const selectedTheme = this.getSelectedTheme()
			if ((!!event.charCode && (event.key.length === 1))) {
				if (((event.key === "/") && event.ctrlKey)) {
					const currentRow = rowsAndColumns[properties.selectedRowIndex]
					const newLineStrOffset = ((properties.selectedRowIndex === (rowsAndColumns.length - 1)) ? 0 : newLineStr.length)
					if (((this.sourceStr.slice(currentRow.startSourceIndex, (currentRow.startSourceIndex + 4)) === "<!--") &&
						(this.sourceStr.slice((currentRow.endSourceIndex - 3 - newLineStrOffset), (currentRow.endSourceIndex - newLineStrOffset)) === "-->"))) {
						currentRow.editorNodes.splice(0, 4)
						currentRow.editorNodes.length += - 3
						properties.selectedColumnIndex = Math.max(0, (properties.selectedColumnIndex - 7))
						this.sourceStr = (this.sourceStr.slice(0, currentRow.startSourceIndex) + this.sourceStr.slice((currentRow.startSourceIndex + 4), (currentRow.endSourceIndex - 3 - newLineStrOffset)) +
							this.sourceStr.slice(currentRow.endSourceIndex - newLineStrOffset))
						currentRow.endSourceIndex -= 7
					} else {
						currentRow.editorNodes.splice(
							0,
							0,
							new CharacterNodeModel(
								"<",
								selectedTheme.comment,
								null
							),
							new CharacterNodeModel(
								"!",
								selectedTheme.comment,
								null
							),
							new CharacterNodeModel(
								"-",
								selectedTheme.comment,
								null
							),
							new CharacterNodeModel(
								"-",
								selectedTheme.comment,
								null
							)
						)
						currentRow.editorNodes.push(
							new CharacterNodeModel(
								"-",
								selectedTheme.comment,
								null
							),
							new CharacterNodeModel(
								"-",
								selectedTheme.comment,
								null
							),
							new CharacterNodeModel(
								">",
								selectedTheme.comment,
								null
							)
						)
						this.sourceStr = (this.sourceStr.slice(0, currentRow.startSourceIndex) + "<!--" + this.sourceStr.slice(currentRow.startSourceIndex, (currentRow.endSourceIndex - newLineStrOffset)) +
							"-->" + this.sourceStr.slice((currentRow.endSourceIndex - newLineStrOffset)))
						currentRow.endSourceIndex += 7
					}
				} else if ((event.key === "v") && (event.ctrlKey || event.metaKey)) {
					const clipboardText = await navigator.clipboard.readText()
					const selectedRow = rowsAndColumns[properties.selectedRowIndex]
					const newCharInsertionIndex = (selectedRow.startSourceIndex + properties.selectedColumnIndex)
					this.sourceStr = (this.sourceStr.slice(0, newCharInsertionIndex) + clipboardText + this.sourceStr.slice(newCharInsertionIndex))
				} else {
					const selectedRow = rowsAndColumns[properties.selectedRowIndex]
					const newCharInsertionIndex = (selectedRow.startSourceIndex + properties.selectedColumnIndex)
					this.sourceStr = (this.sourceStr.slice(0, newCharInsertionIndex) + event.key + this.sourceStr.slice(newCharInsertionIndex))
					rowsAndColumns[properties.selectedRowIndex].editorNodes.splice(
						properties.selectedColumnIndex,
						0,
						new CharacterNodeModel(
							event.key,
							selectedTheme.text,
							null
						)
					)
					properties.selectedColumnIndex++
					selectedRow.endSourceIndex++
				}
				this.handleSourceStrParse()
			}
		}
	}

	mergeSelectedNode(event: MouseEvent, destinationColumnIndex: number, destinationRowIndex: number) {
		event.stopPropagation()
		this.isEditorFocused = true
		this.properties.selectedColumnIndex = 0
		this.properties.selectedRowIndex = destinationRowIndex
		this.properties.selectedColumnIndex = destinationColumnIndex
	}

	async handleSourceStrParse() {
		const result = (this.languageParserMap[this.currentParserLanguage] || this.plaintextParser)
			.parse(
				new PreferencesModel(
					newLineStr,
					this.getSelectedTheme()
				),
				this.sourceStr
			)
		localStorage.setItem(
			`file${this.currentTabIndex}`,
			JSON.stringify(
				new EditorTab(
					this.tabFilenames[this.currentTabIndex],
					this.sourceStr,
					this.properties.selectedRowIndex,
					this.properties.selectedColumnIndex
				)
			)
		)
		this.iframeSourceStr = this.sourceStr
		this.isContainingError = result.isContainingError
		this.outline = result.outline
		this.rowsAndColumns = result.rowAndColumns
	}

	nodeTrackBy = (index: number, item: CharacterNodeModel) => `${item.data}${index}`

	handleSubselectionMouseOver(event: MouseEvent, node: EditorElementNodeModel | EditorOutlineNodeModel | null) {
		event.stopPropagation()
		if ((!!node && !this.isSubselectionEnabled)) {
			this.iframeSourceStr = this.sourceStr.slice(node.startSourceIndex, node.endSourceIndex)
			this.isSubselectionEnabled = true
		}
	}

	handleSubselectionMouseLeave(event: MouseEvent) {
		event.stopPropagation()
		if (this.isSubselectionEnabled) {
			this.iframeSourceStr = this.sourceStr
			this.isSubselectionEnabled = false
		}
	}

	getSelectedTheme = () => (this.themeMap[this.currentTheme] || this.lightTheme)

	downloadFile(): any {
		const blob = new Blob([this.sourceStr!])
		const fileStream = createWriteStream(`file_export${(this.currentTabIndex + 1)}_${new Date().toISOString()}.html`, {
			size: blob.size
		})
		const readableStream = (blob.stream() as any)
		if ((!!readableStream.pipeTo && !!window.WritableStream))
			return readableStream.pipeTo(fileStream)

		let writer = fileStream.getWriter()

		const pump: any = () => readableStream.getReader().read()
			.then((res: any) => res.done ? writer.close() : writer.write(res.value).then(pump))

		pump()
	}

	clickUploadFileInput = () => document.getElementById("upload-file-input")?.click()

	addTab = () => this.switchTab((this.tabFilenames.push("New File") - 1))

	removeTab(event: MouseEvent, index: number) {
		event.stopPropagation()
		const lastTabFilenameIndex = (this.tabFilenames.length - 1)
		const isCurrentTabIndexLast = ((this.currentTabIndex === lastTabFilenameIndex))
		if ((index === lastTabFilenameIndex)) {
			localStorage.removeItem(`file${index}`)
			this.tabFilenames.splice(index, 1)
		} else {
			for (let i = index; (i < lastTabFilenameIndex); i++)
				localStorage.setItem(
					`file${i}`,
					(
						localStorage.getItem(`file${i + 1}`) ||
						JSON.stringify(
							new EditorTab(
								"New File",
								"",
								0,
								0
							)
						)
					)
				)
			localStorage.removeItem(`file${lastTabFilenameIndex}`)
			this.tabFilenames.splice(this.currentTabIndex, 1)
		}
		if (isCurrentTabIndexLast)
			this.switchTab((this.currentTabIndex - 1))
	}

	switchTab(index: number) {
		const deserialisedTab: EditorTab = JSON.parse(localStorage.getItem(`file${(this.currentTabIndex = index)}`)!)
		if (!!deserialisedTab) {
			this.sourceStr = deserialisedTab.data
			this.handleSourceStrParse()
			this.properties = {
				selectedColumnIndex: deserialisedTab.selectedColumnIndex,
				selectedRowIndex: deserialisedTab.selectedRowIndex
			}
		} else {
			this.sourceStr = ""
			this.properties = {
				selectedColumnIndex: 0,
				selectedRowIndex: 0
			}
			localStorage.setItem(
				`file${index}`,
				JSON.stringify(
					new EditorTab(
						"New File",
						"",
						0,
						0
					)
				)
			)
			this.handleSourceStrParse()
		}
	}


	uploadFile(event: any) {
		const fileReader = new FileReader()
		const file = (event.target.files as FileList)[0]
		fileReader.readAsText(file, "UTF-8")
		fileReader.onload = () => {
			this.tabFilenames[this.currentTabIndex] = file.name
			//add LocalStorage merge
			this.properties = {
				selectedColumnIndex: 0,
				selectedRowIndex: 0
			}
			this.sourceStr = (fileReader.result as string)
			this.handleSourceStrParse()
			event.target.value = null
		}
		fileReader.onerror = () => {
			alert("An error occurred, please try again.")
			event.target.value = null
		}
	}

	ngOnDestroy() {
		Object.values(this.subscriptionMap)
			.forEach(subscription => subscription?.unsubscribe())
	}

}

//TODO NICK: abstract to new line prefs
const newLineStr = "\n"