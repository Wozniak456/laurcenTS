"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@nextui-org/react";

export default function ParametersPage() {
  const [parameters, setParameters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchParameters() {
      setLoading(true);
      try {
        const res = await fetch("/api/system/parameters");
        if (!res.ok) throw new Error("Помилка завантаження параметрів");
        const params = await res.json();
        setParameters(params);
      } catch (e: any) {
        setError(e.message || "Помилка завантаження параметрів");
      } finally {
        setLoading(false);
      }
    }
    fetchParameters();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Ви впевнені, що хочете видалити цей параметр?")) return;
    try {
      const res = await fetch(`/api/system/parameters?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Помилка видалення");
      setParameters((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setError(e.message || "Помилка видалення");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Параметри</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="mb-4 flex justify-end">
        <Button color="primary" as={Link} href="/system/parameters/new">
          Додати параметр
        </Button>
      </div>
      {loading ? (
        <div>Завантаження параметрів...</div>
      ) : (
        <table className="min-w-full table-auto border">
          <thead>
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Назва</th>
              <th className="border px-4 py-2">Опис</th>
              <th className="border px-4 py-2">Тип</th>
              <th className="border px-4 py-2">Модулі</th>
              <th className="border px-4 py-2" colSpan={2}>
                Значення
              </th>
              <th className="border px-4 py-2">Керування</th>
            </tr>
          </thead>
          <tbody>
            {parameters.map((param) => (
              <tr key={param.id}>
                <td className="border px-4 py-2">{param.id}</td>
                <td className="border px-4 py-2">{param.name}</td>
                <td className="border px-4 py-2">{param.description}</td>
                <td className="border px-4 py-2">
                  {param.kind === "constant" ? "Константа" : "Змінна"}
                </td>
                <td className="border px-4 py-2">
                  {param.parameterModules &&
                  param.parameterModules.length > 0 ? (
                    <div className="space-y-1">
                      {param.parameterModules.map((pm: any) => (
                        <div key={pm.id} className="text-sm">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {pm.modules.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      Не використовується
                    </span>
                  )}
                </td>
                <td className="border px-4 py-2">
                  {param.todaysValue !== null &&
                  param.todaysValue !== undefined ? (
                    <span className="font-semibold text-green-700">
                      {param.todaysValue}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="border px-4 py-2">
                  <Link
                    href={`/system/parameters/${param.id}/values`}
                    className="text-blue-600 underline"
                  >
                    Керувати
                  </Link>
                </td>
                <td className="border px-4 py-2 flex gap-2">
                  <Button
                    size="sm"
                    as={Link}
                    href={`/system/parameters/${param.id}/edit`}
                    color="secondary"
                  >
                    Редагувати
                  </Button>
                  {(!param.parameterModules ||
                    param.parameterModules.length === 0) && (
                    <Button
                      size="sm"
                      color="danger"
                      onClick={() => handleDelete(param.id)}
                    >
                      Видалити
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
