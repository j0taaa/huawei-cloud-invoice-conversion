import PageLayout from "@/components/PageLayout";
import SectionCard from "@/components/SectionCard";
import FileUploadForm from "./FileUploadForm";

export default function FileReceivePage() {
  return (
    <PageLayout
      title="Upload File"
      subtitle="Add the AWS invoice PDF you want to convert."
    >
      <SectionCard title="Upload invoice" muted>
        <FileUploadForm />
        <p className="instructions">
          The invoice PDF should be the AWS billing document containing all services used by
          the client during the month.
        </p>
      </SectionCard>
    </PageLayout>
  );
}
