import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }) => (
  <ResizablePrimitive.PanelGroup className={cn(className)} {...props} />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({ withHandle, className, ...props }) => (
  <ResizablePrimitive.Handle
    className={cn(
      "relative flex w-2 items-center justify-center bg-border after:absolute after:top-1/2 after:left-1/2 after:block after:h-10 after:w-px after:-translate-x-1/2 after:-translate-y-1/2 after:bg-border data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:cursor-row-resize data-[orientation=vertical]:h-full data-[orientation=vertical]:cursor-col-resize",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="flex items-center justify-center">
        <GripVertical className="h-4 w-4" />
      </div>
    )}
  </ResizablePrimitive.Handle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
