from django.contrib import admin
from .models import RandomizerChallenge, RandomizerTrack


class RandomizerTrackInline(admin.TabularInline):
    model = RandomizerTrack
    extra = 1  # Show 1 empty form for adding new tracks
    max_num = 8  # Maximum 8 tracks per challenge
    fields = ['track_number', 'title', 'image', 'audio', 'ranking']
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
    list_display = ['name', 'tracks_count', 'created_at', 'updated_at']
    search_fields = ['name', 'screen_title']
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
            'fields': ('name', 'screen_title'),
            'description': 'Create or edit a randomizer challenge. Add tracks below using the inline form.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['created_at', 'updated_at']

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