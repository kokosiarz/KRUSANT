import React from 'react';
import RoomSelector from '@common/RoomSelector';
import { useQuery } from '@tanstack/react-query';
import { roomsApi } from '@api/endpoints/rooms';
import { useGroupWizardData } from '../../../Context/GroupWizardDataContext';
import LoadingErrorHandler from '@common/LoadingErrorHandler';

const RoomSelectorWrapper: React.FC = () => {
  const { formData, setFormData } = useGroupWizardData();
  const { data: roomsList = [], isLoading, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomsApi.getRooms,
  });

  const roomId = formData.roomId;
  const setRoomId = (roomId: number | undefined) => setFormData((prev) => ({ ...prev, roomId }));

  return (
    <LoadingErrorHandler loading={isLoading} error={error?.message}>
      <RoomSelector roomsList={roomsList} roomId={roomId} setRoomId={setRoomId} />
    </LoadingErrorHandler>
  );
};

export default RoomSelectorWrapper;
