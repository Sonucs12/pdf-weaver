
import { generateMetadata } from "@/lib/metadata";

const { metadata } = generateMetadata({
  title: "Disclaimer",
  description: "Important information and disclaimers for PDF Weaver.",
  path: "/disclaimer",
});
export { metadata };

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Disclaimer</h1>
      </div>

      <div className="max-w-4xl mx-auto shadow-lg">
        <h2 className="text-2xl font-bold mb-4">General Information</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p>
            The information provided by PDF Weaver ("we," "us," or "our") on this website is for general informational purposes only. All information on the site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.
          </p>
          <h2>Limitation of Liability</h2>
          <p>
            Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.
          </p>
          <h2>External Links Disclaimer</h2>
          <p>
            The site may contain (or you may be sent through the site) links to other websites or content belonging to or originating from third parties or links to websites and features in banners or other advertising. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
          </p>
        </div>
      </div>
    </div>
  );
}
