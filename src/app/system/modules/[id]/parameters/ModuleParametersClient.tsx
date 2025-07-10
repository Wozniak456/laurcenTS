"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addParameterToModule,
  removeParameterFromModule,
} from "@/actions/CRUD/modules";

interface Parameter {
  id: number;
  name: string;
  description?: string | null;
  kind: "constant" | "variable";
}

interface ModuleParameter {
  id: number;
  parameter_id: number;
  module_id: number;
  parameters: Parameter;
}

interface Module {
  id: number;
  name: string;
  description?: string | null;
  parameterModules: ModuleParameter[];
}

interface ModuleParametersClientProps {
  module: Module;
  allParameters: Parameter[];
}

export default function ModuleParametersClient({
  module,
  allParameters,
}: ModuleParametersClientProps) {
  const [assignedParameters, setAssignedParameters] = useState<
    ModuleParameter[]
  >(module.parameterModules);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedParameterId, setSelectedParameterId] = useState<string>("");
  const router = useRouter();

  // Get parameters that are not yet assigned to this module
  const availableParameters = allParameters.filter(
    (param) => !assignedParameters.some((ap) => ap.parameter_id === param.id)
  );

  const handleAddParameter = async () => {
    if (!selectedParameterId) return;

    setIsLoading(true);
    const parameterId = parseInt(selectedParameterId);

    try {
      await addParameterToModule(module.id, parameterId);

      // Find the parameter details
      const parameter = allParameters.find((p) => p.id === parameterId);
      if (parameter) {
        const newModuleParameter: ModuleParameter = {
          id: Date.now(), // Temporary ID for UI
          parameter_id: parameterId,
          module_id: module.id,
          parameters: parameter,
        };

        setAssignedParameters([...assignedParameters, newModuleParameter]);
        setSelectedParameterId("");
      }
    } catch (error) {
      console.error("Error adding parameter to module:", error);
      alert("Помилка при додаванні параметра до модуля");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveParameter = async (parameterId: number) => {
    if (!confirm("Ви впевнені, що хочете видалити цей параметр з модуля?"))
      return;

    setIsLoading(true);

    try {
      await removeParameterFromModule(module.id, parameterId);
      setAssignedParameters(
        assignedParameters.filter((ap) => ap.parameter_id !== parameterId)
      );
    } catch (error) {
      console.error("Error removing parameter from module:", error);
      alert("Помилка при видаленні параметра з модуля");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Назад до модулів
        </button>
      </div>

      {/* Add Parameter Section */}
      <div className="bg-gray-50 p-4 rounded border">
        <h3 className="text-lg font-medium mb-4">Додати параметр до модуля</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Виберіть параметр
            </label>
            <select
              value={selectedParameterId}
              onChange={(e) => setSelectedParameterId(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || availableParameters.length === 0}
            >
              <option value="">Виберіть параметр...</option>
              {availableParameters.map((parameter) => (
                <option key={parameter.id} value={parameter.id}>
                  {parameter.name}{" "}
                  {parameter.description && `(${parameter.description})`}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddParameter}
            disabled={!selectedParameterId || isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? "Додавання..." : "Додати"}
          </button>
        </div>
        {availableParameters.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Всі доступні параметри вже додані до цього модуля
          </p>
        )}
      </div>

      {/* Assigned Parameters Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Параметри модуля</h3>
        </div>

        {assignedParameters.length > 0 ? (
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
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignedParameters.map((moduleParam) => (
                <tr key={moduleParam.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {moduleParam.parameters.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {moduleParam.parameters.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {moduleParam.parameters.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        moduleParam.parameters.kind === "constant"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {moduleParam.parameters.kind === "constant"
                        ? "Константа"
                        : "Змінна"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() =>
                        handleRemoveParameter(moduleParam.parameter_id)
                      }
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            До цього модуля ще не додано жодного параметра
          </div>
        )}
      </div>
    </div>
  );
}
