import PageLayout from "@/components/PageLayout";
import SectionCard from "@/components/SectionCard";
import RegionSelector from "./RegionSelector";

export default function SelectRegionPage() {
  return (
    <PageLayout
      title="Select Region"
      subtitle="Pick the Huawei Cloud region for the target environment."
    >
      <SectionCard title="Region selection" muted>
        <RegionSelector />
        <p className="instructions">
          Region data influences which ECS flavors are available in the next step.
        </p>
      </SectionCard>
    </PageLayout>
  );
}
