from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

# Unregister the default UserAdmin
admin.site.unregister(User)

# Register a custom UserAdmin
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')

    # Group fields into sections in the detail view
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal Info'), {'fields': ('first_name', 'last_name', 'email')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important Dates'), {'fields': ('last_login', 'date_joined')}),
    )

    # Customize labels and help text
    def formfield_for_dbfield(self, db_field, **kwargs):
        field = super().formfield_for_dbfield(db_field, **kwargs)
        if db_field.name == 'username':
            field.label = _('Username')
            field.help_text = _('Required. 150 characters or fewer. Letters, digits, and @/./+/-/_ only.')
        elif db_field.name == 'email':
            field.label = _('Email Address')
            field.help_text = _('Enter a valid email address.')
        elif db_field.name == 'first_name':
            field.label = _('First Name')
        elif db_field.name == 'last_name':
            field.label = _('Last Name')
        return field
