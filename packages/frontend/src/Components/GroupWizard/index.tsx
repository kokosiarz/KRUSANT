import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { GroupWizardProps, EMode } from './types';
import { groupTemplateFormStyles, stepDot } from './styles';
import {
    createHandleClose,
    createHandleSaveGroup,
} from './handlers';
import { mapTemplateToWizardData, mapGroupToWizardData } from './helpers';
import { useWizardLoading } from '../../hooks/useWizardLoading';
import { useQuery } from '@tanstack/react-query';
import { groupTemplatesApi } from '../../api/endpoints/groupTemplates';
import { useState, useRef } from 'react';
import { useGroupWizardData, GroupWizardDataProvider } from './Context/GroupWizardDataContext';
import { groupsApi } from '../../api/endpoints/groups';
import { validateStep } from './validationSchema';
import WizardButtons from './Buttons';
import { getStepList } from './config';
import { createHandleSaveTemplate } from './handlers/createHandleSaveTemplate';
import { GroupWizardProvider } from './Context/GroupWizardContext';
import { getStepComponent } from './Steps/AbstractFactory';
import { EStep } from './Steps/types';

const GroupWizardInner: React.FC<GroupWizardProps> = ({ open, onClose, mode, id, onSuccess }) => {
    const { loading, setLoading, error, setError, clearError } = useWizardLoading();

    const { data: allTemplates = [] } = useQuery({
        queryKey: ['groupTemplates'],
        queryFn: groupTemplatesApi.getGroupTemplates,
    });

    const { formData, setFormData, resetFormData } = useGroupWizardData();
    // Centralized validation logic will be used instead of useWizardValidation
    // Placeholder: canContinue, getValidationError to be replaced below
    // import { validateStep } from './validationSchema';

    const [currentStepNo, setCurrentStepNo] = useState(0);
    // Track if we should return to summary after editing a step
    const returnToSummaryAfterStep = useRef(false);
    const stepsList = getStepList(mode);
    const isTemplate = mode === EMode.CreateTemplate || mode === EMode.EditTemplate;

    // Load existing template or group only once per open
    const didInitRef = useRef(false);
    useEffect(() => {
        if (!open) {
            didInitRef.current = false;
            return;
        }
        if (didInitRef.current) return;
        didInitRef.current = true;

        const stepsListLocal = getStepList(mode);
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                if (id && mode === EMode.EditTemplate) {
                    const template = await groupTemplatesApi.getGroupTemplateById(id);
                    setFormData(mapTemplateToWizardData(template));
                    setCurrentStepNo(stepsListLocal.length - 1);
                } else if (id && mode === EMode.EditGroup) {
                    const group = await groupsApi.getGroupById(id);
                    setFormData(mapGroupToWizardData(group));
                    setCurrentStepNo(stepsListLocal.length - 1);
                } else {
                    resetFormData();
                    setCurrentStepNo(0);
                }

            } catch (err) {
                const msg = err instanceof Error ? err.message : `Nie udało się wczytać ${mode}`;
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, open, mode, setLoading, setError, setFormData, resetFormData]);

    const handleClose = createHandleClose({
        setFormData, 
        setError,
        setCurrentStep: setCurrentStepNo,
        onClose
    });

    // Centralized validation logic for step navigation
    const canContinue = (step: EStep) => !validateStep(step, formData, mode, { allTemplates, id });
    const getValidationError = (step: EStep) => validateStep(step, formData, mode, { allTemplates, id });

    const handleContinue = () => { 
        if (!canContinue(stepsList[currentStepNo].step)) {
            const err = getValidationError(stepsList[currentStepNo].step);
            if (err) setError(err);
            return;
        }
        setError(null);
        // If we came from summary, go back to summary step
        if (returnToSummaryAfterStep.current) {
            const summaryIdx = stepsList.findIndex(s => s.step === 'summary');
            if (summaryIdx !== -1) {
                setCurrentStepNo(summaryIdx);
                returnToSummaryAfterStep.current = false;
                return;
            }
        }
        setCurrentStepNo((prev) => prev + 1);
    };

    const handleSave = isTemplate
        ? createHandleSaveTemplate({ formData, allTemplates, groupTemplateId: id, setLoading, setError, onSuccess, handleClose })
        : createHandleSaveGroup({ formData, groupId: id, setLoading, setError, onSuccess, handleClose });

    // Escape key handler
    useEffect(() => {
        if (!open || loading) return;
        const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && handleClose();
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, loading, handleClose]);

    if (!open) return null;
    // Guard: prevent out-of-bounds access
    if (!stepsList.length || currentStepNo < 0 || currentStepNo >= stepsList.length) {
        return null;
    }
    // Only close on intentional mouse down outside the modal
    const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!loading && e.target === e.currentTarget) {
            handleClose();
        }
    };

    // Custom setter to allow SummaryWrapper to request return to summary after edit
    const setCurrentStepNoWithSummaryReturn = (n: number) => {
        if (stepsList[currentStepNo]?.step === 'summary' && stepsList[n]?.step !== 'summary') {
            returnToSummaryAfterStep.current = true; 
        }
        setCurrentStepNo(n);
    };

    return (
        <GroupWizardProvider
            mode={mode}
            id={id}
            stepsList={stepsList}
            // @ts-ignore
            currentStepNo={currentStepNo}
            setCurrentStepNo={setCurrentStepNoWithSummaryReturn}
        >
            <Box sx={groupTemplateFormStyles.overlay} onMouseDown={handleOverlayMouseDown}>
                <Box
                    sx={{
                        ...groupTemplateFormStyles.container,
                        ...(formData.colorHex && { border: `2px solid ${formData.colorHex}` }),
                    }}
                    onMouseDown={e => e.stopPropagation()}
                >
                    {loading ? (
                        <Box sx={groupTemplateFormStyles.loader}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box sx={groupTemplateFormStyles.stepHeader}>
                                <Box sx={groupTemplateFormStyles.progressRow}>
                                    {stepsList.map((step, idx: number) => (
                                        <Box
                                            key={idx}
                                            sx={stepDot(idx === currentStepNo, idx <= currentStepNo)}
                                            onClick={() => idx < currentStepNo && setCurrentStepNo(idx)}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={groupTemplateFormStyles.alert} onClose={clearError}>
                                    {error}
                                </Alert>
                            )}

                            <Box sx={groupTemplateFormStyles.content} className="summary-scrollable">
                                {getStepComponent(mode, {
                                    ...stepsList[currentStepNo],
                                    isMandatory: stepsList[currentStepNo].isMandatory ?? false
                                })}
                            </Box>

                            <WizardButtons
                                currentStep={currentStepNo}
                                totalSteps={stepsList.length}
                                onBack={() => setCurrentStepNo((p) => p - 1)}
                                onContinue={handleContinue}
                                onSkip={() => setCurrentStepNo((p) => p + 1)}
                                onSave={handleSave}
                                canContinue={canContinue(stepsList[currentStepNo].step)}
                                stepKey={stepsList[currentStepNo].step}
                            />
                        </>
                    )}
                </Box>
            </Box>
        </GroupWizardProvider>
    );
};

const GroupWizard: React.FC<GroupWizardProps> = (props) => (
    <GroupWizardDataProvider>
        <GroupWizardInner {...props} />
    </GroupWizardDataProvider>
);

export default GroupWizard;

