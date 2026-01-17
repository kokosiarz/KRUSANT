import React from 'react';
import { CostInput } from '../../Components';
import { ECostMode } from '../../Components/CostInput/types';
import { settingsApi } from '../../../../../api/endpoints/settings';
import { useQuery } from '@tanstack/react-query';
import { useGroupWizardData } from '../../../Context/GroupWizardDataContext';

const CostWrapperFactory: React.FC<{ mode: ECostMode }> = ({ mode }) => {
  const { formData, setFormData } = useGroupWizardData();
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  });
  const currency = settings?.currency || '';

  // Use cost or unitCost from wizard data depending on mode
  const value = mode === ECostMode.unit
    ? (typeof formData.unitCost === 'number' ? formData.unitCost : 0)
    : (typeof formData.cost === 'number' ? formData.cost : 0);
  const setValue = (val: number) => {
    setFormData({
      ...formData,
      ...(mode === ECostMode.unit ? { unitCost: val } : { cost: val })
    });
  };

  return (
    <CostInput
      cost={value}
      setCost={setValue}
      currency={currency}
      mode={mode}
    />
  );
};

export default CostWrapperFactory;
