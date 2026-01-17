import { TemplateNameInputWrapper } from './TemplateNameWrapper';
import { GroupNameInputWrapper } from './GroupNameWrapper';
import { TemplateSelectorWrapper } from './TemplateSelectorWrapper';
import { EStep } from '../types';
import { EMode } from '../../types';
import ColorPickerWrapper from './ColorPickerWrapper';
import StudentsPickerWrapper from './StudentsPickerWrapper';
import CourseSelectorWrapper from './CourseSelectorWrapper';
import TeacherSelectorWrapper from './TeacherSelectorWrapper';
import CostWrapperFactory from './CostWrapperFactory';
import { ECostMode } from '../Components/CostInput/types';
import RoomSelectorWrapper from './RoomSelectorWrapper';
import DatePickerWrapperFactory from './DatePickerWrapperFactory';
import { EDateMode } from '../../../Common/DatePicker/types';
import LessonLengthWrapper from './LessonLengthWrapper';
import StartHourWrapper from './StartHourWrapper';
import SummaryWrapper from './SummaryWrapper';

export const getStepComponent = (mode: EMode, step: {step: EStep, isMandatory: boolean, cost?: number, setCost?: (value: number) => void, currency?: string}) => {
    const isGroupMode = mode === EMode.CreateGroup || mode === EMode.EditGroup;
    const isTemplateMode = mode === EMode.CreateTemplate || mode === EMode.EditTemplate;
    switch (step.step) {
        case EStep.Name:
            return isGroupMode ? <GroupNameInputWrapper /> : <TemplateNameInputWrapper />;
        case EStep.Template:
            return <TemplateSelectorWrapper />;
        case EStep.Color:
            return <ColorPickerWrapper />;
        case EStep.Course:
            return <CourseSelectorWrapper />;
        case EStep.Teacher:
            return <TeacherSelectorWrapper />;
        case EStep.CostBase:
            return <CostWrapperFactory mode={ECostMode.total} />;
        case EStep.CostUnit:
            return <CostWrapperFactory mode={ECostMode.unit} />;
        case EStep.Room:
            return <RoomSelectorWrapper />;
        case EStep.DateStart:
            return <DatePickerWrapperFactory mode={EDateMode.startDate} />;
        case EStep.DateEnd:
            return <DatePickerWrapperFactory mode={EDateMode.endDate} />;
        case EStep.Students:
            return <StudentsPickerWrapper />;
        case EStep.LessonLength:
            return <LessonLengthWrapper />;
        case EStep.StartHour:
            return <StartHourWrapper />;
   
        case EStep.Summary:
            return <SummaryWrapper />;
        default:
            break;
    }
    return <>Error! Step Undefined!</>;
};
