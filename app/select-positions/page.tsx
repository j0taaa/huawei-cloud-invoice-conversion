import PageLayout from "@/components/PageLayout";
import SectionCard from "@/components/SectionCard";
import PositionSelector from "./PositionSelector";

export default function SelectPositionsPage() {
  return (
    <PageLayout
      title="Select Positions"
      subtitle="Highlight the start and end coordinates of the invoice section."
      maxWidth="lg"
    >
      <SectionCard title="Position selection" muted>
        <PositionSelector />
      </SectionCard>
    </PageLayout>
  );
}
