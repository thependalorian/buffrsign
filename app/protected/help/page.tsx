import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This section is under development. Here you will find FAQs, documentation, and ways to contact our support team.</p>
        </CardContent>
      </Card>
    </div>
  );
}