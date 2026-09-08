import { useAuthStore } from '../store/auth.store';

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, loadUser } = useAuthStore();

  const hasPermission = (perm: string) => {
    if (!user || !user.roleAssignments) return false;
    // Iterate through user's roles and check permissions
    return user.roleAssignments.some(assignment => 
      assignment.role?.permissions?.includes(perm) || assignment.role?.name === 'ROOT_GOVERNANCE'
    );
  };

  const hasRole = (roleName: string) => {
    if (!user || !user.roleAssignments) return false;
    return user.roleAssignments.some(assignment => assignment.role?.name === roleName);
  };

  const isPrimaryRole = (roleName: string) => {
    if (!user || !user.roleAssignments || user.roleAssignments.length === 0) return false;
    return user.roleAssignments[0].role?.name === roleName;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    loadUser,
    hasPermission,
    hasRole,
    isPrimaryRole
  };
}
