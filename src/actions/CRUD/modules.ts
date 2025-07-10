import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all modules
export async function getAllModules() {
  return prisma.modules.findMany({
    orderBy: { id: "asc" },
  });
}

// Get a single module by id
export async function getModuleById(id: number) {
  return prisma.modules.findUnique({
    where: { id },
  });
}

// Get module with its parameters
export async function getModuleWithParameters(id: number) {
  return prisma.modules.findUnique({
    where: { id },
    include: {
      parameterModules: {
        include: {
          parameters: true,
        },
      },
    },
  });
}

// Create a new module
export async function createModule(data: {
  name: string;
  description?: string;
}) {
  return prisma.modules.create({
    data,
  });
}

// Update a module
export async function updateModule(
  id: number,
  data: { name?: string; description?: string }
) {
  return prisma.modules.update({
    where: { id },
    data,
  });
}

// Delete a module
export async function deleteModule(id: number) {
  return prisma.modules.delete({ where: { id } });
}

// Get all parameters (for selection)
export async function getAllParametersForModule() {
  return prisma.parameters.findMany({
    orderBy: { name: "asc" },
  });
}

// Add parameter to module
export async function addParameterToModule(
  moduleId: number,
  parameterId: number
) {
  return prisma.parameter_module.create({
    data: {
      module_id: moduleId,
      parameter_id: parameterId,
    },
  });
}

// Remove parameter from module
export async function removeParameterFromModule(
  moduleId: number,
  parameterId: number
) {
  return prisma.parameter_module.deleteMany({
    where: {
      parameter_id: parameterId,
      module_id: moduleId,
    },
  });
}

// Get modules that use a specific parameter
export async function getModulesUsingParameter(parameterId: number) {
  return prisma.parameter_module.findMany({
    where: { parameter_id: parameterId },
    include: {
      modules: true,
    },
  });
}
