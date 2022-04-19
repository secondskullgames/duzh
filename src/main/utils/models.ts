import Ajv from 'ajv';

/**
 * Utility methods for working with models (in /data/) and schemas (in /data/schema)
 */

const schemaNames = ['palette-swaps', 'unit', 'equipment', 'predefined-map', 'generated-map', 'static-sprite', 'dynamic-sprite', 'tile-set'];

const ajv = new Ajv();
let loadedSchemas = false;

const _loadSchemas = async () => {
  for (const schemaName of schemaNames) {
    console.debug(`Loading schema ${schemaName}`);
    const schema = (await import(
      /* webpackMode: "lazy-once" */
      /* webpackChunkName: "schemas" */
      `../../../data/schema/${schemaName}.schema.json`
    )).default;
    ajv.addSchema(schema);
  }
};

const loadModel = async <T> (path: string, schemaName: string): Promise<T> => {
  if (!loadedSchemas) {
    await _loadSchemas();
    loadedSchemas = true;
  }
  const validate = ajv.getSchema(`${schemaName}.schema.json`);
  if (!validate) {
    throw new Error(`Failed to load schema ${schemaName}`);
  }

  console.debug(`Validating ${path}`);
  const data = (await import(
    /* webpackMode: "lazy-once" */
    /* webpackChunkName: "models" */
    `../../../data/${path}.json`
  )).default;
  if (!validate(data)) {
    throw new Error(`Failed to validate ${path}: ${JSON.stringify(validate.errors)}`);
  }
  return data as T;
};

export { loadModel };