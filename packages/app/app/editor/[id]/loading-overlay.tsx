import { Icon } from "@/components/icon";

export const LoadingOverlay = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Icon
        icon="svg-spinners:90-ring-with-bg"
        className="text-gray-500 text-2xl"
      />
    </div>
  );
};
