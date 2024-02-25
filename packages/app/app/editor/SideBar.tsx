import type { File } from "@/db/schema";
import { Icon } from "@/components/Icon";
import { ReactTimeAgo } from "@/components/TimeAgo";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const SideBar: React.FC<{
  files: File[];
  createFile(): Promise<void>;
  fileID?: string;
}> = ({ files, createFile, fileID }) => {
  const router = useRouter();

  const [selectedFileID, setSelectedFileID] = useState<string | undefined>();
  useEffect(() => {
    setSelectedFileID(fileID);
    const element = document.querySelector(`[data-file-id="${fileID}"]`);
    if (element) {
      element.scrollIntoView({ block: "nearest" });
    }
  }, [fileID]);

  return (
    <nav className="w-[256px] bg-gray-50 h-screen flex flex-col text-sm">
      <div className="bg-gray-200 rounded-full h-10 px-3 flex items-center gap-2 text-gray-400 m-3">
        <Icon icon="material-symbols:search" />
        Filter
      </div>
      <div className="flex-1 min-h-0 overflow-y-scroll">
        <div className="px-3 flex flex-col">
          {files.map((file) => (
            <button
              key={file.id}
              data-file-id={file.id}
              className="flex flex-col items-start text-left gap-2 p-3 relative aria-pressed:bg-gray-200 rounded-xl"
              aria-pressed={file.id === selectedFileID}
              onClick={() => {
                setSelectedFileID(file.id);
                router.replace(`/editor?file=${file.id}`);
              }}
            >
              <h2 className="font-medium text-gray-900">{file.name}</h2>
              <ReactTimeAgo
                className="text-gray-500 text-xs"
                date={file.createdAt!}
                locale="en-US"
              />
              <div
                className="absolute left-2 bottom-0 right-2 h-px bg-gray-100"
                style={{ opacity: file.id === selectedFileID ? 0 : 1 }}
              />
            </button>
          ))}
        </div>
      </div>
      <button
        className="bg-gray-800 hover:bg-gray-700 text-white h-10 px-4 rounded-full flex items-center gap-2 m-3 mb-0"
        onClick={() => createFile()}
      >
        <Icon icon="icon-park-outline:write" />
        Add Note
      </button>
      <div className="items-center flex gap-2 p-2 m-3">
        <img
          className="w-8 h-8 rounded-2xl"
          src="https://via.placeholder.com/32x32"
        />
        <div className="text-gray-900 text-sm">Jane Doe</div>
      </div>
    </nav>
  );
};
