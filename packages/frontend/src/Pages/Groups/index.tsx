import { teachersApi } from '../../api/endpoints/teachers';
import { roomsApi } from '../../api/endpoints/rooms';
import { studentsApi } from '../../api/endpoints/students';
import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import { groupsApi } from '../../api/endpoints/groups';
import { useQuery } from '@tanstack/react-query';
import { Group } from './types';
import { useSettings } from '../../context/Settings';
import GroupWizard from '../../Components/GroupWizard';
import LoadingErrorHandler from '../../Components/Common/LoadingErrorHandler';
import GroupsHeader from './GroupsHeader';
import { EMode } from '../../Components/GroupWizard/types';
import CommonTable from '@/Components/Common/Table';
import { createColumns } from './createColumns';
import DeleteItemDialog from '@/Components/Common/DeleteItemDialog';

const Groups: React.FC = () => {
  const [filters, setFilters] = useState<string[]>(['active']);
  const [formParams, setFormParams] = useState<{ open: boolean; mode: EMode; groupId?: number }>({ open: false, mode: EMode.EditGroup });
  const [deleteParams, setDeleteParams] = useState<{ open: boolean; groupId?: number }>({ open: false });
  const [deleting, setDeleting] = useState(false);
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: teachersApi.getTeachers,
  });
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomsApi.getRooms,
  });
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getStudents,
  });
  const { data: groups = [], isLoading: loading, error, refetch } = useQuery<Group[], Error>({
    queryKey: ['groups'],
    queryFn: groupsApi.getGroups,
  });
  const { currency } = useSettings();

  const filteredGroups = useMemo(() => {
    if (filters.includes('all') || filters.length === 0) return groups;
    return filters.includes('active') ? groups.filter((group) => group.isActive) : groups;
  }, [groups, filters]);

  const handleAddGroup = () => {
    setFormParams({ open: true, mode: EMode.CreateGroup });
  };

  const handleEditGroup = React.useCallback((groupId: number) => {
    setFormParams({ open: true, groupId, mode: EMode.EditGroup });
  }, []);

  const handleDeleteGroup = React.useCallback((groupId: number) => {
    setDeleteParams({ open: true, groupId });
  }, []);

  const handleFormClose = () => {
    setFormParams({ open: false, groupId: undefined, mode: EMode.CreateGroup });
  };

  const handleFormSuccess = () => {
    refetch();
  };

  const handleDeleteCancel = () => {
    if (deleting) return;
    setDeleteParams({ open: false, groupId: undefined });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteParams.groupId) return;
    setDeleting(true);
    try {
      await groupsApi.deleteGroup(deleteParams.groupId);
      setDeleteParams({ open: false, groupId: undefined });
      refetch();
    } finally {
      setDeleting(false);
    }
  };


  const columns = useMemo(
    () => createColumns(handleEditGroup, handleDeleteGroup, currency, teachers, rooms, students),
    [handleEditGroup, handleDeleteGroup, currency, teachers, rooms, students]
  );

  const groupToDelete = deleteParams.groupId
    ? groups.find((group) => group.id === deleteParams.groupId)
    : undefined;

  const dialogs = (
    <>
      <GroupWizard
        mode={formParams.mode}
        open={formParams.open}
        onClose={handleFormClose}
        id={formParams.groupId}
        onSuccess={handleFormSuccess}
      />
      <DeleteItemDialog
        open={deleteParams.open}
        itemName={groupToDelete?.name || 'grupę'}
        deleting={deleting}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );

  const headerButtons = (
    <GroupsHeader
      filters={filters}
      onFilterChange={setFilters}
      onAddGroup={handleAddGroup}
    />
  );

  return (
    <LoadingErrorHandler loading={loading} error={error ? error.message : null}>
      <Box className="groups-container">
        <CommonTable
          columns={columns}
          rows={filteredGroups}
          tableTitle="Grupy"
          dialogs={dialogs}
          headerButtons={headerButtons}
          getRowKey={(row: Group) => row.id}
          getRowActive={(row: Group) => row.isActive}
          emptyMessage="Nie znaleziono grup"
        />
      </Box>
    </LoadingErrorHandler>
  );
};

export default Groups;
