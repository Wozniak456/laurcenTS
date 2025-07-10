"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Input,
  Button,
  Select,
  SelectItem,
  Checkbox,
  Spinner,
} from "@nextui-org/react";
import Link from "next/link";

export default function NewParameterPage() {
  const router = useRouter();
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [form, setForm] = useState({
    name: "",
    kind: "constant",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModules() {
      setLoading(true);
      try {
        const res = await fetch("/api/system/modules");
        if (!res.ok) throw new Error("Помилка завантаження модулів");
        const modules = await res.json();
        setModules(modules);
      } catch (e: any) {
        setError(e.message || "Помилка завантаження модулів");
      } finally {
        setLoading(false);
      }
    }
    fetchModules();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      // Create parameter
      const res = await fetch("/api/system/parameters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Помилка створення параметра");
      const param = await res.json();
      // Save module references
      if (selectedModules.length > 0) {
        await fetch(`/api/system/parameters/${param.id}/modules`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleIds: selectedModules }),
        });
      }
      router.push("/system/parameters");
    } catch (e: any) {
      setError(e.message || "Помилка створення");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-8">
        <Spinner /> Завантаження...
      </div>
    );
  return (
    <div className="container mx-auto p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Новий параметр</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Назва</label>
        <Input name="name" value={form.name} onChange={handleChange} />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Тип</label>
        <Select name="kind" value={form.kind} onChange={handleChange}>
          <SelectItem key="constant" value="constant">
            Константа
          </SelectItem>
          <SelectItem key="variable" value="variable">
            Змінна
          </SelectItem>
        </Select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Опис</label>
        <Input
          name="description"
          value={form.description}
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
          Створити
        </Button>
        <Button as={Link} href="/system/parameters" variant="bordered">
          Скасувати
        </Button>
      </div>
    </div>
  );
}
