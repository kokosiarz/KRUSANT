import { useGroupWizard } from '@components/GroupWizard/Context/useGroupWizard';
import { useGroupWizardData } from '@components/GroupWizard/Context/GroupWizardDataContext';
import React from 'react';
import NameInput from '../../Components/NameInput';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '@api/endpoints/groups';
import { getGroupNameError } from '../../../validationGroup';


export const GroupNameInputWrapper: React.FC = () => {
    const { mode, id } = useGroupWizard();
    const { formData, setFormData } = useGroupWizardData();
    const setName = (newName: string) => setFormData({ ...formData, groupName: newName });

    // Always use context state for controlled input
    const name = formData.groupName || formData.baseTemplateName || "";

    // Fetch all groups for validation
    const { data: allGroups = [], isLoading } = useQuery({
        queryKey: ['groups'],
        queryFn: groupsApi.getGroups,
        staleTime: 60_000,
    });

    // Responsive validation
    const error = (mode === 'create-group' || mode === 'edit-group')
        ? getGroupNameError(name, allGroups, id)
        : undefined;

    return (
        <NameInput mode={mode} name={name} setName={setName} error={error} loading={isLoading} />
    );
};

export default GroupNameInputWrapper;

// import { useGroupWizard } from '@components/GroupWizard/Context/useGroupWizard';
// import { useGroupWizardData } from '@components/GroupWizard/Context/GroupWizardDataContext';
// import React from 'react';
// import { groupTemplatesApi } from '@api/endpoints/groupTemplates';
// import { useQuery } from '@tanstack/react-query';
// import { groupsApi } from '@api/endpoints/groups';
// import { EMode } from '@/Components/GroupWizard/types';
// import Name from '../../Components/Name';

// export const GroupNameInput: React.FC = () => {
//     const { mode, id } = useGroupWizard();
//     const { formData, setFormData } = useGroupWizardData();
//     const isGroupMode = mode === EMode.CreateGroup || mode === EMode.EditGroup;
//     const templateQuery = useQuery({
//         queryKey: ['getGroupTemplateById', id],
//         queryFn: ({ queryKey }) => groupTemplatesApi.getGroupTemplateById(id as number),
//         enabled: !!id && !isGroupMode,
//     })
//     const groupQuery = useQuery({
//         queryKey: ['getGroupById', id],
//         queryFn: ({ queryKey }) => groupsApi.getGroupById(id as number),
//         enabled: !!id && isGroupMode,
//     })

//     const setName = (newName: string) => isGroupMode ?
//         setFormData({ ...formData, groupName: newName })
//         : setFormData({ ...formData, templateName: newName });

//     let name: string = "";

//     if (mode === EMode.CreateGroup) {
//         name = "";
//     }
//     if (mode === EMode.EditGroup) {
//         name = groupQuery?.data?.name || "";
//     }
//     if (mode === EMode.CreateTemplate) {
//         name = "";
//     }
//     if (mode === EMode.EditTemplate) {
//         name = templateQuery?.data?.templateName || "";
//     }

//     return (
//         <Name mode={mode} name={name} setName={setName}/>
//     );
// };

// export default GroupNameInput;