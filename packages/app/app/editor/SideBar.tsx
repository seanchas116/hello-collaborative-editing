import type { File } from "@/db/schema";
import { Icon } from "@/components/Icon";
import { ReactTimeAgo } from "@/components/TimeAgo";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <nav className="w-[256px] bg-gray-50 h-screen flex flex-col text-sm border-r border-gray-200">
      <div className="m-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="items-center flex gap-2 p-2">
            <img
              className="w-8 h-8 rounded-2xl"
              src="https://via.placeholder.com/32x32"
            />
            <div className="text-gray-900 font-medium text-sm">Jane Doe</div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="p-2 flex items-center gap-2 text-gray-400 py-0">
          <div className="p-2 rounded-full">
            <Icon icon="material-symbols:search" className="text-base" />
          </div>
          Filter
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-scroll border-y border-gray-200">
        <div className="p-2 flex flex-col">
          {files.map((file) => (
            <button
              key={file.id}
              data-file-id={file.id}
              className="flex flex-col items-start text-left gap-1 p-3 relative aria-pressed:bg-gray-200 rounded-xl"
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
        className="flex items-center gap-2 m-2 hover:bg-gray-200 p-2 rounded-full"
        onClick={() => createFile()}
      >
        <div className="p-2 bg-blue-500 text-white rounded-full">
          <Icon icon="icon-park-outline:write" className="text-base" />
        </div>
        Add Note
      </button>
    </nav>
  );
};
