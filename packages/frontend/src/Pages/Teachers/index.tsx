import React from 'react';
import SimpleCrudPage from '@/Components/Common/SimpleCrudPage';
import { usersAdminApi, AdminUser } from '@/api/endpoints/usersAdmin';

// A teacher is just a user holding the 'teacher' role — there is no separate
// teacher table. This page is a filtered view over the users API, so creating
// someone here creates a login account with that role already set, and there
// is no second record that can drift out of sync.
const TEACHER_ROLE = 'teacher';

const hasTeacherRole = (user: AdminUser) =>
  (user.roles ?? []).some((role) => role.toLowerCase() === TEACHER_ROLE);

const Teachers: React.FC = () => (
  <SimpleCrudPage<AdminUser>
    title="Nauczyciele"
    queryKey="teachers-users"
    entityLabelAccusative="nauczyciela"
    getItemName={(user) => user.name || user.email}
    fields={[
      { key: 'name', label: 'Imię i nazwisko', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
    ]}
    api={{
      getAll: async () => (await usersAdminApi.getAllUsers()).filter(hasTeacherRole),
      // The server issues a temporary password and emails it, same as creating
      // the user from Użytkownicy. This page shows only the created user, so a
      // failed send isn't surfaced here — if the teacher never gets the mail,
      // re-issue from Użytkownicy → Resetuj hasło, which does show it.
      create: async (data) =>
        (
          await usersAdminApi.createUser({
            email: String(data.email),
            name: data.name ? String(data.name) : undefined,
            roles: [TEACHER_ROLE],
          })
        ).user,
      // Preserve any other roles the account already holds (e.g. admin).
      update: (id, data) => usersAdminApi.updateUser(id, data),
      remove: async (id) => {
        await usersAdminApi.deleteUser(id);
      },
    }}
  />
);

export default Teachers;
