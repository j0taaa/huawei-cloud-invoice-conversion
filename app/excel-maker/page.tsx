import PageLayout from "@/components/PageLayout";
import SectionCard from "@/components/SectionCard";
import ExcelMakerForm from "./ExcelMakerForm";

export default function ExcelMakerPage() {
  return (
    <PageLayout
      title="Upload Invoices"
      subtitle="Combine multiple XLSX invoices into a single export."
    >
      <div className="excel-maker">
        <SectionCard title="Excel maker">
          <ExcelMakerForm />
          <p className="instructions">
            Add each XLSX file with a short label so you can recognize it in the final export.
          </p>
        </SectionCard>
      </div>
    </PageLayout>
  );
}
