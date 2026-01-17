import { Group } from '../Pages/Groups/types';

export const isGroupNameEmpty = (groupName: string): boolean => {
  return !groupName.trim();
};

export const isDuplicateGroupName = (
  groupName: string,
  allGroups: Group[],
  groupId?: number
): boolean => {
  return allGroups.some(
    (group: Group) =>
      group.name.toLowerCase() === groupName.toLowerCase() &&
      group.id !== groupId
  );
};

export const getGroupNameError = (
  groupName: string,
  allGroups: Group[],
  groupId?: number
): string | null => {
  if (isGroupNameEmpty(groupName)) {
    return 'Nazwa grupy jest wymagana';
  }

  if (isDuplicateGroupName(groupName, allGroups, groupId)) {
    return 'Grupa o tej nazwie już istnieje. Wybierz inną nazwę.';
  }

  return null;
};
