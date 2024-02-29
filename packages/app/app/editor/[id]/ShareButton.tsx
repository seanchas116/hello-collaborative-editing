import React from "react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { DetailedUser } from "@/types/DetailedUser";

export const ShareButton: React.FC<{
  user: DetailedUser;
  className?: string;
}> = ({ user, className }) => {
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
      <PopoverContent
        className="w-[400px] text-sm flex flex-col p-0 rounded-xl border-gray-100 text-gray-900"
        align="end"
      >
        <div className="p-4">
          <h2 className="font-medium mb-4">Share this file</h2>
          <div className="flex gap-4 items-center">
            <Input placeholder="Email Address" />
            <button className="bg-blue-500 rounded-full px-3 py-1.5 text-sm text-white">
              Invite
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="/avatars/05.png" alt="Image" />
                <AvatarFallback>IN</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">
                  Isabella Nguyen
                </p>
                <p className="text-sm text-muted-foreground">b@example.com</p>
              </div>
            </div>
            <div>Can Edit</div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
