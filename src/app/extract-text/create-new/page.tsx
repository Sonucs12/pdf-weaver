import ClientCreateNewPage from "./components/ClientCreateNewPage";
import { generateMetadata } from "@/lib/metadata";
import { StructuredData } from "@/components/StructuredData";
export const {metadata,schema} = generateMetadata({
  title: "Create New",
  description: "Create New",
  path: "/create-new",
  keywords:["create new", "create new online", "create new for free", "create new for mac", "create new for windows", "create new for linux", "create new for android", "create new for ios"],
  faq: [
    { question: "What is Create New?", answer: "Create New is a tool that allows you to create new documents." },
  ],
  breadcrumbs: [
    { name: "Home", url: "/" },
    { name: "Create New", url: "/create-new" },
  ],
})
export default function CreateNewPage() {
 return(
<>
<ClientCreateNewPage/>
<StructuredData data={schema} />
</>
  );
}
