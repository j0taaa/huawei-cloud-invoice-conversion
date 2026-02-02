import PageLayout from "@/components/PageLayout";
import SectionCard from "@/components/SectionCard";
import ExcelMakerForm from "./ExcelMakerForm";

export default function ExcelMakerPage() {
  return (
    <PageLayout
      title="Upload Invoices"
      subtitle="Combine multiple XLSX invoices into a single export."
    >
      <SectionCard title="Excel maker" muted>
        <ExcelMakerForm />
        <p className="instructions">
          Click “Add File” to include as many XLSX files as you need. Assign a friendly name
          to each file before generating the combined report.
        </p>
      </SectionCard>
    </PageLayout>
  );
}
