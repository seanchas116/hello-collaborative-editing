import React from "react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ShareButton: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className={className}>Share</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm flex flex-col gap-4" align="end">
        <div>
          <h2 className="font-semibold mb-2">Share this file</h2>
          <div className="flex gap-2">
            <Input placeholder="Email Address" />
            <Button variant="secondary" className="shrink-0">
              Invite
            </Button>
          </div>
        </div>
        <div className="h-px bg-gray-100 -mx-4" />
        <div className="space-y-4">
          <div className="grid gap-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="/avatars/03.png" alt="Image" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">
                    Olivia Martin
                  </p>
                  <p className="text-sm text-muted-foreground">m@example.com</p>
                </div>
              </div>
              <div>Owner</div>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
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
        </div>
      </PopoverContent>
    </Popover>
  );
};
