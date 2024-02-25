import * as Y from "yjs";

const messageTypes = {
  update: 1,
  awareness: 2,
} as const;

export class EditorState {
  constructor(fileID: string) {
    this.ydoc = new Y.Doc();

    const ws = new WebSocket(
      `wss://${process.env.NEXT_PUBLIC_CF_WORKER_URL!.replace(
        "https://",
        ""
      )}/file?id=${fileID}`
    );
    ws.binaryType = "arraybuffer";

    ws.addEventListener("open", () => {
      console.log("connected");

      this.ydoc.on("update", (update: Uint8Array) => {
        const array = new Uint8Array(update.length + 1);
        array[0] = messageTypes.update;
        array.set(update, 1);
        ws.send(array);
      });
    });
    ws.addEventListener("message", (event) => {
      console.log("message", event.data);

      const data = event.data;
      if (!(data instanceof ArrayBuffer)) {
        return;
      }

      const array = new Uint8Array(data);
      switch (array[0]) {
        case messageTypes.awareness:
          // ...
          break;
        case messageTypes.update:
          Y.applyUpdate(this.ydoc, array.subarray(1));
          break;
      }
    });
  }

  readonly ydoc: Y.Doc;
}
