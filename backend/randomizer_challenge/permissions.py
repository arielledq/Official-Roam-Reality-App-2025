from rest_framework import permissions


class AdminCreateUserViewAndRank(permissions.BasePermission):
    """
    Custom permission for Randomizer Challenge:
    - Only admins can create challenges/tracks
    - All authenticated users can view
    - Authenticated users can update ranking
    - Only admins can delete
    """

    def has_permission(self, request, view):
        """
        View-level permissions
        """
        # All authenticated users can access the view
        if not request.user or not request.user.is_authenticated:
            return False

        # For create operations, only admins
        if view.action == 'create':
            return request.user.is_staff or request.user.is_superuser

        # For other operations, authenticated users are allowed
        return True

    def has_object_permission(self, request, view, obj):
        """
        Object-level permissions
        """
        # All authenticated users can read
        if request.method in permissions.SAFE_METHODS:
            return True

        # For ranking updates, allow authenticated users
        if view.action == 'update_ranking':
            return request.user and request.user.is_authenticated

        # For delete operations, only admins
        if request.method == 'DELETE':
            return request.user.is_staff or request.user.is_superuser

        # For other write operations (update), only admins
        return request.user.is_staff or request.user.is_superuser