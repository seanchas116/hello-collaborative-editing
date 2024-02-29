import React, { useState } from "react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { DetailedUser, toDetailedUser } from "@/types/DetailedUser";
import { inviteUser, removeInvitedUser } from "@/actions/file";
import { EditorState } from "./EditorState";
import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from "mobx-react-lite";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ShareButton: React.FC<{
  editorState: EditorState;
  className?: string;
}> = observer(({ editorState, className }) => {
  const { toast } = useToast();

  const user = editorState.user;
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "bg-blue-500 rounded-full px-3 py-1.5 text-sm text-white",
            className
          )}
        >
          Share
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] flex flex-col p-0" align="end">
        <div className="p-4">
          <h2 className="font-medium mb-4">Share this file</h2>
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="bg-blue-500 rounded-full px-3 py-1.5 text-sm text-white flex items-center gap-1"
              onClick={async () => {
                try {
                  setIsInviting(true);
                  await inviteUser(editorState.fileID, email);
                } catch (e) {
                  toast({
                    variant: "destructive",
                    title: "Couldn't invite the user.",
                    description: String(e),
                  });
                } finally {
                  setIsInviting(false);
                }
              }}
            >
              {isInviting ? (
                <Icon icon="svg-spinners:90-ring-with-bg" />
              ) : (
                <>Invite</>
              )}
            </button>
          </div>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex flex-col p-4 gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={user.picture} alt="Image" />
                <AvatarFallback>IN</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div>Owner</div>
          </div>
          {editorState.fileInfo.permissions.map((permission) => {
            // TODO: user info
            return (
              <div
                key={permission.userId}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/avatars/05.png" alt="Image" />
                    <AvatarFallback>
                      {toDetailedUser(permission.user).name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {toDetailedUser(permission.user).name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {permission.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1">
                    Can Edit
                    <Icon icon="material-symbols:keyboard-arrow-down" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={async () => {
                        try {
                          setIsRemoving(true);
                          await removeInvitedUser(
                            editorState.fileID,
                            permission.userId
                          );
                        } catch (e) {
                          toast({
                            variant: "destructive",
                            title: "Couldn't remove the user.",
                            description: String(e),
                          });
                        } finally {
                          setIsRemoving(false);
                        }
                      }}
                    >
                      Remove...
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
});
