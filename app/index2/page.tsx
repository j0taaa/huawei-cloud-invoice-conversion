import LinkButton from "@/components/LinkButton";
import PageLayout from "@/components/PageLayout";
import SectionCard from "@/components/SectionCard";

export default function IndexTwoPage() {
  return (
    <PageLayout
      title="Specs to HC Converter"
      subtitle="Use manual ECS specs to map directly to Huawei Cloud equivalents."
    >
      <SectionCard title="Manual ECS workflow" muted>
        <div className="link-stack">
          <LinkButton href="/manual-specs">Add ECS Specs manually</LinkButton>
          <LinkButton href="/select-region" variant="secondary">
            Select Region
          </LinkButton>
          <LinkButton href="/select-ecs" variant="secondary">
            Select ECS Equivalent
          </LinkButton>
          <LinkButton href="/table">See Table</LinkButton>
        </div>
      </SectionCard>
      <SectionCard title="How it works" muted>
        <p className="instructions">
          Paste ECS specs, pick the destination region, and finalize the Huawei Cloud equivalents
          before generating the table and automation script.
        </p>
      </SectionCard>
    </PageLayout>
  );
}
