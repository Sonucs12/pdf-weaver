import { Suspense } from "react";
import ClientEditorPage from "./ClientPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex flex-col min-h-screen items-center justify-center">Loading editor...</div>}>
      <ClientEditorPage />
    </Suspense>
  );
}
