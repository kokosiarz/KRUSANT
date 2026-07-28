export const AVAILABLE_ROLES = ['admin', 'teacher', 'student'];

export const getRoleColor = (role: string): 'error' | 'primary' | 'success' | 'default' => {
  switch (role) {
    case 'admin':
      return 'error';
    case 'teacher':
      return 'primary';
    case 'student':
      return 'success';
    default:
      return 'default';
  }
};

export const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'teacher':
      return 'Nauczyciel';
    case 'student':
      return 'Kursant';
    default:
      return role;
  }
};
