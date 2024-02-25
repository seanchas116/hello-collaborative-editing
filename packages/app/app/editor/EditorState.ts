import * as Y from "yjs";

export class EditorState {
  constructor(fileID: string) {
    this.ydoc = new Y.Doc();
  }

  readonly ydoc: Y.Doc;
}
