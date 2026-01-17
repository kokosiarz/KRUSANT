export const isTemplateNameEmpty = (templateName: string): boolean => {
  return !templateName.trim();
};

export const isDuplicateTemplateName = (
  templateName: string,
  allTemplates: any[],
  groupTemplateId?: number
): boolean => {
  return allTemplates.some(
    (template: any) =>
      template.templateName.toLowerCase() === templateName.toLowerCase() &&
      template.id !== groupTemplateId
  );
};

export const getTemplateNameError = (
  templateName: string,
  allTemplates: any[],
  groupTemplateId?: number
): string | null => {
  if (isTemplateNameEmpty(templateName)) {
    return 'Nazwa szablonu jest wymagana';
  }

  if (isDuplicateTemplateName(templateName, allTemplates, groupTemplateId)) {
    return 'Szablon o tej nazwie już istnieje. Wybierz inną nazwę.';
  }

  return null;
};
