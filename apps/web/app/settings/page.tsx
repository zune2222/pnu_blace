"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/shared/lib/api";
import { isRunningInApp } from "@/shared/lib/native-bridge";

interface NotificationSettings {
  studyChatNotification: boolean;
  roomChatNotification: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    studyChatNotification: true,
    roomChatNotification: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    setIsApp(isRunningInApp());
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await apiClient.get<NotificationSettings>("/api/v1/users/notification-settings");
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    setSaving(true);
    setSettings(prev => ({ ...prev, [key]: value }));
    
    try {
      await apiClient.patch("/api/v1/users/notification-settings", {
        [key]: value,
      });
    } catch (error) {
      console.error("Failed to save setting:", error);
      // 롤백
      setSettings(prev => ({ ...prev, [key]: !value }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">설정</h1>

        {!isApp && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
            푸시 알림은 앱에서만 받을 수 있습니다.
          </div>
        )}

        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">스터디 채팅 알림</h3>
              <p className="text-sm text-muted-foreground">내가 속한 스터디에서 새 메시지가 올 때 알림</p>
            </div>
            <button
              onClick={() => updateSetting("studyChatNotification", !settings.studyChatNotification)}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.studyChatNotification ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.studyChatNotification ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">열람실 채팅 알림</h3>
              <p className="text-sm text-muted-foreground">공부 중인 열람실에서 새 메시지가 올 때 알림</p>
            </div>
            <button
              onClick={() => updateSetting("roomChatNotification", !settings.roomChatNotification)}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.roomChatNotification ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.roomChatNotification ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          전체 알림은 기기 설정에서 관리할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
