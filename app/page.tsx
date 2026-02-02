import Link from "next/link";
import GetDataButton from "@/components/GetDataButton";
import LinkButton from "@/components/LinkButton";
import PageLayout from "@/components/PageLayout";
import SectionCard from "@/components/SectionCard";

export default function HomePage() {
  return (
    <PageLayout
      title="AWS Invoice Converter"
      subtitle="Follow the guided workflow to generate Huawei Cloud equivalents from an AWS invoice."
      maxWidth="lg"
    >
      <div className="grid-two">
        <SectionCard
          title="1. Upload & parse"
          subtitle="Start by uploading your AWS invoice PDF and selecting the relevant positions."
        >
          <div className="link-stack">
            <LinkButton href="/file-receive">Send PDF File</LinkButton>
            <LinkButton href="/select-positions" variant="secondary">
              Select Positions
            </LinkButton>
            <GetDataButton />
          </div>
        </SectionCard>

        <SectionCard
          title="2. Manual specs"
          subtitle="Alternatively, paste ECS specs directly if you already know them."
          muted
        >
          <div className="link-stack">
            <LinkButton href="/manual-specs">Add ECS Specs Manually</LinkButton>
          </div>
        </SectionCard>

        <SectionCard
          title="3. Select matches"
          subtitle="Finalize region and ECS equivalents before generating the table output."
        >
          <div className="link-stack">
            <LinkButton href="/select-region" variant="secondary">
              Select Region
            </LinkButton>
            <LinkButton href="/select-ecs" variant="secondary">
              Select ECS Equivalent
            </LinkButton>
            <LinkButton href="/table">See Table</LinkButton>
          </div>
        </SectionCard>

        <SectionCard
          title="Need Excel exports?"
          subtitle="Combine multiple Excel reports into a single file for analysis."
          muted
        >
          <div className="link-stack">
            <LinkButton href="/excel-maker" variant="success">
              Open Excel Maker
            </LinkButton>
          </div>
          <p className="instructions">
            Click the floating chart icon anytime to jump straight to the Excel maker.
          </p>
        </SectionCard>
      </div>

      <SectionCard title="How it works" muted>
        <p className="instructions">
          This workspace helps map AWS invoice line items to Huawei Cloud services. Follow the
          buttons from top to bottom, review the suggested ECS equivalents, and copy automation
          code for the Huawei price calculator.
        </p>
      </SectionCard>

      <Link href="/excel-maker" className="floating-action" aria-label="Excel Maker">
        📊
      </Link>
    </PageLayout>
  );
}
