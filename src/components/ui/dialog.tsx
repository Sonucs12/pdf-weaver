"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-opacity duration-300 ease-out",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const childrenArray = React.Children.toArray(children);
  const headerIndex = childrenArray.findIndex(
    (child) =>
      React.isValidElement(child) &&
      (child.type as any)?.displayName === "DialogHeader"
  );
  const header = headerIndex !== -1 ? childrenArray[headerIndex] : null;
  const rest =
    headerIndex !== -1
      ? childrenArray.filter((_, i) => i !== headerIndex)
      : childrenArray;
  const hasDescription = childrenArray.some(
    (child) =>
      React.isValidElement(child) &&
      (child.type as any)?.displayName === "DialogDescription"
  );

  const dialogId = React.useId();
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] max-h-[95vh] top-[50%] max-w-[98vw] z-50 w-full h-auto translate-x-[-50%] translate-y-[-50%] flex flex-col data-[state=closed]:fade-out-10 data-[state=open]:fade-in-10 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 transition-all duration-300 ease-out rounded-2xl border border-border ",
          className
        )}
        aria-describedby={hasDescription ? undefined : dialogId}
        {...props}
      >
        <div className="overflow-hidden border  border-border rounded-2xl shadow-lg flex flex-col w-full h-full bg-gray-50 dark:bg-gray-900">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-3 border-b border-border  sticky top-0 z-10">
            <div className="flex-1 flex items-center">{header}</div>
            <DialogPrimitive.Close className="ml-2 rounded-sm ring-offset-background hover:ring transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer border border-border p-1.5">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 pt-2">
            {rest}
          </div>
          {!hasDescription && (
            <div id={dialogId} className="sr-only">
              Dialog content
            </div>
          )}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex justify-end space-x-2 mt-6", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-md font-semibold",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-foreground mb-2", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};