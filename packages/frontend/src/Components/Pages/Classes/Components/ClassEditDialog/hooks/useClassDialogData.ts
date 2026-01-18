import { useQuery } from "@tanstack/react-query";
import { teachersApi } from "@/api/endpoints/teachers";
import { roomsApi } from "@/api/endpoints/rooms";
import { classesApi } from "@/api/endpoints/classes";
import { groupsApi } from "@/api/endpoints/groups";
import type { Group } from "@/Components/Pages/Groups/types";
import type { Class as ClassItem } from "@/api/endpoints/classes";

export function useClassDialogData(classId?: number) {
  const {
    data: teacherList = [],
    isLoading: isLoadingTeachers,
    error: errorTeachers,
  } = useQuery({
    queryKey: ["teachers"],
    queryFn: teachersApi.getTeachers,
  });

  const {
    data: roomsList = [],
    isLoading: isLoadingRooms,
    error: errorRooms,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.getRooms,
  });

  const {
    data: classData,
    refetch: refetchClassData,
    isLoading: isLoadingClassData,
    error: errorClassData,
  } = useQuery<ClassItem | null>({
    queryKey: ["getClassById", classId],
    queryFn: () => classesApi.getClassById(classId as number),
    enabled: !!classId,
  });

  const {
    data: groups = [],
    isLoading: isLoadingGroups,
    error: errorGroups,
  } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: groupsApi.getGroups,
  });

  return {
    teacherList,
    roomsList,
    classData,
    groups,
    refetchClassData,
    isLoading:
      isLoadingTeachers ||
      isLoadingRooms ||
      isLoadingClassData ||
      isLoadingGroups,
    error: errorTeachers || errorRooms || errorClassData || errorGroups,
  };
}
