import { EMode } from "./types";
import { EStep } from "./Steps/types";

const steps = {
  [EMode.CreateGroup]: [
    {
      step: EStep.Template,
    },
    {
      step: EStep.Name,
      isMandatory: true,
    },
    {
      step: EStep.Color,
      isMandatory: true,
    },
    {
      step: EStep.DateStart,
      isMandatory: true,
    },
    {
      step: EStep.DateEnd,
    },
    {
      step: EStep.CostBase,
      isMandatory: true,
    },
    {
      step: EStep.CostUnit,
      isMandatory: true,
    },
    {
      step: EStep.StartHour,
    },
    {
      step: EStep.LessonLength,
      isMandatory: true,
    },
    {
      step: EStep.Students,
    },
    {
      step: EStep.Teacher,
      isMandatory: true,
    },
    {
      step: EStep.Room,
    },
    {
      step: EStep.Summary,
    },
  ],
  [EMode.EditGroup]: [
{
      step: EStep.Name,
      isMandatory: true,
    },
    {
      step: EStep.Color,
      isMandatory: true,
    },
    {
      step: EStep.DateStart,
      isMandatory: true,
    },
    {
      step: EStep.DateEnd,
    },
    {
      step: EStep.CostBase,
      isMandatory: true,
    },
    {
      step: EStep.CostUnit,
      isMandatory: true,
    },
    {
      step: EStep.StartHour,
    },
    {
      step: EStep.LessonLength,
      isMandatory: true,
    },
    {
      step: EStep.Students,
    },
    {
      step: EStep.Teacher,
      isMandatory: true,
    },
    {
      step: EStep.Room,
    },
    {
      step: EStep.Summary,
    },
  ],
  [EMode.CreateTemplate]: [
    {
      step: EStep.Course,
    },
    {
      step: EStep.Name,
      isMandatory: true,
    },
    {
      step: EStep.Teacher,
    },
    {
      step: EStep.Color,
    },
    {
      step: EStep.DateStart,
    },
    {
      step: EStep.DateEnd,
    },
    {
      step: EStep.CostBase,
    },
    {
      step: EStep.CostUnit,
    },
    {
      step: EStep.StartHour,
    },
    {
      step: EStep.LessonLength,

    },
    {
      step: EStep.Summary,
    },
  ],
  [EMode.EditTemplate]: [
    {
      step: EStep.Course,
    },
    {
      step: EStep.Name,
      isMandatory: true,
    },
    {
      step: EStep.Teacher,
    },
    {
      step: EStep.Color,
    },
    {
      step: EStep.DateStart,
    },
    {
      step: EStep.DateEnd,
    },
    {
      step: EStep.CostBase,
    },
    {
      step: EStep.CostUnit,
    },
    {
      step: EStep.StartHour,
    },
    {
      step: EStep.LessonLength,

    },
    {
      step: EStep.Summary,
    },
  ],
};

export const getStepList = (mode: EMode) => steps[mode];
