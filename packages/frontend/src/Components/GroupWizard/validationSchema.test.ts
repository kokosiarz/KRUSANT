import { describe, it, expect } from 'vitest';
import { validateStep } from './validationSchema';
import { EStep } from './Steps/types';
import { EMode, GroupWizardData } from './types';
import { Group } from '../../Pages/Groups/types';

// The name step used to have two implementations — this schema for templates and
// a separate validationGroup.ts for groups, which meant only templates were
// actually checked for duplicates. They're one rule now; these pin both sides.

const group = (id: number, name: string) => ({ id, name }) as Group;

const data = (fields: Partial<GroupWizardData>) => fields as GroupWizardData;

const validateName = (
  fields: Partial<GroupWizardData>,
  mode: EMode,
  ctx?: Parameters<typeof validateStep>[3],
) => validateStep(EStep.Name, data(fields), mode, ctx);

describe('validateStep(EStep.Name)', () => {
  describe('group mode', () => {
    it('requires a non-blank name', () => {
      expect(validateName({ groupName: '   ' }, EMode.CreateGroup)).toBe(
        'Nazwa grupy jest wymagana',
      );
    });

    it('rejects a name already taken by another group, ignoring case', () => {
      const error = validateName({ groupName: 'poniedziałek' }, EMode.CreateGroup, {
        allGroups: [group(1, 'Poniedziałek')],
      });
      expect(error).toBe('Grupa o tej nazwie już istnieje. Wybierz inną nazwę.');
    });

    it('lets a group keep its own name while editing', () => {
      const error = validateName({ groupName: 'Poniedziałek' }, EMode.EditGroup, {
        allGroups: [group(1, 'Poniedziałek')],
        id: 1,
      });
      expect(error).toBeNull();
    });

    it('accepts a name no other group uses', () => {
      const error = validateName({ groupName: 'Wtorek' }, EMode.CreateGroup, {
        allGroups: [group(1, 'Poniedziałek')],
      });
      expect(error).toBeNull();
    });

    it('skips the duplicate check when the group list has not loaded yet', () => {
      expect(validateName({ groupName: 'Poniedziałek' }, EMode.CreateGroup)).toBeNull();
    });
  });

  describe('template mode', () => {
    it('still rejects a duplicate template name', () => {
      const error = validateName({ templateName: 'Podstawowy' }, EMode.CreateTemplate, {
        allTemplates: [{ templateId: 1, templateName: 'podstawowy' } as never],
      });
      expect(error).toBe('Szablon o tej nazwie już istnieje. Wybierz inną nazwę.');
    });

    it('does not confuse a group name for a template name', () => {
      const error = validateName({ templateName: 'Wtorek' }, EMode.CreateTemplate, {
        allGroups: [group(1, 'Wtorek')],
      });
      expect(error).toBeNull();
    });
  });
});
