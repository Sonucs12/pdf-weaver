"use client";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";

interface EditButtonProps {
  id: string;
  title: string;
  onClick?: () => void;
}

export function EditButton({ id, title, onClick }: EditButtonProps) {
  if (onClick) {
    return (
      <Button variant="outline" size={"icon"} onClick={onClick}>
        <Pencil className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Link href={`/extract-text/editor?id=${encodeURIComponent(id)}`}>
      <Button variant="outline" size={"icon"}>
        <Pencil className="h-4 w-4" />
      </Button>
    </Link>
  );
}
