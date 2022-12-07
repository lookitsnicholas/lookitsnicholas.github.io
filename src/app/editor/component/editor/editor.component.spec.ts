import { ComponentFixture, TestBed } from "@angular/core/testing"
import { ParserLanguageEnum } from "../../model/enum/parser-language.enum"
import { ThemeEnum } from "../../model/enum/theme.enum"
import { DarkTheme } from "../../model/theme/dark.theme"
import { SafePipe } from "../../pipe/safe.pipe"

import { EditorComponent } from "./editor.component"

describe("EditorComponent", () => {

	let component: EditorComponent
	let fixture: ComponentFixture<EditorComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [
				EditorComponent,
				SafePipe
			]
		})
			.compileComponents()

		fixture = TestBed.createComponent(EditorComponent)
		component = fixture.componentInstance
		component.ngOnInit()
		fixture.detectChanges()
	})

	it("should create", () => {
		expect(component).toBeTruthy()
	})

	it("should have a default light theme", () => {
		expect(component.currentTheme).toEqual(ThemeEnum.LIGHT)
	})

	it("should have updated UI upon theme selection", () => {
		component.currentTheme = ThemeEnum.DARK
		component.sourceStr = "hello, world"
		component.handleSourceStrParse()
		expect(component.rowsAndColumns[0].editorNodes[0].colour).toEqual(DarkTheme.text)
	})

	it("should have a default plain text language parser", () => {
		expect(component.currentParserLanguage).toEqual(ParserLanguageEnum.PLAINTEXT)
	})

	it("should handle empty source document", () => {
		component.sourceStr = ""
		component.handleSourceStrParse()
		expect(JSON.stringify(component.outline)).toEqual('{\"element\":\"Plain Text\",\"children\":[],\"isExpanded\":false}')
		expect(component.rowsAndColumns.length).toEqual(1)
		expect(component.rowsAndColumns[0].endSourceIndex).toEqual(0)
	})

	it("should handle carriage returns", () => {
		component.currentParserLanguage = ParserLanguageEnum.HTML
		component.sourceStr = '<div><img src="https://picsum.photos/500"><//div>'
		component.handleSourceStrParse()
		component.isEditorFocused = true
		component.properties.selectedRowIndex = 0
		component.properties.selectedColumnIndex = 5
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
		expect(component.rowsAndColumns.length).toEqual(2)
	})

	it("should have an accurate HTML outline", () => {
		component.currentParserLanguage = ParserLanguageEnum.HTML
		component.sourceStr = '<div><img src="https://picsum.photos/500"></div>'
		component.handleSourceStrParse()
		expect(JSON.stringify(component.outline)).toEqual('{"element":"document (root)","children":[{"element":"div","children":[{"element":"img","children":[],"isExpanded":false}],"isExpanded":false}],"isExpanded":false}')
	})

	it("should have accurate HTML node metadata", () => {
		component.currentParserLanguage = ParserLanguageEnum.HTML
		component.sourceStr = '<div><img src="https://picsum.photos/500"></div>'
		component.handleSourceStrParse()
		const currentRow = component.rowsAndColumns[0]
		expect(!!currentRow.editorNodes[1].elementNode).toBeTrue()
		expect(currentRow.editorNodes[6].elementNode?.attributes[0]).toEqual("src")
		expect(currentRow.editorNodes[1].elementNode?.endSourceIndex).toEqual(component.sourceStr.length)
	})

	it("should have HTML error handling", () => {
		component.currentParserLanguage = ParserLanguageEnum.HTML
		component.sourceStr = '<div><img src="https://picsum.photos/500"><//div>'
		component.handleSourceStrParse()
		const lastRow = component.rowsAndColumns[(component.rowsAndColumns.length - 1)]
		expect(lastRow.editorNodes[(lastRow.editorNodes.length - 1)].colour).toEqual(component.getSelectedTheme().errorText)
		expect(component.isContainingError).toBeTrue()
	})

	it("should handle HTML iframe subselection", () => {
		component.currentParserLanguage = ParserLanguageEnum.HTML
		component.sourceStr = '<div><img src="https://picsum.photos/500"><//div>'
		component.handleSourceStrParse()
		component.handleSubselectionMouseOver(new MouseEvent("mouseover"), component.rowsAndColumns[0].editorNodes[6].elementNode)
		expect(component.iframeSourceStr.length).toEqual(37)
	})

})