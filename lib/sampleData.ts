export type ConvertedItem = {
  type: string;
  kind: string;
  usage: string;
  requests: string;
};

export const convertedItems: ConvertedItem[] = [
  {
    type: "ECS",
    kind: "Compute",
    usage: "730 hours",
    requests: "On-demand"
  },
  {
    type: "EVS",
    kind: "Storage",
    usage: "500 GB-month",
    requests: "Standard"
  },
  {
    type: "ELB",
    kind: "Networking",
    usage: "120 hours",
    requests: "Public IPv4"
  },
  {
    type: "SMN",
    kind: "Messaging",
    usage: "1,200 notifications",
    requests: "Standard"
  }
];

export const unavailableItems = [
  "AWS License Manager",
  "Amazon Inspector",
  "AWS Savings Plans"
];
