import HHmmToMinutes from "@/utils/HHmmToMinutes";

const calculateCost = (lessonLength: string | undefined, unitCost: number | undefined) => 
    lessonLength && unitCost 
        ? Math.round((HHmmToMinutes(lessonLength) * 100) / 100 * (unitCost) / 60)
        : undefined;

export { calculateCost };
