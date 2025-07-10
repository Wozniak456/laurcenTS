"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";

export default function ParameterValuesPage({
  params,
}: {
  params: { id: string };
}) {
  const [parameter, setParameter] = useState<any>(null);
  const [values, setValues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");
  const [newDate, setNewDate] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/system/parameters/${params.id}/values`);
        if (!res.ok) throw new Error("Помилка завантаження значень");
        const data = await res.json();
        setParameter(data.parameter);
        setValues(data.values);
      } catch (e: any) {
        setError(e.message || "Помилка завантаження значень");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  const handleAdd = async () => {
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(`/api/system/parameters/${params.id}/values`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue, date: newDate }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Помилка додавання");
      }
      setNewValue("");
      setNewDate("");
      // Refresh values
      const updated = await fetch(`/api/system/parameters/${params.id}/values`);
      const data = await updated.json();
      setParameter(data.parameter);
      setValues(data.values);
    } catch (e: any) {
      setError(e.message || "Помилка додавання");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (valueId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити це значення?")) return;
    setDeletingId(valueId);
    setError(null);
    try {
      const res = await fetch(
        `/api/system/parameters/${params.id}/values?valueId=${valueId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Помилка видалення");
      }
      // Refresh values
      const updated = await fetch(`/api/system/parameters/${params.id}/values`);
      const data = await updated.json();
      setParameter(data.parameter);
      setValues(data.values);
    } catch (e: any) {
      setError(e.message || "Помилка видалення");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-8">Завантаження значень...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!parameter)
    return <div className="p-8 text-red-600">Параметр не знайдено</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">
        Значення параметра: {parameter.name}
      </h1>
      <div className="mb-2 text-gray-600">{parameter.description}</div>
      <div className="mb-4 font-semibold">
        Тип: {parameter.kind === "constant" ? "Константа" : "Змінна"}
      </div>
      {parameter.kind === "constant" ? (
        <div>
          <div className="mb-2">Поточне значення:</div>
          {values.length > 0 ? (
            <div className="mb-2">{values[0].value}</div>
          ) : (
            <div className="mb-2 text-gray-500">(немає значення)</div>
          )}
          {values.length === 0 && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="border rounded p-2"
                placeholder="Значення"
              />
              <Button
                color="primary"
                onClick={handleAdd}
                disabled={adding || !newValue}
              >
                Додати
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-2">Значення (періодичні):</div>
          <table className="min-w-full table-auto border mb-4">
            <thead>
              <tr>
                <th className="border px-4 py-2">Дата</th>
                <th className="border px-4 py-2">Значення</th>
                <th className="border px-4 py-2">Дії</th>
              </tr>
            </thead>
            <tbody>
              {values.map((v) => (
                <tr key={v.id}>
                  <td className="border px-4 py-2">{v.date?.slice(0, 10)}</td>
                  <td className="border px-4 py-2">{v.value}</td>
                  <td className="border px-4 py-2">
                    <Button
                      size="sm"
                      color="danger"
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingId === v.id}
                    >
                      Видалити
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="border rounded p-2"
            />
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="border rounded p-2"
              placeholder="Значення"
            />
            <Button
              color="primary"
              onClick={handleAdd}
              disabled={adding || !newValue || !newDate}
            >
              Додати
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
