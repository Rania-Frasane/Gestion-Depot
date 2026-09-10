from django.contrib import admin
from .models import ChatSession, ChatMessage


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ('role', 'content', 'created_at')
    can_delete = False


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('pk', 'utilisateur', 'titre', 'created_at', 'updated_at')
    list_filter = ('utilisateur',)
    search_fields = ('titre', 'utilisateur__username')
    inlines = [ChatMessageInline]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('pk', 'session', 'role', 'content_preview', 'created_at')
    list_filter = ('role',)
    search_fields = ('content',)

    def content_preview(self, obj):
        return obj.content[:80]
    content_preview.short_description = 'Contenu'
