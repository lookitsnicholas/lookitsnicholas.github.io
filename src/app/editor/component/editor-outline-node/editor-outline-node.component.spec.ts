import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorOutlineNodeComponent } from './editor-outline-node.component';

describe('EditorOutlineNodeComponent', () => {
  let component: EditorOutlineNodeComponent;
  let fixture: ComponentFixture<EditorOutlineNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorOutlineNodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorOutlineNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
