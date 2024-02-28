import { useEditor, EditorContent } from "@tiptap/react";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import React, { useEffect, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { EditorState } from "./EditorState";
import styled from "styled-components";
import twColors from "tailwindcss/colors";
import { User } from "@supabase/supabase-js";
import { observer } from "mobx-react-lite";
import { Icon } from "@iconify/react";

const userColors = [
  twColors.blue[500],
  twColors.green[500],
  twColors.pink[500],
  twColors.purple[500],
  twColors.red[500],
  twColors.yellow[500],
];

const content = `
<h2>
  Hi there,
</h2>
<p>
  this is a <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That’s a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
</p>
<pre><code class="language-css">body {
display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
</p>
<blockquote>
  Wow, that’s amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
`;

const StyledEditorContent = styled(EditorContent)`
  .tiptap {
    outline: none;
  }

  .tiptap p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  .collaboration-cursor__caret {
    display: inline-block;
    height: 1em;
    border: 1px solid;
    position: relative;
  }
  .collaboration-cursor__label {
    position: absolute;
    left: -1px;
    bottom: 1em;
    width: max-content;
    color: white;
    padding: 0 4px;
    font-size: 12px;
    font-weight: bold;
  }
`;

export const Editor: React.FC<{
  className?: string;
  user: User;
  fileID: string;
}> = ({ className, user, fileID }) => {
  const [editorState, setEditorState] = React.useState<EditorState | null>(
    null
  );

  useEffect(() => {
    const state = new EditorState({ user, fileID });
    setEditorState(state);
    return () => {
      state.dispose();
    };
  }, []);

  if (!editorState) {
    return null;
  }

  return <EditorImpl className={className} editorState={editorState} />;
};

const EditorImpl: React.FC<{
  className?: string;
  editorState: EditorState;
}> = observer(({ className, editorState }) => {
  const editor = useEditor({
    extensions: [
      Placeholder.configure(),
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      // @ts-ignore
      TextStyle.configure({ types: [ListItem.name] }),
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
        history: false,
      }),
      Collaboration.configure({
        document: editorState.ydoc,
      }),
      CollaborationCursor.configure({
        // Looks like we have to pass non-plain object here, so using a class
        provider: new (class {
          get awareness() {
            return editorState.awareness;
          }
        })(),
        user: {
          name: editorState.user.user_metadata.name,
          color: userColors[editorState.ydoc.clientID % userColors.length],
        },
      }),
    ],
  });

  return editorState.isLoaded ? (
    <div className={twMerge("px-16", className)}>
      <div className="flex">
        <button className="ml-auto bg-blue-500 px-3 py-1.5 text-sm text-white rounded-full m-5 font-semibold">
          Share
        </button>
      </div>
      <div className="max-w-4xl mx-auto mt-12">
        <h1 className="font-bold text-3xl mb-12">TODO: Show Title</h1>
        <StyledEditorContent editor={editor} className="prose" />
      </div>
    </div>
  ) : (
    <div className="flex-1 flex items-center justify-center">
      <Icon
        icon="svg-spinners:90-ring-with-bg"
        className="text-gray-500 text-2xl"
      />
    </div>
  );
});
