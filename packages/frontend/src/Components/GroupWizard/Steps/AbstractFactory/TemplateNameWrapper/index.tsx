import { useGroupWizard } from '@components/GroupWizard/Context/useGroupWizard';
import { useGroupWizardData } from '@components/GroupWizard/Context/GroupWizardDataContext';
import React from 'react';
import NameInput from '../../Components/NameInput';

export const TemplateNameInputWrapper: React.FC = () => {
    const { mode } = useGroupWizard();
    const { formData, setFormData } = useGroupWizardData();
    const setName = (newName: string) => setFormData({ ...formData, templateName: newName });
    const name = formData.templateName || "";

    return (
        <NameInput mode={mode} name={name} setName={setName} />
    );
};

export default TemplateNameInputWrapper;