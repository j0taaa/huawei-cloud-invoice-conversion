import PageLayout from "@/components/PageLayout";
import SectionCard from "@/components/SectionCard";
import ManualSpecsForm from "./ManualSpecsForm";

export default function ManualSpecsPage() {
  return (
    <PageLayout
      title="Enter Manual Specs"
      subtitle="Paste your ECS specs directly when you already know the configuration."
    >
      <SectionCard title="Manual ECS specs" muted>
        <ManualSpecsForm />
      </SectionCard>
    </PageLayout>
  );
}
