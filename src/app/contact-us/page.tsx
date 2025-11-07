
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { generateMetadata } from "@/lib/metadata";

const { metadata } = generateMetadata({
  title: "Contact Us",
  description: "Get in touch with the PDF Weaver team. We'd love to hear from you!",
  path: "/contact-us",
});
export { metadata };

export default function ContactUsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Have a question, a suggestion, or just want to say hello? We'd love to hear from you.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name">Name</label>
              <Input id="name" placeholder="Your Name" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email">Email</label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="message">Message</label>
              <Textarea id="message" placeholder="Your message..." className="min-h-[150px]" />
            </div>
            <Button type="submit">Send Message</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
