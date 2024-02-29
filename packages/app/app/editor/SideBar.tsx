"use client";

import type { File } from "@/db/schema";
import { Icon } from "@/components/Icon";
import { ReactTimeAgo } from "@/components/TimeAgo";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import {
  changeQuantity,
  checkoutWithStripe as createStripeCheckoutURL,
  createStripePortal as createStripePortalURL,
} from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { createFile } from "@/actions/file";
import { useToast } from "@/components/ui/use-toast";
import NProgress from "nprogress";
import { DetailedUser } from "@/types/DetailedUser";

export const SideBar: React.FC<{
  user: DetailedUser;
  isPremium: boolean;
  files: File[];
  fileID?: string;
  seatCount: number;
}> = ({ user, isPremium, files, fileID, seatCount }) => {
  const pathname = usePathname();

  const { toast } = useToast();

  const supabase = createClient();

  const router = useRouter();

  const [selectedFileID, setSelectedFileID] = useState<string | undefined>();
  useEffect(() => {
    setSelectedFileID(fileID);
    const element = document.querySelector(`[data-file-id="${fileID}"]`);
    if (element) {
      element.scrollIntoView({ block: "nearest" });
    }
  }, [fileID]);

  const onOpenCheckoutPage = async () => {
    try {
      NProgress.start();
      location.href = await createStripeCheckoutURL(location.href);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't open the checkout page.",
      });
    } finally {
      NProgress.done();
    }
  };

  const onOpenCustomerPortal = async () => {
    try {
      NProgress.start();
      location.href = await createStripePortalURL(location.href);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't open the customer portal.",
      });
    } finally {
      NProgress.done();
    }
  };

  const [addFileInProgress, setAddFileInProgress] = useState(false);

  const onAddFile = async () => {
    try {
      setAddFileInProgress(true);
      await createFile();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't create a new file.",
      });
    } finally {
      setAddFileInProgress(false);
    }
  };

  const [incrementingSeatInProgress, setIncrementingSeatInProgress] =
    useState(false);
  const [decrementingSeatInProgress, setDecrementingSeatInProgress] =
    useState(false);

  return (
    <nav className="w-[256px] bg-gray-50 h-screen flex flex-col text-sm border-r border-gray-200">
      <div className="m-2 flex flex-col">
        <DropdownMenu>
          <DropdownMenuTrigger className="items-center flex gap-2 p-2 rounded-full aria-expanded:bg-gray-100 hover:bg-gray-100">
            <img className="w-8 h-8 rounded-full" src={user.picture} />
            <div className="text-gray-900 font-medium text-sm">{user.name}</div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Billing</DropdownMenuLabel>
            {isPremium ? (
              <>
                <DropdownMenuItem onClick={onOpenCustomerPortal}>
                  Manage Subscription...
                </DropdownMenuItem>
                <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm">
                  <span>Quantity</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={async () => {
                        try {
                          setDecrementingSeatInProgress(true);
                          await changeQuantity(Math.max(0, seatCount - 1));
                        } finally {
                          setDecrementingSeatInProgress(false);
                        }
                      }}
                    >
                      {decrementingSeatInProgress ? (
                        <Icon icon="svg-spinners:90-ring-with-bg" />
                      ) : (
                        <Icon icon="material-symbols:remove" />
                      )}
                    </Button>
                    <span>{seatCount}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={async () => {
                        try {
                          setIncrementingSeatInProgress(true);
                          await changeQuantity(seatCount + 1);
                        } finally {
                          setIncrementingSeatInProgress(false);
                        }
                      }}
                    >
                      {incrementingSeatInProgress ? (
                        <Icon icon="svg-spinners:90-ring-with-bg" />
                      ) : (
                        <Icon icon="material-symbols:add" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <DropdownMenuItem onClick={onOpenCheckoutPage}>
                Subscribe...
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={async () => {
                NProgress.start();
                await supabase.auth.signOut();
                NProgress.done();
                router.push("/");
                router.refresh();
              }}
            >
              Sign Out
            </DropdownMenuItem>
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
              className="flex flex-col items-start text-left gap-1 p-3 relative hover:bg-gray-100 aria-pressed:bg-gray-200 rounded-xl"
              aria-pressed={pathname === `/editor/${file.id}`}
              onClick={() => {
                setSelectedFileID(file.id);
                router.replace(`/editor/${file.id}`);
              }}
            >
              <h2 className="font-medium text-gray-900 flex items-center gap-2">
                {file.name}
                {file.ownerId !== user.id ? (
                  <span className="text-xs text-sky-500 bg-sky-100 px-1 rounded">
                    Shared
                  </span>
                ) : null}
              </h2>
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
        className="flex items-center gap-2 m-2 hover:bg-gray-100 p-2 rounded-full"
        onClick={onAddFile}
      >
        <div className="p-2 bg-gray-900 text-white rounded-full">
          {addFileInProgress ? (
            <Icon icon="svg-spinners:90-ring-with-bg" className="text-base" />
          ) : (
            <Icon icon="icon-park-outline:write" className="text-base" />
          )}
        </div>
        Add Note
      </button>
    </nav>
  );
};
