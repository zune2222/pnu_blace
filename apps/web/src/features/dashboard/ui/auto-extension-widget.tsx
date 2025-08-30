"use client";

import React, { useState, useEffect } from "react";
import { Settings, RotateCcw, X } from "lucide-react";
import { AutoExtensionConfigDto } from "@pnu-blace/types";
import { dashboardApi } from "@/entities/dashboard/api";
import { toast } from "sonner";

interface AutoExtensionWidgetProps {
  isVisible: boolean;
}

export const AutoExtensionWidget: React.FC<AutoExtensionWidgetProps> = ({
  isVisible,
}) => {
  const [config, setConfig] = useState<AutoExtensionConfigDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempConfig, setTempConfig] = useState<Partial<AutoExtensionConfigDto>>({});

  // 자동 연장 설정 로드
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardApi.getAutoExtensionConfig();
        setConfig(data);
        setTempConfig(data || {});
      } catch (error: any) {
        console.warn("자동 연장 설정 로드 실패:", error);
        // 설정이 없는 경우 기본값 설정
        const defaultConfig: AutoExtensionConfigDto = {
          isEnabled: false,
          triggerMinutesBefore: 10,
          maxAutoExtensions: 2,
          timeRestriction: "ALL_TIMES",
        };
        setConfig(defaultConfig);
        setTempConfig(defaultConfig);
      } finally {
        setIsLoading(false);
      }
    };

    if (isVisible) {
      loadConfig();
    }
  }, [isVisible]);

  // 설정 새로고침 함수 (외부에서 호출 가능)
  const refreshConfig = async () => {
    try {
      const data = await dashboardApi.getAutoExtensionConfig();
      setConfig(data);
      setTempConfig(data || {});
    } catch (error: any) {
      console.warn("자동 연장 설정 새로고침 실패:", error);
    }
  };

  // 전역 이벤트 리스너 (좌석 예약 시 설정 새로고침)
  useEffect(() => {
    const handleAutoExtensionUpdate = () => {
      refreshConfig();
    };

    window.addEventListener('autoExtensionConfigUpdated', handleAutoExtensionUpdate);
    
    return () => {
      window.removeEventListener('autoExtensionConfigUpdated', handleAutoExtensionUpdate);
    };
  }, []);

  // 자동 연장 토글
  const handleToggle = async () => {
    if (!config) return;

    try {
      setIsToggling(true);
      const newConfig = await dashboardApi.toggleAutoExtension(!config.isEnabled);
      setConfig(newConfig);
      
      toast.success(
        newConfig.isEnabled 
          ? "자동 연장이 활성화되었습니다" 
          : "자동 연장이 비활성화되었습니다"
      );
    } catch (error: any) {
      toast.error("설정 변경에 실패했습니다: " + error.message);
    } finally {
      setIsToggling(false);
    }
  };

  // 설정 업데이트
  const handleUpdateSettings = async () => {
    try {
      const updateData = {
        ...tempConfig,
        isEnabled: config?.isEnabled || false,
      };
      
      const newConfig = await dashboardApi.updateAutoExtensionConfig(updateData);
      setConfig(newConfig);
      setShowSettings(false);
      
      toast.success("자동 연장 설정이 업데이트되었습니다");
    } catch (error: any) {
      toast.error("설정 업데이트에 실패했습니다: " + error.message);
    }
  };

  if (!isVisible) return null;

  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-4 border rounded-xl overflow-hidden transition-all duration-300 ease-out"
      style={{
        backgroundColor: document.documentElement.classList.contains("dark") ? "#111827" : "#ffffff",
        borderColor: document.documentElement.classList.contains("dark") ? "#374151" : "#e5e7eb",
      }}
    >
      <div className="transition-all duration-300 ease-out">
        {!showSettings ? (
          <div className="animate-in slide-in-from-top-1 duration-200">
            {/* 자동 연장 상태 표시 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <RotateCcw 
                  className="w-4 h-4 transition-colors duration-200"
                  style={{
                    color: config?.isEnabled 
                      ? (document.documentElement.classList.contains("dark") ? "#f9fafb" : "#111827")
                      : (document.documentElement.classList.contains("dark") ? "#4b5563" : "#9ca3af")
                  }}
                />
                <h3 
                  className="font-medium text-sm"
                  style={{
                    color: document.documentElement.classList.contains("dark") ? "#f9fafb" : "#111827"
                  }}
                >
                  자동 연장
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-1 rounded-md transition-colors duration-200"
                  style={{
                    backgroundColor: "transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = document.documentElement.classList.contains("dark") ? "#374151" : "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={handleToggle}
                  disabled={isToggling}
                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor: config?.isEnabled
                      ? (document.documentElement.classList.contains("dark") ? "#f9fafb" : "#111827")
                      : (document.documentElement.classList.contains("dark") ? "#4b5563" : "#d1d5db")
                  }}
                >
                  <span
                    className="inline-block h-3 w-3 transform rounded-full transition-transform duration-200"
                    style={{
                      transform: config?.isEnabled ? 'translateX(20px)' : 'translateX(4px)',
                      backgroundColor: config?.isEnabled 
                        ? (document.documentElement.classList.contains("dark") ? "#111827" : "#ffffff")
                        : "#ffffff"
                    }}
                  />
                </button>
              </div>
            </div>

            {/* 설정 정보 */}
            <div 
              className="text-xs space-y-1"
              style={{
                color: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280"
              }}
            >
              {config?.isEnabled ? (
                <>
                  <p>• {config.triggerMinutesBefore}분 전에 자동 연장</p>
                  <p>• 최대 {config.maxAutoExtensions}회 연장</p>
                  <p>• {config.timeRestriction === 'ALL_TIMES' ? '항상' : 
                        config.timeRestriction === 'WEEKDAYS' ? '주중만' : '주말만'}</p>
                </>
              ) : (
                <p style={{ color: "#6b7280" }}>비활성화됨</p>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-2 duration-300">
            {/* 설정 모드 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="font-medium text-sm"
                style={{
                  color: document.documentElement.classList.contains("dark") ? "#f9fafb" : "#111827"
                }}
              >
                자동 연장 설정
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-md transition-colors duration-200"
                style={{
                  backgroundColor: "transparent"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = document.documentElement.classList.contains("dark") ? "#374151" : "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 트리거 시간 설정 */}
              <div>
                <label 
                  className="block text-xs font-medium mb-1"
                  style={{
                    color: document.documentElement.classList.contains("dark") ? "#d1d5db" : "#374151"
                  }}
                >
                  연장 시점 (분 전)
                </label>
                <select
                  value={tempConfig.triggerMinutesBefore || 10}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    triggerMinutesBefore: Number(e.target.value)
                  })}
                  className="w-full text-xs border rounded-md px-2 py-1.5 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                  style={{
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#1f2937" : "#ffffff",
                    borderColor: document.documentElement.classList.contains("dark") ? "#4b5563" : "#d1d5db",
                    color: document.documentElement.classList.contains("dark") ? "#f9fafb" : "#111827"
                  }}
                >
                  <option value={5}>5분 전</option>
                  <option value={10}>10분 전</option>
                  <option value={15}>15분 전</option>
                  <option value={20}>20분 전</option>
                </select>
              </div>

              {/* 최대 연장 횟수 */}
              <div>
                <label 
                  className="block text-xs font-medium mb-1"
                  style={{
                    color: document.documentElement.classList.contains("dark") ? "#d1d5db" : "#374151"
                  }}
                >
                  최대 연장 횟수
                </label>
                <select
                  value={tempConfig.maxAutoExtensions || 2}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    maxAutoExtensions: Number(e.target.value)
                  })}
                  className="w-full text-xs border rounded-md px-2 py-1.5 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                  style={{
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#1f2937" : "#ffffff",
                    borderColor: document.documentElement.classList.contains("dark") ? "#4b5563" : "#d1d5db",
                    color: document.documentElement.classList.contains("dark") ? "#f9fafb" : "#111827"
                  }}
                >
                  <option value={1}>1회</option>
                  <option value={2}>2회</option>
                  <option value={3}>3회</option>
                  <option value={5}>5회</option>
                </select>
              </div>

              {/* 시간 제한 */}
              <div>
                <label 
                  className="block text-xs font-medium mb-1"
                  style={{
                    color: document.documentElement.classList.contains("dark") ? "#d1d5db" : "#374151"
                  }}
                >
                  적용 시간
                </label>
                <select
                  value={tempConfig.timeRestriction || 'ALL_TIMES'}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    timeRestriction: e.target.value as "ALL_TIMES" | "WEEKDAYS" | "WEEKENDS"
                  })}
                  className="w-full text-xs border rounded-md px-2 py-1.5 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                  style={{
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#1f2937" : "#ffffff",
                    borderColor: document.documentElement.classList.contains("dark") ? "#4b5563" : "#d1d5db",
                    color: document.documentElement.classList.contains("dark") ? "#f9fafb" : "#111827"
                  }}
                >
                  <option value="ALL_TIMES">항상</option>
                  <option value="WEEKDAYS">주중만</option>
                  <option value="WEEKENDS">주말만</option>
                </select>
              </div>

              {/* 저장 버튼 */}
              <button
                onClick={handleUpdateSettings}
                className="w-full text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200"
                style={{
                  backgroundColor: document.documentElement.classList.contains("dark") ? "#f9fafb" : "#111827",
                  color: document.documentElement.classList.contains("dark") ? "#111827" : "#f9fafb"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = document.documentElement.classList.contains("dark") ? "#e5e7eb" : "#1f2937";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = document.documentElement.classList.contains("dark") ? "#f9fafb" : "#111827";
                }}
              >
                설정 저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};