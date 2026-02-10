"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/shared/lib/api";

interface NotificationSettings {
  studyChatNotification: boolean;
  roomChatNotification: boolean;
}

export type NotificationSettingKey = keyof NotificationSettings;

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    studyChatNotification: true,
    roomChatNotification: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await apiClient.get<NotificationSettings>(
          "/api/v1/users/notification-settings"
        );
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const updateSetting = async (key: NotificationSettingKey, value: boolean) => {
    setSaving(true);
    setSettings((prev) => ({ ...prev, [key]: value }));

    try {
      await apiClient.patch("/api/v1/users/notification-settings", {
        [key]: value,
      });
    } catch (error) {
      console.error("Failed to save setting:", error);
      setSettings((prev) => ({ ...prev, [key]: !value }));
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, saving, updateSetting };
}
