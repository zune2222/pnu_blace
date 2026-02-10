"use client";

import { isRunningInApp } from "@/shared/lib/native-bridge";
import { useNotificationSettings } from "./model/use-notification-settings";
import { SettingsToggle } from "./ui/settings-toggle";
import { SettingsSkeleton } from "./ui/settings-skeleton";
import { useEffect, useState } from "react";

const NOTIFICATION_ITEMS = [
  {
    key: "studyChatNotification" as const,
    label: "스터디 채팅 알림",
    description: "내가 속한 스터디에서 새 메시지가 올 때 알림",
  },
  {
    key: "roomChatNotification" as const,
    label: "열람실 채팅 알림",
    description: "공부 중인 열람실에서 새 메시지가 올 때 알림",
  },
];

export function SettingsPage() {
  const { settings, loading, saving, updateSetting } = useNotificationSettings();
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    setIsApp(isRunningInApp());
  }, []);

  if (loading) {
    return <SettingsSkeleton />;
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
          {NOTIFICATION_ITEMS.map((item) => (
            <SettingsToggle
              key={item.key}
              label={item.label}
              description={item.description}
              checked={settings[item.key]}
              disabled={saving}
              onToggle={() => updateSetting(item.key, !settings[item.key])}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          전체 알림은 기기 설정에서 관리할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
