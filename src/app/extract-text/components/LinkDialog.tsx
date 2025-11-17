"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  initialUrl?: string;
}

export const LinkDialog = ({
  isOpen,
  onClose,
  onSubmit,
  initialUrl = "",
}: LinkDialogProps) => {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const handleSubmit = () => {
    onSubmit(url);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
        </DialogHeader>
        <div className=" py-4">
          <div className="items-center gap-4">
            <Label htmlFor="link-url" className="text-right">
              URL
            </Label>
            <Input
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size={"sm"} onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} size={"sm"}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
