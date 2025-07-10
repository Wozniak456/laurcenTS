-- Add enum type for parameter kind
CREATE TYPE "ParameterKind" AS ENUM ('constant', 'variable');

-- Add 'kind' column to parameters table, defaulting to 'variable' for backward compatibility
ALTER TABLE "parameters" ADD COLUMN "kind" "ParameterKind" NOT NULL DEFAULT 'variable';

-- For existing parameters, you may want to update the kind as needed after migration.
