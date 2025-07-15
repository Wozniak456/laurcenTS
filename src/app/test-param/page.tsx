"use client";

import { useEffect, useState } from "react";

export default function TestParamPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkParam() {
      try {
        const res = await fetch("/api/system/parameters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "debug-feeding-param" }),
        });
        const data = await res.json();
        setResult(data);
      } catch (error) {
        console.error("Error checking parameter:", error);
      } finally {
        setLoading(false);
      }
    }
    checkParam();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Parameter Debug</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
