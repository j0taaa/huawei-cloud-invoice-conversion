import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import SectionCard from "@/components/SectionCard";

export default function SuccessPage() {
  return (
    <PageLayout title="Success" subtitle="Your request was completed successfully.">
      <SectionCard title="Upload was successful" muted>
        <p className="instructions">You can return to the main workflow at any time.</p>
        <Link href="/" className="button button--primary" style={{ textAlign: "center" }}>
          Go back to the main page
        </Link>
      </SectionCard>
    </PageLayout>
  );
}
