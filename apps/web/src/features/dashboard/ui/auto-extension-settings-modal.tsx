"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, RotateCcw, Calendar } from "lucide-react";
import { AutoExtensionConfigDto } from "@pnu-blace/types";

interface AutoExtensionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Partial<AutoExtensionConfigDto>) => void;
  initialConfig: AutoExtensionConfigDto | null;
}

export const AutoExtensionSettingsModal: React.FC<AutoExtensionSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
}) => {
  const [config, setConfig] = useState<Partial<AutoExtensionConfigDto>>({
    triggerMinutesBefore: 10,
    maxAutoExtensions: 2,
    timeRestriction: "ALL_TIMES",
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig({
        triggerMinutesBefore: initialConfig.triggerMinutesBefore,
        maxAutoExtensions: initialConfig.maxAutoExtensions,
        timeRestriction: initialConfig.timeRestriction,
      });
    }
  }, [initialConfig]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(config);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative border rounded-xl shadow-lg max-w-md w-full mx-4 overflow-hidden transition-all duration-200 transform ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
        style={{
          backgroundColor: document.documentElement.classList.contains("dark") ? "#111827" : "#ffffff",
          borderColor: document.documentElement.classList.contains("dark") ? "#374151" : "#e5e7eb",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/50">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-5 h-5 text-foreground" />
            <h2 className="text-lg font-medium text-foreground">
              자동 연장 설정
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors duration-200"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 트리거 시간 설정 */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>연장 시점</span>
            </label>
            <select
              value={config.triggerMinutesBefore || 10}
              onChange={(e) =>
                setConfig({
                  ...config,
                  triggerMinutesBefore: Number(e.target.value),
                })
              }
              className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background text-foreground focus:ring-1 focus:ring-foreground focus:border-foreground transition-colors duration-200"
            >
              <option value={5}>5분 전</option>
              <option value={10}>10분 전</option>
              <option value={15}>15분 전</option>
              <option value={20}>20분 전</option>
            </select>
            <p className="text-xs text-muted-foreground">
              남은 시간이 이 시간 이하가 되면 자동으로 연장합니다
            </p>
          </div>

          {/* 최대 연장 횟수 */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
              <span>최대 연장 횟수</span>
            </label>
            <select
              value={config.maxAutoExtensions || 2}
              onChange={(e) =>
                setConfig({
                  ...config,
                  maxAutoExtensions: Number(e.target.value),
                })
              }
              className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background text-foreground focus:ring-1 focus:ring-foreground focus:border-foreground transition-colors duration-200"
            >
              <option value={1}>1회</option>
              <option value={2}>2회</option>
              <option value={3}>3회</option>
              <option value={5}>5회</option>
            </select>
            <p className="text-xs text-muted-foreground">
              하루 최대 연장 가능 횟수입니다
            </p>
          </div>

          {/* 시간 제한 */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>적용 시간</span>
            </label>
            <select
              value={config.timeRestriction || 'ALL_TIMES'}
              onChange={(e) =>
                setConfig({
                  ...config,
                  timeRestriction: e.target.value as "ALL_TIMES" | "WEEKDAYS" | "WEEKENDS",
                })
              }
              className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background text-foreground focus:ring-1 focus:ring-foreground focus:border-foreground transition-colors duration-200"
            >
              <option value="ALL_TIMES">항상</option>
              <option value="WEEKDAYS">주중만</option>
              <option value="WEEKENDS">주말만</option>
            </select>
            <p className="text-xs text-muted-foreground">
              자동 연장이 동작할 시간을 설정합니다
            </p>
          </div>

          {/* 미리보기 */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <h4 className="text-sm font-medium text-foreground mb-2">설정 미리보기</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 남은 시간이 {config.triggerMinutesBefore || 10}분 이하가 되면 자동으로 연장</p>
              <p>• 하루 최대 {config.maxAutoExtensions || 2}회까지 자동 연장</p>
              <p>• {
                (config.timeRestriction || 'ALL_TIMES') === 'ALL_TIMES' ? '매일 언제나' :
                (config.timeRestriction || 'ALL_TIMES') === 'WEEKDAYS' ? '월요일부터 금요일까지만' :
                '토요일, 일요일에만'
              } 적용됩니다</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-border bg-muted/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors duration-200"
          >
            활성화
          </button>
        </div>
      </div>
    </div>
  );
};