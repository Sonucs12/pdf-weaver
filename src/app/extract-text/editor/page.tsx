import { Editor } from "./components/Editor";



export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
     
      <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
        <Editor />
      </main>
    </div>
  );
}
