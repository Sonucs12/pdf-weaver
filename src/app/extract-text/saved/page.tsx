import ClientSavedPage from "./components/ClientSavedPage";
import { generateMetadata } from "@/lib/metadata";
import { StructuredData } from "@/components/StructuredData";
export const {metadata,schema} = generateMetadata({
  title: "Saved",
  description: "Saved documents",
  path: "/saved",
  keywords:["saved documents", "saved extracts", "saved pdfs", "saved markdown", "saved text", "saved documents online", "saved documents for free", "saved documents for mac", "saved documents for windows", "saved documents for linux", "saved documents for android", "saved documents for ios"],
  faq: [
    { question: "What is Saved?", answer: "Saved is a feature that allows you to save your documents for later." },
  ],
  breadcrumbs: [
    { name: "Home", url: "/" },
    { name: "Saved", url: "/saved" },
  ],
})
export default function SavedPage() {
 return(
<>
<ClientSavedPage/>
<StructuredData data={schema} />
</>
  );
}
