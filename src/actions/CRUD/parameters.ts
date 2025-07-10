import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type ParameterKind = "constant" | "variable";

// Get all parameters
export async function getAllParameters() {
  const params = await prisma.parameters.findMany({
    include: {
      parametersvalues: true,
      parameterModules: {
        include: {
          modules: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // For each parameter, find value to show in table
  return params.map((param) => {
    let todaysValue = null;
    if (param.parametersvalues && param.parametersvalues.length > 0) {
      if (param.kind === "constant") {
        // For constant, show the only value (if any)
        todaysValue = param.parametersvalues[0]?.value ?? null;
      } else {
        // For variable, show today's value (if any)
        const found = param.parametersvalues.find((v: any) => {
          if (!v.date) return false;
          const valueDate = new Date(v.date).toISOString().slice(0, 10);
          return valueDate === todayStr;
        });
        if (found) {
          todaysValue = found.value;
        }
      }
    }
    return { ...param, todaysValue };
  });
}

// Get a single parameter by id
export async function getParameterById(id: number) {
  return prisma.parameters.findUnique({
    where: { id },
    include: { parametersvalues: true },
  });
}

// Create a new parameter
export async function createParameter(data: {
  name: string;
  description?: string;
  kind: ParameterKind;
}) {
  return prisma.parameters.create({
    data,
  });
}

// Update a parameter
export async function updateParameter(
  id: number,
  data: { name?: string; description?: string; kind?: ParameterKind }
) {
  return prisma.parameters.update({
    where: { id },
    data,
  });
}

// Delete a parameter
export async function deleteParameter(id: number) {
  // Check if parameter is used by any modules
  const moduleUsage = await prisma.parameter_module.findMany({
    where: { parameter_id: id },
    include: { modules: true },
  });

  if (moduleUsage.length > 0) {
    const moduleNames = moduleUsage.map((pm) => pm.modules.name).join(", ");
    throw new Error(
      `Параметр використовується в модулях: ${moduleNames}. Спочатку видаліть параметр з цих модулів.`
    );
  }

  // Also delete all values for this parameter
  await prisma.parametersvalues.deleteMany({ where: { parameter_id: id } });
  return prisma.parameters.delete({ where: { id } });
}

// Get values for a parameter
export async function getParameterValues(parameter_id: number) {
  return prisma.parametersvalues.findMany({
    where: { parameter_id },
    orderBy: { date: "desc" },
  });
}

// Add a value for a parameter
export async function addParameterValue(
  parameter_id: number,
  value: string,
  date: Date
) {
  const param = await prisma.parameters.findUnique({
    where: { id: parameter_id },
  });
  if (!param) throw new Error("Parameter not found");
  if ((param as any).kind === "constant") {
    // Only allow one value for constant
    const existing = await prisma.parametersvalues.findFirst({
      where: { parameter_id },
    });
    if (existing) throw new Error("Constant parameter can only have one value");
    return prisma.parametersvalues.create({
      data: { parameter_id, value, date },
    });
  } else {
    // Variable: allow periodic values
    return prisma.parametersvalues.create({
      data: { parameter_id, value, date },
    });
  }
}

// Update a value for a parameter
export async function updateParameterValue(id: any, value: string, date: Date) {
  return prisma.parametersvalues.update({
    where: { id },
    data: { value, date },
  });
}

// Delete a value for a parameter
export async function deleteParameterValue(id: any) {
  return prisma.parametersvalues.delete({ where: { id } });
}
