import { randomUUID } from "crypto";

export type InstanceData = {
  type: string;
  kind: string;
  usage?: number;
  requests?: number;
  list?: string[];
  name?: string;
  vcpus?: number;
  memory?: number;
  flavor?: string;
};

export type InstanceRecord = {
  id: string;
  filename: string;
  filePath?: string;
  startPage: number;
  startY: number;
  endPage: number;
  endY: number;
  region: string;
  data: InstanceData[];
};

const instances = new Map<string, InstanceRecord>();
const DEFAULT_REGION = "LA-Sao Paulo1";

export function createInstance(filename: string, filePath?: string): InstanceRecord {
  const id = randomUUID();
  const record: InstanceRecord = {
    id,
    filename,
    filePath,
    startPage: -1,
    startY: -1,
    endPage: -1,
    endY: -1,
    region: DEFAULT_REGION,
    data: []
  };
  instances.set(id, record);
  return record;
}

export function getInstance(id: string | undefined): InstanceRecord | undefined {
  if (!id) {
    return undefined;
  }
  return instances.get(id);
}

export function requireInstance(id: string | undefined): InstanceRecord {
  const record = getInstance(id);
  if (!record) {
    throw new Error("No active session. Upload a PDF or add manual specs first.");
  }
  return record;
}

export function updateInstance(id: string, updates: Partial<InstanceRecord>): InstanceRecord {
  const record = requireInstance(id);
  const next = { ...record, ...updates };
  instances.set(id, next);
  return next;
}

export function setInstanceData(id: string, data: InstanceData[]): InstanceRecord {
  const record = requireInstance(id);
  record.data = data;
  instances.set(id, record);
  return record;
}
