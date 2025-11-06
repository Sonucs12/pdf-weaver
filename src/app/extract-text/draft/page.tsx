import ClientDraftPage from "./components/ClientDraftPage"; 
import { generateMetadata } from "@/lib/metadata";
import { StructuredData } from "@/components/StructuredData";
export const {metadata,schema} = generateMetadata({
  title: "Draft",
  description: "Draft",
  path: "/draft",
  keywords:["draft", "draft online", "draft for free", "draft for mac", "draft for windows", "draft for linux", "draft for android", "draft for ios"],
  faq: [
    { question: "What is Draft?", answer: "Draft is a tool that allows you to draft your documents." },
  ],
  breadcrumbs: [
    { name: "Home", url: "/" },
    { name: "Draft", url: "/draft" },
  ],
})
export default function DraftPage() {
 return(
<>
<ClientDraftPage/>
<StructuredData data={schema} />
</>
  );
}
