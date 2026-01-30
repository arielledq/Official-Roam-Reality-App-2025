from django.contrib import admin
from django.utils.html import format_html
from .models import (
    RandomizerChallenge, RandomizerTrack, ChallengeVideo,
    RandomizerUserProfile, RandomizerSubmission
)


class RandomizerTrackInline(admin.TabularInline):
    model = RandomizerTrack
    extra = 1  # Show 1 empty form for adding new tracks
    max_num = 8  # Maximum 8 tracks per challenge
    fields = ['track_number', 'title', 'image', 'audio']
    readonly_fields = []  # Allow editing track numbers

    def formfield_for_dbfield(self, db_field, **kwargs):
        """Customize form fields for better UX"""
        formfield = super().formfield_for_dbfield(db_field, **kwargs)
        if db_field.name == 'track_number':
            # Add help text for track number
            formfield.help_text = "Unique number within this challenge (1-8)"
        elif db_field.name == 'title':
            formfield.help_text = "Required: Track title"
        elif db_field.name == 'image':
            formfield.help_text = "Required: Image file (JPG, PNG, etc.)"
        elif db_field.name == 'audio':
            formfield.help_text = "Required: Audio file (MP3, WAV, etc.)"
        return formfield


@admin.register(RandomizerChallenge)
class RandomizerChallengeAdmin(admin.ModelAdmin):
    list_display = ['name', 'thumbnail_preview', 'points', 'sponsor', 'is_active', 'tracks_count', 'created_at', 'updated_at']
    list_filter = ['is_active', 'sponsor', 'created_at']
    search_fields = ['name', 'screen_title', 'description']
    ordering = ['-created_at']
    inlines = [RandomizerTrackInline]

    # Custom actions
    actions = None  # Remove bulk actions for single challenge

    def changelist_view(self, request, extra_context=None):
        """Customize changelist to show helpful message"""
        extra_context = extra_context or {}
        extra_context['title'] = 'Randomizer Challenge (Single Instance)'
        return super().changelist_view(request, extra_context)

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'screen_title', 'description'),
            'description': 'Create or edit a randomizer challenge. Add tracks below using the inline form.'
        }),
        ('Challenge Details', {
            'fields': ('thumbnail', 'points', 'sponsor', 'is_active'),
            'description': 'Configure challenge thumbnail, points, sponsor, and active status.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['created_at', 'updated_at']

    def thumbnail_preview(self, obj):
        """Display thumbnail as image preview"""
        if obj.thumbnail:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />', obj.thumbnail.url)
        return "No thumbnail"
    thumbnail_preview.short_description = "Thumbnail"

    def tracks_count(self, obj):
        count = obj.tracks.count()
        return f"{count}/8 tracks"
    tracks_count.short_description = "Tracks"

    def has_add_permission(self, request):
        """Only allow adding a challenge if none exists"""
        if RandomizerChallenge.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of the default challenge"""
        return False

    def get_form(self, request, obj=None, **kwargs):
        """Customize form to add helpful information"""
        form = super().get_form(request, obj, **kwargs)
        if obj:
            # For existing challenges, show current track count
            track_count = obj.tracks.count()
            form.base_fields['name'].help_text = f"Editing the main randomizer challenge with {track_count} tracks. Add more tracks below."
            form.base_fields['screen_title'].help_text = "Screen titles displayed to users during randomization."
        return form


@admin.register(RandomizerTrack)
class RandomizerTrackAdmin(admin.ModelAdmin):
    list_display = ['get_challenge_name', 'track_number', 'title', 'has_image', 'has_audio', 'ranking_display', 'primary_ranking_score', 'created_at']
    list_filter = ['track_number', 'created_at']  # Remove challenge filter since it's single
    search_fields = ['title']  # Simplified since only one challenge
    ordering = ['track_number']

    def get_challenge_name(self, obj):
        return "Main Challenge"
    get_challenge_name.short_description = "Challenge"
    get_challenge_name.admin_order_field = 'challenge__name'

    fieldsets = (
        ('Track Information', {
            'fields': ('track_number',),
            'description': 'Assign a unique track number (1-8) for this track in the main challenge.'
        }),
        ('Content', {
            'fields': ('title', 'image', 'audio'),
            'description': 'All content fields are required. Upload image and audio files.'
        }),
        ('Ranking', {
            'fields': ('ranking',),
            'classes': ('collapse',),
            'description': 'Optional ranking data. Users can update rankings via the API.'
        }),
    )

    readonly_fields = ['created_at', 'updated_at', 'challenge']  # Make challenge read-only

    def get_form(self, request, obj=None, **kwargs):
        """Auto-select the single challenge and make it read-only"""
        form = super().get_form(request, obj, **kwargs)

        # Auto-select the single challenge
        try:
            challenge = RandomizerChallenge.objects.first()
            if challenge:
                form.base_fields['challenge'].initial = challenge.id
        except:
            pass

        return form

    def save_model(self, request, obj, form, change):
        """Ensure track belongs to the single challenge"""
        if not obj.challenge_id:
            challenge = RandomizerChallenge.objects.first()
            if challenge:
                obj.challenge = challenge
        super().save_model(request, obj, form, change)

    def formfield_for_dbfield(self, db_field, **kwargs):
        """Customize form fields for better UX"""
        formfield = super().formfield_for_dbfield(db_field, **kwargs)
        if db_field.name == 'challenge':
            formfield.help_text = "Select the challenge this track belongs to"
        elif db_field.name == 'track_number':
            formfield.help_text = "Unique number within the selected challenge (1-8). Check existing tracks to avoid conflicts."
        elif db_field.name == 'title':
            formfield.help_text = "Required: Descriptive title for this track"
        elif db_field.name == 'image':
            formfield.help_text = "Required: Image file (JPG, PNG, GIF, WebP) - max 10MB"
        elif db_field.name == 'audio':
            formfield.help_text = "Required: Audio file (MP3, WAV, M4A, AAC, OGG) - max 50MB"
        return formfield

    def get_form(self, request, obj=None, **kwargs):
        """Customize form for new tracks"""
        form = super().get_form(request, obj, **kwargs)
        if not obj:  # New track
            form.base_fields['track_number'].help_text = "Choose a track number (1-8) that doesn't conflict with existing tracks in the selected challenge"
        return form

    def has_image(self, obj):
        return obj.image is not None
    has_image.boolean = True
    has_image.short_description = "Has Image"

    def has_audio(self, obj):
        return obj.audio is not None
    has_audio.boolean = True
    has_audio.short_description = "Has Audio"

    def ranking_display(self, obj):
        """Display ranking as a readable string"""
        if not obj.ranking:
            return "No ranking"
        return ", ".join(f"{k}: {v}" for k, v in obj.ranking.items())
    ranking_display.short_description = "Ranking Details"


@admin.register(ChallengeVideo)
class ChallengeVideoAdmin(admin.ModelAdmin):
    """Admin interface for Challenge Videos"""
    list_display = ['name', 'video_preview', 'challenge', 'is_active', 'file_size', 'created_at', 'updated_at']
    list_filter = ['is_active', 'challenge', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['-created_at']

    fieldsets = (
        ('Video Information', {
            'fields': ('name', 'description'),
            'description': 'Provide a name and optional description for this video.'
        }),
        ('Video File', {
            'fields': ('video',),
            'description': 'Upload video file (MP4, MOV, AVI, WebM, MKV) - max 50MB'
        }),
        ('Settings', {
            'fields': ('challenge', 'is_active'),
            'description': 'Optionally link to a specific challenge. Leave blank for default video.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['created_at', 'updated_at']

    def video_preview(self, obj):
        """Display video preview or placeholder"""
        if obj.video:
            return format_html(
                '<video width="100" height="100" controls><source src="{}" type="video/mp4"></video>',
                obj.video.url
            )
        return "No video"
    video_preview.short_description = "Preview"

    def file_size(self, obj):
        """Display file size in MB"""
        if obj.video:
            try:
                size_mb = obj.video.size / (1024 * 1024)
                return f"{size_mb:.2f} MB"
            except:
                return "Unknown"
        return "No file"
    file_size.short_description = "File Size"

    def get_form(self, request, obj=None, **kwargs):
        """Customize form with helpful information"""
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['name'].help_text = "Descriptive name for this video (e.g., 'Challenge Completion Video')"
        form.base_fields['video'].help_text = "Upload video file - Recommended: MP4 format, max 50MB"
        form.base_fields['challenge'].help_text = "Optional: Link to specific challenge. Leave blank for default completion video."
        form.base_fields['is_active'].help_text = "Only active videos are returned by the API"
        return form


@admin.register(RandomizerUserProfile)
class RandomizerUserProfileAdmin(admin.ModelAdmin):
    """Admin interface for Randomizer User Profiles - similar to ARUserProfile"""
    list_display = ['user_name', 'points', 'challenges_completed', 'created_at', 'updated_at']
    list_filter = ['created_at']
    search_fields = ['user__name', 'user__email']
    ordering = ['-points', '-created_at']
    readonly_fields = ['user', 'created_at', 'updated_at']

    fieldsets = (
        ('User Information', {
            'fields': ('user',),
            'description': 'User associated with this profile'
        }),
        ('Statistics', {
            'fields': ('points', 'challenges_completed'),
            'description': 'User points and completion stats'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def user_name(self, obj):
        return obj.user.name if hasattr(obj.user, 'name') else obj.user.username
    user_name.short_description = "User"
    user_name.admin_order_field = 'user__name'

    def has_add_permission(self, request):
        """Profiles are auto-created via API"""
        return False

    def has_delete_permission(self, request, obj=None):
        """Allow deletion of profiles"""
        return True


@admin.register(RandomizerSubmission)
class RandomizerSubmissionAdmin(admin.ModelAdmin):
    """Admin interface for Randomizer Submissions - similar to ARMemories"""
    list_display = [
        'user_name', 'challenge', 'submission_type',
        'points', 'approval_status', 'privacy',
        'file_preview', 'created_at'
    ]
    list_filter = ['submission_type', 'approval_status', 'privacy', 'created_at', 'challenge']
    search_fields = ['user__name', 'user__email', 'challenge__name', 'description']
    ordering = ['-created_at']
    readonly_fields = ['user', 'created_at', 'updated_at', 'result_file_preview', 'thumbnail_preview']

    actions = ['approve_submissions', 'reject_submissions']

    fieldsets = (
        ('Submission Information', {
            'fields': ('user', 'challenge', 'sponsor', 'submission_type'),
            'description': 'Basic information about this submission'
        }),
        ('Content', {
            'fields': ('result_file', 'result_file_preview', 'thumbnail', 'thumbnail_preview', 'description', 'completion_data'),
            'description': 'User-submitted content and data'
        }),
        ('Points & Approval', {
            'fields': ('points', 'approval_status', 'declined_reason'),
            'description': 'Points awarded and approval workflow'
        }),
        ('Privacy', {
            'fields': ('privacy',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def user_name(self, obj):
        return obj.user.name if hasattr(obj.user, 'name') else obj.user.username
    user_name.short_description = "User"
    user_name.admin_order_field = 'user__name'

    def file_preview(self, obj):
        """Display file preview icon"""
        if obj.result_file:
            return format_html('<span style="color: green;">✓ File</span>')
        return format_html('<span style="color: gray;">No file</span>')
    file_preview.short_description = "File"

    def result_file_preview(self, obj):
        """Display result file preview in detail view"""
        if obj.result_file:
            file_url = obj.result_file.url
            if file_url.lower().endswith(('.mp4', '.mov', '.avi', '.webm', '.mkv')):
                return format_html(
                    '<video width="400" controls><source src="{}" type="video/mp4"></video>',
                    file_url
                )
            elif file_url.lower().endswith(('.mp3', '.wav', '.m4a', '.aac', '.ogg')):
                return format_html(
                    '<audio controls><source src="{}" type="audio/mpeg"></audio>',
                    file_url
                )
            else:
                return format_html('<a href="{}" target="_blank">Download File</a>', file_url)
        return "No file"
    result_file_preview.short_description = "Result File Preview"

    def thumbnail_preview(self, obj):
        """Display thumbnail preview"""
        if obj.thumbnail:
            return format_html(
                '<img src="{}" width="200" style="object-fit: cover;" />',
                obj.thumbnail.url
            )
        return "No thumbnail"
    thumbnail_preview.short_description = "Thumbnail Preview"

    def approve_submissions(self, request, queryset):
        """Bulk action to approve submissions"""
        updated = queryset.update(approval_status='APPROVED')
        self.message_user(request, f"{updated} submission(s) approved successfully.")
    approve_submissions.short_description = "Approve selected submissions"

    def reject_submissions(self, request, queryset):
        """Bulk action to reject submissions"""
        updated = queryset.update(approval_status='REJECTED')
        self.message_user(request, f"{updated} submission(s) rejected.")
    reject_submissions.short_description = "Reject selected submissions"

    def has_add_permission(self, request):
        """Submissions are created via API"""
        return False