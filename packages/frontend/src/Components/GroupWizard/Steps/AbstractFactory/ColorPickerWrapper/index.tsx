import { useGroupWizard } from '@components/GroupWizard/Context/useGroupWizard';
import { useGroupWizardData } from '@components/GroupWizard/Context/GroupWizardDataContext';
import React from 'react';
import ColorPicker from '../../Components/ColorPicker';
import LoadingErrorHandler from '@/Components/Common/LoadingErrorHandler';

export const ColorPickerWrapper : React.FC = () => {
    const { mode, id } = useGroupWizard();
    const { formData, setFormData } = useGroupWizardData();
    const setColorHex = (newColorHex: string) => setFormData({ ...formData, colorHex: newColorHex });

    // Always use context state for controlled input
    const colorHex = formData.colorHex || "";

    // If ColorPicker does not fetch data, just wrap it for consistency
    return (
        <LoadingErrorHandler loading={false} error={undefined}>
          <ColorPicker mode={mode} colorHex={colorHex} setColorHex={setColorHex} />
        </LoadingErrorHandler>
    );
};

export default ColorPickerWrapper;

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