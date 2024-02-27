import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness.js";
import { User } from "@supabase/supabase-js";
import ReconnectingWebSocket from "reconnecting-websocket";

const messageTypes = {
  update: 1,
  awareness: 2,
} as const;

interface EditorStateOptions {
  user: User;
  fileID: string;
  generateCollaborativeAuthToken: (fileID: string) => Promise<string>;
}

export class EditorState {
  constructor({
    user,
    fileID,
    generateCollaborativeAuthToken,
  }: EditorStateOptions) {
    this.user = user;
    this.fileID = fileID;
    this.generateCollaborativeAuthToken = generateCollaborativeAuthToken;
    this.ydoc = new Y.Doc();
    this.awareness = new awarenessProtocol.Awareness(this.ydoc);

    void this.openConnection();
  }

  readonly user: User;
  readonly fileID: string;
  readonly generateCollaborativeAuthToken: (fileID: string) => Promise<string>;
  readonly ydoc: Y.Doc;
  readonly awareness: awarenessProtocol.Awareness;

  private async openConnection() {
    const ws = new ReconnectingWebSocket(async () => {
      const token = await this.generateCollaborativeAuthToken(this.fileID);

      return `wss://${process.env.NEXT_PUBLIC_CF_WORKER_URL!.replace(
        "https://",
        ""
      )}/file?id=${this.fileID}&token=${token}`;
    });
    ws.binaryType = "arraybuffer";

    this.ydoc.on("update", (update: Uint8Array) => {
      const array = new Uint8Array(update.length + 1);
      array[0] = messageTypes.update;
      array.set(update, 1);
      // messages are accumulated and sent on open
      ws.send(array);
    });

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
}
