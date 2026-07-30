import api from '../client';

// A teacher is a user holding the 'teacher' role — there is no separate
// teacher table. This endpoint is a read-only projection of those users,
// readable by any authenticated role so the teacher pickers work for
// non-admins. Create/edit/delete goes through the users API (usersAdmin.ts).
export interface Teacher {
  id: number;
  name: string;
  email: string;
}

export const teachersApi = {
  getTeachers: async (): Promise<Teacher[]> => {
    return api.get<Teacher[]>('/teachers');
  },
};
