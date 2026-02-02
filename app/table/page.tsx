import PageLayout from "@/components/PageLayout";
import SectionCard from "@/components/SectionCard";
import TableClient from "./TableClient";

export default function TablePage() {
  return (
    <PageLayout
      title="Data Editor"
      subtitle="Review the converted items and generate the Huawei calculator automation code."
      maxWidth="lg"
    >
      <SectionCard title="Converted data" muted>
        <TableClient />
        <p className="instructions">
          The table lists every converted item from AWS to Huawei Cloud, including usage and
          request values. Copy the automation code to preload items into the Huawei pricing
          calculator.
        </p>
      </SectionCard>
    </PageLayout>
  );
}
