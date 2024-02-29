import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness.js";
import ReconnectingWebSocket from "reconnecting-websocket";
import { generateCollaborativeAuthToken, updateFile } from "@/actions/file";
import { action, makeObservable, observable, runInAction } from "mobx";
import { File, Permission } from "@/db/schema";
import debounce from "just-debounce-it";
import { DetailedUser } from "@/types/DetailedUser";

const messageTypes = {
  update: 1,
  awareness: 2,
} as const;

interface EditorStateOptions {
  user: DetailedUser;
  fileInfo: File & { permissions: Permission[] };
}

export class EditorState {
  constructor({ user, fileInfo }: EditorStateOptions) {
    this.user = user;
    this.fileInfo = fileInfo;
    this.fileID = fileInfo.id;
    this.fileName = fileInfo.name ?? "";
    this.ydoc = new Y.Doc();
    this.awareness = new awarenessProtocol.Awareness(this.ydoc);
    makeObservable(this);
    void this.openConnection();
  }

  readonly user: DetailedUser;
  readonly fileID: string;
  readonly ydoc: Y.Doc;
  readonly awareness: awarenessProtocol.Awareness;
  readonly disposers: (() => void)[] = [];

  @observable isLoaded = false;
  @observable.ref fileInfo: File & { permissions: Permission[] };
  @observable fileName = "";

  @action async updateFileName(name: string) {
    this.fileName = name;
    this.updateRemoteFileName(name);
  }

  private updateRemoteFileName = debounce((name: string) => {
    void updateFile(this.fileID, { name });
  }, 300);

  private async openConnection() {
    const ws = new ReconnectingWebSocket(async () => {
      const token = await generateCollaborativeAuthToken(this.fileID);

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

      runInAction(() => {
        this.isLoaded = true;
      });
    });

    this.disposers.push(() => {
      ws.close();
    });
  }

  dispose() {
    for (const disposer of this.disposers) {
      disposer();
    }
  }
}
