/**
 * Generic duplicate service for any entity type
 * Can be used for templates, groups, students, etc.
 */

export interface DuplicateOptions {
  nameSuffix?: string; // e.g., "(kopia)", "(copy)", "(2)"
}

/**
 * Duplicates an entity by fetching it, modifying the name, and creating a new copy
 * @param entity - The entity to duplicate
 * @param entityId - The ID of the entity
 * @param allExistingEntities - List of all existing entities of the same type
 * @param fetchEntity - Function to fetch the full entity details
 * @param createEntity - Function to create a new entity
 * @param options - Configuration options for duplication
 * @returns The newly created duplicate entity
 */
export const duplicateEntity = async <T extends { id: number; [key: string]: any }>(
  entity: T,
  allExistingEntities: T[],
  fetchEntity: (id: number) => Promise<T>,
  createEntity: (data: any) => Promise<T>,
  nameField: string = 'templateName',
  options: DuplicateOptions = {}
): Promise<T> => {
  const nameSuffix = options.nameSuffix || '(kopia)';

  // Fetch the full entity details
  const fullEntity = await fetchEntity(entity.id);

  // Generate a unique name by adding a suffix
  let newName = `${fullEntity[nameField]} ${nameSuffix}`;
  let counter = 2;

  // Check if name exists and increment counter if needed
  // eslint-disable-next-line no-loop-func
  while (allExistingEntities.some((e) => e[nameField] === newName)) {
    counter++;
    newName = `${fullEntity[nameField]} (${counter})`;
  }

  // Create the duplicate entity with the new name, excluding the ID
  const { id, ...entityWithoutId } = fullEntity;
  const duplicateData = {
    ...entityWithoutId,
    [nameField]: newName,
  };

  const newEntity = await createEntity(duplicateData);
  return newEntity;
};

/**
 * Duplicates a template with automatic name generation
 * @param template - The template to duplicate
 * @param existingTemplates - List of all existing templates
 * @param fetchTemplate - Function to fetch template by ID
 * @param createTemplate - Function to create a new template
 * @returns The newly created duplicate template
 */
export const duplicateTemplate = async <T extends { id: number; templateName: string }>(
  template: T,
  existingTemplates: T[],
  fetchTemplate: (id: number) => Promise<T>,
  createTemplate: (data: any) => Promise<T>
): Promise<T> => {
  return duplicateEntity(
    template,
    existingTemplates,
    fetchTemplate,
    createTemplate,
    'templateName',
    { nameSuffix: '(kopia)' }
  );
};

