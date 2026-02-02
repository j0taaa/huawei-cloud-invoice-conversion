import PageLayout from "@/components/PageLayout";
import SectionCard from "@/components/SectionCard";
import EcsSelector from "./EcsSelector";

export default function SelectEcsPage() {
  return (
    <PageLayout
      title="Select ECS Flavor"
      subtitle="Choose the closest Huawei Cloud ECS or Flexus flavor for each AWS instance."
      maxWidth="lg"
    >
      <SectionCard title="Flavor mapping" muted>
        <EcsSelector />
        <p className="instructions">
          Each AWS instance lists six options (five ECS and one Flexus). All suggested options
          have equal or greater CPU and memory compared to the AWS original.
        </p>
      </SectionCard>
    </PageLayout>
  );
}
