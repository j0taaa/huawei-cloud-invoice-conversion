export type EcsOption = {
  flavor: string;
  vCPUs: number;
  memory: number;
  category: "ECS" | "Flexus";
};

export type AwsFlavor = {
  name: string;
  vCPUs: number;
  memory: number;
  options: EcsOption[];
};

export const ecsMappings: AwsFlavor[] = [
  {
    name: "m5.large",
    vCPUs: 2,
    memory: 8,
    options: [
      { flavor: "s6.large.2", vCPUs: 2, memory: 8, category: "ECS" },
      { flavor: "s7.large.2", vCPUs: 2, memory: 8, category: "ECS" },
      { flavor: "c6.large.2", vCPUs: 2, memory: 8, category: "ECS" },
      { flavor: "m6.large.2", vCPUs: 2, memory: 8, category: "ECS" },
      { flavor: "m6.2xlarge.2", vCPUs: 4, memory: 16, category: "ECS" },
      { flavor: "flexus.medium", vCPUs: 2, memory: 8, category: "Flexus" }
    ]
  },
  {
    name: "t3.medium",
    vCPUs: 2,
    memory: 4,
    options: [
      { flavor: "s6.medium.2", vCPUs: 2, memory: 4, category: "ECS" },
      { flavor: "s7.medium.2", vCPUs: 2, memory: 4, category: "ECS" },
      { flavor: "c6.medium.2", vCPUs: 2, memory: 4, category: "ECS" },
      { flavor: "m6.medium.2", vCPUs: 2, memory: 4, category: "ECS" },
      { flavor: "m6.large.2", vCPUs: 2, memory: 8, category: "ECS" },
      { flavor: "flexus.small", vCPUs: 2, memory: 4, category: "Flexus" }
    ]
  },
  {
    name: "r5.xlarge",
    vCPUs: 4,
    memory: 32,
    options: [
      { flavor: "s6.xlarge.4", vCPUs: 4, memory: 32, category: "ECS" },
      { flavor: "s7.xlarge.4", vCPUs: 4, memory: 32, category: "ECS" },
      { flavor: "m6.xlarge.4", vCPUs: 4, memory: 32, category: "ECS" },
      { flavor: "m6.2xlarge.4", vCPUs: 8, memory: 64, category: "ECS" },
      { flavor: "r6.xlarge.4", vCPUs: 4, memory: 32, category: "ECS" },
      { flavor: "flexus.large", vCPUs: 4, memory: 32, category: "Flexus" }
    ]
  }
];
