import React from "react";
import { getAllModules, deleteModule } from "@/actions/CRUD/modules";
import ModulesClient from "./ModulesClient";

export const dynamic = "force-dynamic";

export default async function ModulesPage() {
  const modules = await getAllModules();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Модулі</h1>
      <ModulesClient initialModules={modules} />
    </div>
  );
}
