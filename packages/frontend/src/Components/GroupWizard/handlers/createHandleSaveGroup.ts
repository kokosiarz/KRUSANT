
import { groupsApi } from '@api/endpoints/groups';
import { GroupWizardData } from '../types';
import { Course } from '@api/types/course';
import { getStepList } from '../config';
import { EMode } from '../types';
import { validateAllMandatory } from '../validationSchema';

export type ClassCreationArgs = {
  groupId?: number;
  formData: GroupWizardData;
  finalClassDates: string[];
  courses: Course[];
};

type SetLoading = React.Dispatch<React.SetStateAction<boolean>>;
type SetError = React.Dispatch<React.SetStateAction<string | null>>;

type Params = {
  formData: GroupWizardData;
  groupId?: number;
  setLoading: SetLoading;
  setError: SetError;
  onSuccess?: () => void;
  handleClose: () => void;
};

const toIsoSeconds = (value?: string) => {
  if (!value) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
};

const buildGroupPayload = (data: GroupWizardData) => ({
  name: data.groupName || data.templateName,
  baseTemplateName: data.baseTemplateName || data.templateName,
  isActive: data.isActive,
  studentIds: data.studentIds,
  classIds: data.classIds,
  cost: data.cost,
  unitCost: data.unitCost,
  courseId: data.courseId ?? null,
  teacherId: data.teacherId ?? null,
  comment: data.comment,
  minStartDate: data.minStartDate,
  maxEndDate: data.maxEndDate,
  colorHex: data.colorHex,
  roomId: data.roomId,
  startHour: data.startHour,
  startDateTime: toIsoSeconds(data.startDateTime),
  lessonLength: data.lessonLength,
});

export const createHandleSaveGroup = ({
  formData,
  groupId,
  setLoading,
  setError,
  onSuccess,
  handleClose,
}: Params) => async () => {
  try {
    setLoading(true);
    setError(null);

    // Centralized validation using validateAllMandatory
    const stepsList = getStepList(EMode.CreateGroup); // or pass mode if available
    const error = validateAllMandatory(stepsList, formData, EMode.CreateGroup, {});
    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    const payload = buildGroupPayload(formData);

    if (groupId) {
      await groupsApi.updateGroup(groupId, payload);
    } else {
      await groupsApi.createGroup(payload);
    }
    onSuccess?.();
    handleClose();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Błąd podczas zapisywania grupy');
    console.error('Error saving group:', err);
  } finally {
    setLoading(false);
  }
};
