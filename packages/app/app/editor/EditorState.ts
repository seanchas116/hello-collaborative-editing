import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness.js";

const messageTypes = {
  update: 1,
  awareness: 2,
} as const;

export class EditorState {
  constructor(fileID: string) {
    this.ydoc = new Y.Doc();
    this.awareness = new awarenessProtocol.Awareness(this.ydoc);

    const ws = new WebSocket(
      `wss://${process.env.NEXT_PUBLIC_CF_WORKER_URL!.replace(
        "https://",
        ""
      )}/file?id=${fileID}`
    );
    ws.binaryType = "arraybuffer";

    ws.addEventListener("open", () => {
      console.log("connected");

      this.awareness.on(
        "update",
        ({
          added,
          updated,
          removed,
        }: {
          added: number[];
          updated: number[];
          removed: number[];
        }) => {
          const changedClients = added.concat(updated).concat(removed);
          const update = awarenessProtocol.encodeAwarenessUpdate(
            this.awareness,
            changedClients
          );
          const array = new Uint8Array(update.length + 1);
          array[0] = messageTypes.awareness;
          array.set(update, 1);
          ws.send(array);
        }
      );

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
          awarenessProtocol.applyAwarenessUpdate(
            this.awareness,
            array.subarray(1),
            null
          );
          break;
        case messageTypes.update:
          Y.applyUpdate(this.ydoc, array.subarray(1));
          break;
      }
    });
  }

  readonly ydoc: Y.Doc;
  readonly awareness: awarenessProtocol.Awareness;
}
