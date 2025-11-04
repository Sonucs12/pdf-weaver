
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TitleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  initialTitle?: string;
}

export function TitleDialog({ open, onClose, onSave, initialTitle = "" }: TitleDialogProps) {
  const [title, setTitle] = useState(initialTitle);

  const handleSave = () => {
    if (title) {
      onSave(title);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialTitle ? "Edit Title" : "Enter Title"}</DialogTitle>
        </DialogHeader>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter project title"
        />
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
