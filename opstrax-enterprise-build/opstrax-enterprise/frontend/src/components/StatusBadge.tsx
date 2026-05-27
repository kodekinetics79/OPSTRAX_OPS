import { statusClass } from '../utils/status';

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(status)}`}>{status}</span>;
}
