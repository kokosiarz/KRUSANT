import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

interface RequireRoleProps {
  roles: string[];
  children: React.ReactElement;
}

const RequireRole: React.FC<RequireRoleProps> = ({ roles, children }) => {
  const { user } = useAuth();
  const userRoles = user?.roles?.map((role) => role.toLowerCase()) ?? [];
  const allowed = roles.some((role) => userRoles.includes(role));

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireRole;
