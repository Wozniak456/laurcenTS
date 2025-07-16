import { getActivePoolsCount, getPoolsComparison } from "@/utils/poolUtils";

export default async function TestActivePoolsPage() {
  const today = new Date().toISOString().split("T")[0];
  const { totalPools, activePools } = await getPoolsComparison(today);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Active Pools Test</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p>
          <strong>Date:</strong> {today}
        </p>
        <p>
          <strong>Total Pools:</strong> {totalPools}
        </p>
        <p>
          <strong>Active Pools:</strong> {activePools}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          This shows pools that have fish quantity &gt; 0 (truly active pools)
        </p>
      </div>
    </div>
  );
}
