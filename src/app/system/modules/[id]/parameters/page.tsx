import React from "react";
import {
  getModuleWithParameters,
  getAllParametersForModule,
} from "@/actions/CRUD/modules";
import { notFound } from "next/navigation";
import ModuleParametersClient from "./ModuleParametersClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function ModuleParametersPage({ params }: PageProps) {
  const moduleId = parseInt(params.id);

  if (isNaN(moduleId)) {
    notFound();
  }

  const [module, allParameters] = await Promise.all([
    getModuleWithParameters(moduleId),
    getAllParametersForModule(),
  ]);

  if (!module) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Параметри модуля: {module.name}
        </h1>
        {module.description && (
          <p className="text-gray-600">{module.description}</p>
        )}
      </div>

      <ModuleParametersClient module={module} allParameters={allParameters} />
    </div>
  );
}
