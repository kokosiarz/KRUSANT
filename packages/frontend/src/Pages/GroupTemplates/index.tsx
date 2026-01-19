import React, { useMemo, useState } from 'react';
import { groupTemplatesApi } from '../../api/endpoints/groupTemplates';
import { useQuery } from '@tanstack/react-query';
import { duplicateTemplate } from '../../api/services/duplicateService';
import { GroupTemplate } from './types';
import GroupWizard from '../../Components/GroupWizard';
import { createColumns } from './createColumns';
import { useSettings } from '../../context/Settings';
import { EMode } from '../../Components/GroupWizard/types';
import LoadingErrorHandler from '@/Components/Common/LoadingErrorHandler';
import DeleteItemDialog from '@/Components/Common/DeleteItemDialog';
import HeaderButtons from './Components/HeaderButtons';
import CommonTable from '@/Components/Common/Table';

const GroupTemplates: React.FC = () => {
  const [filters, setFilters] = useState<string[]>(['active']);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editingGroupTemplateId, setEditingGroupTemplateId] = useState<number | undefined>(undefined);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [templateToDelete, setTemplateToDelete] = useState<GroupTemplate | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [duplicating, setDuplicating] = useState<boolean>(false);

  const { data: groupTemplates = [], isLoading: loading, error, refetch } = useQuery<GroupTemplate[], Error>({
    queryKey: ['groupTemplates'],
    queryFn: groupTemplatesApi.getGroupTemplates,
  });

  const rows = useMemo(() => {
    let result = groupTemplates;

    if (filters.includes('all') || filters.length === 0) {
      return groupTemplates;
    }

    if (filters.includes('active')) {
      result = result.filter((template) => template.isActive);
    }

    return result;
  }, [groupTemplates, filters]);

  const handleFilterChange = (_event: React.MouseEvent<HTMLElement>, newFilters: string[]) => {
    if (newFilters.length === 0) {
      setFilters(['all']);
      return;
    }

    if (newFilters.includes('all') && !filters.includes('all')) {
      setFilters(['all']);
      return;
    }

    if (newFilters.includes('all') && newFilters.length > 1) {
      setFilters(newFilters.filter((f) => f !== 'all'));
      return;
    }

    setFilters(newFilters);
  };

  const handleAddGroupTemplate = () => {
    setEditingGroupTemplateId(undefined);
    setFormOpen(true);
  };

  const handleEditGroupTemplate = (templateId: number) => {
    setEditingGroupTemplateId(templateId);
    setFormOpen(true);
  };

  const handleDeleteClick = (template: GroupTemplate) => {
    setTemplateToDelete(template);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;
    try {
      setDeleting(true);
      await groupTemplatesApi.deleteGroupTemplate(templateToDelete.id);
      await refetch();
      setTemplateToDelete(null);
    } catch (err) {
      // error is handled by useQuery
      console.error('Error deleting template:', err);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setTemplateToDelete(null);
  };

  const handleDuplicateTemplate = React.useCallback(
    async (template: GroupTemplate) => {
      try {
        setDuplicating(true);
        await duplicateTemplate(
          template,
          groupTemplates,
          groupTemplatesApi.getGroupTemplateById,
          groupTemplatesApi.createGroupTemplate
        );
        await refetch();
      } catch (err) {
        // error is handled by useQuery
        console.error('Error duplicating template:', err);
      } finally {
        setDuplicating(false);
      }
    },
    [groupTemplates, refetch, groupTemplatesApi]
  );

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingGroupTemplateId(undefined);
  };

  const handleFormSuccess = () => {
    refetch();
  };


  const { currency } = useSettings();

  const columns = useMemo(
    () => createColumns(handleEditGroupTemplate, handleDuplicateTemplate, handleDeleteClick, duplicating, currency),
    [handleDuplicateTemplate, duplicating, currency]
  );

  const dialogs = <>
    <GroupWizard
      open={formOpen}
      mode={editingGroupTemplateId ? EMode.EditTemplate : EMode.CreateTemplate}
      id={editingGroupTemplateId}
      onClose={handleFormClose}
      onSuccess={handleFormSuccess}
    />
    <DeleteItemDialog
      open={deleteConfirmOpen}
      itemName={`szablon ${templateToDelete?.templateName}`}
      deleting={deleting}
      onCancel={handleDeleteCancel}
      onConfirm={handleDeleteConfirm}
    />
  </>

  const headerButtons = <HeaderButtons
    filters={filters}
    onFilterChange={handleFilterChange}
    onAdd={handleAddGroupTemplate}
  />

  const tableTitle = 'Szablony grup';
  return (
    <LoadingErrorHandler loading={loading} error={error ? error.message : null}>
      <CommonTable
        columns={columns}
        rows={rows}
        tableTitle={tableTitle}
        dialogs={dialogs}
        headerButtons={headerButtons}
        getRowKey={(row) => row.id}
        getRowActive={(row) => row.isActive}
        emptyMessage="Nie znaleziono szablonów"
      />
    </LoadingErrorHandler>
  );
};

export default GroupTemplates;
