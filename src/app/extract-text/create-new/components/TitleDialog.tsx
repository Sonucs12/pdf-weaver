
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
  savedItems: any[];
}

export function TitleDialog({ open, onClose, onSave, initialTitle = "", savedItems }: TitleDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (title) {
      const isDuplicate = savedItems.some(item => item.title === title && item.title !== initialTitle);
      if (isDuplicate) {
        setError("A project with this title already exists. Please enter a different title.");
        return;
      }
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
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
          placeholder="Enter project title"
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
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
