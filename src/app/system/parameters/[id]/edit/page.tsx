"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Input,
  Button,
  Select,
  SelectItem,
  Checkbox,
  Spinner,
} from "@nextui-org/react";
import Link from "next/link";

export default function EditParameterPage() {
  const router = useRouter();
  const { id } = useParams();
  const [parameter, setParameter] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [paramRes, modulesRes] = await Promise.all([
          fetch(`/api/system/parameters/${id}`),
          fetch(`/api/system/modules`),
        ]);
        if (!paramRes.ok) throw new Error("Помилка завантаження параметра");
        if (!modulesRes.ok) throw new Error("Помилка завантаження модулів");
        const param = await paramRes.json();
        const modules = await modulesRes.json();
        setParameter(param);
        setModules(modules);
        setSelectedModules(
          param.parameterModules?.map((pm: any) => pm.module_id) || []
        );
      } catch (e: any) {
        setError(e.message || "Помилка завантаження");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="p-8">
        <Spinner /> Завантаження...
      </div>
    );
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!parameter) return null;

  const inUse =
    parameter.parameterModules && parameter.parameterModules.length > 0;

  // Find the value for a constant parameter
  let constantValue = null;
  if (
    parameter.kind === "constant" &&
    parameter.parametersvalues &&
    parameter.parametersvalues.length > 0
  ) {
    constantValue = parameter.parametersvalues[0]?.value ?? null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setParameter({ ...parameter, [e.target.name]: e.target.value });
  };

  const handleModuleToggle = (moduleId: number) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Save parameter fields
      const res = await fetch(`/api/system/parameters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parameter.name,
          kind: parameter.kind,
          description: parameter.description,
        }),
      });
      if (!res.ok) throw new Error("Помилка збереження параметра");
      // Save module references
      const modRes = await fetch(`/api/system/parameters/${id}/modules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleIds: selectedModules }),
      });
      if (!modRes.ok) throw new Error("Помилка збереження модулів");
      router.push("/system/parameters");
    } catch (e: any) {
      setError(e.message || "Помилка збереження");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Редагування параметра</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Назва</label>
        <Input
          name="name"
          value={parameter.name}
          onChange={handleChange}
          disabled={inUse}
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Тип</label>
        {inUse ? (
          <div className="py-2 px-3 bg-gray-100 rounded text-gray-700">
            {parameter.kind === "constant" ? "Константа" : "Змінна"}
          </div>
        ) : (
          <Select name="kind" value={parameter.kind} onChange={handleChange}>
            <SelectItem key="constant" value="constant">
              Константа
            </SelectItem>
            <SelectItem key="variable" value="variable">
              Змінна
            </SelectItem>
          </Select>
        )}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Опис</label>
        <Input
          name="description"
          value={parameter.description || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Модулі</label>
        <div className="flex flex-col gap-2">
          {modules.map((mod) => (
            <Checkbox
              key={mod.id}
              isSelected={selectedModules.includes(mod.id)}
              onChange={() => handleModuleToggle(mod.id)}
            >
              {mod.name}
            </Checkbox>
          ))}
        </div>
      </div>
      <div className="flex gap-4 mt-6">
        <Button color="primary" onClick={handleSave} isLoading={saving}>
          Зберегти
        </Button>
        <Button as={Link} href="/system/parameters" variant="bordered">
          Скасувати
        </Button>
      </div>
    </div>
  );
}
