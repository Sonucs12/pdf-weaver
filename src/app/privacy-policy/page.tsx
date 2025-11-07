
import { generateMetadata } from "@/lib/metadata";

const { metadata } = generateMetadata({
  title: "Privacy Policy",
  description: "Our privacy policy for PDFWrite.",
  path: "/privacy-policy",
});
export { metadata };

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      </div>

      <div className="max-w-4xl mx-auto shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p>
            We collect information that you provide to us directly, such as when you create an account, upload a file, or communicate with us. This may include your name, email address, and the content of your files.
          </p>
          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services. We do not share your personal information with third parties, except as required by law.
          </p>
          <h2>Data Security</h2>
          <p>
            We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure.
          </p>
        </div>
      </div>
    </div>
  );
}
