"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createModule,
  updateModule,
  deleteModule,
} from "@/actions/CRUD/modules";

interface Module {
  id: number;
  name: string;
  description?: string | null;
}

interface ModulesClientProps {
  initialModules: Module[];
}

export default function ModulesClient({ initialModules }: ModulesClientProps) {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [isLoading, setIsLoading] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();

  const handleAddModule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    try {
      const response = await fetch("/api/system/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error("API error:", result);
        throw new Error(result?.error || "Failed to create module");
      }
      setModules([...modules, result]);
      setShowAddForm(false);
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error adding module:", error);
      alert("Помилка при додаванні модуля");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditModule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingModule) return;

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    try {
      const updatedModule = await updateModule(editingModule.id, {
        name,
        description,
      });
      setModules(
        modules.map((m) => (m.id === editingModule.id ? updatedModule : m))
      );
      setEditingModule(null);
    } catch (error) {
      console.error("Error updating module:", error);
      alert("Помилка при оновленні модуля");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModule = async (id: number) => {
    if (!confirm("Ви впевнені, що хочете видалити цей модуль?")) return;

    setIsLoading(true);

    try {
      await deleteModule(id);
      setModules(modules.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Error deleting module:", error);
      alert("Помилка при видаленні модуля");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageParameters = (moduleId: number) => {
    router.push(`/system/modules/${moduleId}/parameters`);
  };

  return (
    <div className="space-y-6">
      {/* Add Module Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Список модулів</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          Додати модуль
        </button>
      </div>

      {/* Add Module Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="text-lg font-medium mb-4">Додати новий модуль</h3>
          <form onSubmit={handleAddModule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Назва *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Опис</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                {isLoading ? "Збереження..." : "Зберегти"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Скасувати
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Module Form */}
      {editingModule && (
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="text-lg font-medium mb-4">Редагувати модуль</h3>
          <form onSubmit={handleEditModule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Назва *</label>
              <input
                type="text"
                name="name"
                defaultValue={editingModule.name}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Опис</label>
              <textarea
                name="description"
                defaultValue={editingModule.description || ""}
                rows={3}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                {isLoading ? "Збереження..." : "Зберегти"}
              </button>
              <button
                type="button"
                onClick={() => setEditingModule(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Скасувати
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modules Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Назва
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Опис
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дії
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {modules.map((module) => (
              <tr key={module.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {module.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {module.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {module.description || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleManageParameters(module.id)}
                    className="text-blue-600 hover:text-blue-900"
                    disabled={isLoading}
                  >
                    Параметри
                  </button>
                  <button
                    onClick={() => setEditingModule(module)}
                    className="text-indigo-600 hover:text-indigo-900"
                    disabled={isLoading}
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={isLoading}
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {modules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Модулі не знайдено
          </div>
        )}
      </div>
    </div>
  );
}
