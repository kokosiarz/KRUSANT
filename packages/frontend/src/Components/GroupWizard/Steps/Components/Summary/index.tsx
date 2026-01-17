import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { Course } from '../../../../../api/types/course';
import { Room } from '../../../../../api/types/room';
import { useSettings } from '../../../../../context/Settings';
import { copy } from './copy';

import TextField from '@mui/material/TextField';
import './styles.css';
export type StepSummaryProps = {
    formData: any;
    courses: Course[];
    rooms: Room[];
    teachers: any[];
    onEditStep?: (stepId: string) => void;
    onCommentChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const formatLessonLength = (time?: string) => {
    if (!time) return '—';
    // Expecting format 'HH:mm' or 'H:mm'
    const [hoursStr, minsStr] = time.split(':');
    const hours = parseInt(hoursStr, 10);
    const mins = parseInt(minsStr, 10);
    if (isNaN(hours) || isNaN(mins)) return time;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} h`;
    return `${hours} h ${mins} min`;
};

const formatDateBoundary = (date?: { year?: number; month?: number; day?: number }) => {
    if (!date || date.day === undefined || date.month === undefined) return '—';
    const mm = String(date.month).padStart(2, '0');
    const dd = String(date.day).padStart(2, '0');
    if (date.year) {
        return `${date.year}-${mm}-${dd}`;
    }
    return `${dd}.${mm}`;
};

const formatCurrency = (amount?: number, currency?: string) => {
    if (amount === undefined || amount === null) return '—';
    const currencyCode = currency || 'PLN';
    return `${amount.toFixed(2)} ${currencyCode}`;
};

const Summary: React.FC<StepSummaryProps> = ({
    formData,
    courses,
    rooms,
    teachers,
    onEditStep,
    onCommentChange,
}) => {
    const { currency } = useSettings();
    const course = courses.find((c) => c.id === formData.courseId);
    const room = rooms.find((r) => r.id === formData.roomId);
    const teacher = teachers.find((t) => t.id === formData.teacherId);

    // Map EStep to field and render logic
    const stepFieldMap: { [key: string]: any } = {
        template: null, // not shown in summary
        course: course?.name,
        name: formData.groupName && formData.groupName.trim() !== ''
            ? formData.groupName
            : formData.templateName,
        groupName: formData.groupName,
        baseTemplateName: formData.baseTemplateName,
        color: formData.colorHex,
        costBase: formData.cost,
        costUnit: formData.unitCost,
        dateStart: formData.minStartDate,
        dateEnd: formData.maxEndDate,
        lessonLength: formData.lessonLength,
        startHour: formData.startHour,
        room: room?.name,
        teacher: teacher?.name,
        students: formData.studentIds,
        classes: formData.classIds,
        summary: null,
    };

    // Get current steps from config
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getStepList } = require('../../../config');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { EStep } = require('../../types');
    // Try to get mode from formData or fallback
    const mode = formData.mode || 'create-group';
    const steps = getStepList(mode);

    return (
        <Box className="summary-root">
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">{copy.title}</Typography>
                {formData.colorHex && (
                    <Box className="summary-color-dot" style={{ backgroundColor: formData.colorHex }} />
                )}
            </Stack>
            <Divider />
            <br/>
            <Stack spacing={1.5}>
                {steps.map(({ step }: { step: string }) => {
                    if (!stepFieldMap.hasOwnProperty(step)) return null;
                    const value = stepFieldMap[step];
                    // Show all fields, indicate if not set
                    const isUnset =
                        value === null ||
                        value === undefined ||
                        (Array.isArray(value) && value.length === 0) ||
                        (typeof value === 'string' && value.trim() === '');
                    // Custom rendering for some fields
                    // Pencil always jumps to the step for this field
                    const pencilHandler = () => onEditStep && onEditStep(step);
                    switch (step) {
                        case 'course':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>{copy.fields.course}</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : value}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'name':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>{copy.fields.name}</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : value}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'groupName':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>Grupa:</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : value}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'baseTemplateName':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>Szablon bazowy:</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : value}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'color':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>Kolor:</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : value}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'costBase':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>{copy.fields.cost}</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : formatCurrency(value, currency)}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'costUnit':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>{copy.fields.unitCost}</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : formatCurrency(value, currency)}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'dateStart':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>{copy.fields.minStart}</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : formatDateBoundary(value)}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'dateEnd':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>{copy.fields.maxEnd || 'Data końca do:'}</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : formatDateBoundary(value)}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'lessonLength':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>{copy.fields.lessonLength}</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : formatLessonLength(value)}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'startHour':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>{copy.fields.startHour}</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : value}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'room':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>{copy.fields.room}</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : value}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'teacher':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>{copy.fields.teacher}</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : value}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'students':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>Kursanci:</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : Array.isArray(value) ? value.length : value}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        case 'classes':
                            return (
                                <Box className="summary-row" key={step}>
                                    <Typography variant="body1"><strong>Zajęcia:</strong> {isUnset ? <span style={{color:'gray'}}>nie ustawiono</span> : Array.isArray(value) ? value.length : value}</Typography>
                                    <IconButton size="small" color="primary" onClick={pencilHandler}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            );
                        default:
                            return null;
                    }
                })}
                {/* Always show comment if set */}
                {formData.comment && (
                    <Box className="summary-comment">
                        <Typography variant="body1"><strong>{copy.fields.comment}</strong></Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            name="comment"
                            value={formData.comment || ''}
                            onChange={onCommentChange}
                            placeholder="Dodaj komentarz"
                            size="small"
                        />
                    </Box>
                )}
                {/* Always show status if set */}
                {typeof formData.isActive === 'boolean' && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1"><strong>Status:</strong> {formData.isActive ? 'Aktywna' : 'Nieaktywna'}</Typography>
                    </Box>
                )}
                {/* Always show startDateTime if set */}
                {formData.startDateTime && (
                    <Box className="summary-row">
                        <Typography variant="body1"><strong>Start zajęć:</strong> {formData.startDateTime}</Typography>
                        {onEditStep && (
                            <IconButton size="small" color="primary" onClick={() => onEditStep('dateStart')}><EditIcon fontSize="small" /></IconButton>
                        )}
                    </Box>
                )}
            </Stack>
        </Box>
    );
};

export default Summary;
