import { useGroupWizard } from '@components/GroupWizard/Context/useGroupWizard';
import { useGroupWizardData } from '@components/GroupWizard/Context/GroupWizardDataContext';
import React from 'react';
import NameInput from '../../Components/NameInput';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '@api/endpoints/groups';
import { validateStep } from '@components/GroupWizard/validationSchema';
import { EMode } from '@components/GroupWizard/types';
import { EStep } from '@components/GroupWizard/Steps/types';

export const GroupNameInputWrapper: React.FC = () => {
    const { mode, id } = useGroupWizard();
    const { formData, setFormData } = useGroupWizardData();
    const setName = (newName: string) => setFormData({ ...formData, groupName: newName });

    // Always use context state for controlled input
    const name = formData.groupName || formData.baseTemplateName || "";

    // Fetch all groups so the name can be checked against existing ones
    const { data: allGroups = [], isLoading } = useQuery({
        queryKey: ['groups'],
        queryFn: groupsApi.getGroups,
        staleTime: 60_000,
    });

    // Responsive validation, through the same rule the wizard applies on save.
    // `name` (not formData.groupName) is what the field shows, so validate that.
    const isGroupMode = mode === EMode.CreateGroup || mode === EMode.EditGroup;
    const error = isGroupMode
        ? validateStep(EStep.Name, { ...formData, groupName: name }, mode, { allGroups, id })
        : undefined;

    return (
        <NameInput mode={mode} name={name} setName={setName} error={error} loading={isLoading} />
    );
};

export default GroupNameInputWrapper;
