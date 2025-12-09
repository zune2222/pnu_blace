import React, { useState, useEffect } from "react";
import { RotateCcw, Settings } from "lucide-react";
import { AutoExtensionConfigDto } from "@pnu-blace/types";
import { dashboardApi } from "@/entities/dashboard/api";
import { toast } from "sonner";
import { AutoExtensionSettingsModal } from "./auto-extension-settings-modal";

export interface SeatActionButtonsProps {
  onExtend: () => void;
  onCancel: () => void;
  isExtending: boolean;
  isCancelling: boolean;
  isExtendDisabled?: boolean;
  onExtendDisabledClick?: () => void;
}

export const SeatActionButtons: React.FC<SeatActionButtonsProps> = ({
  onExtend,
  onCancel,
  isExtending,
  isCancelling,
  isExtendDisabled = false,
  onExtendDisabledClick,
}) => {
  const [config, setConfig] = useState<AutoExtensionConfigDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // 자동 연장 설정 로드
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardApi.getAutoExtensionConfig();
        setConfig(data);
      } catch (error: any) {
        console.warn("자동 연장 설정 로드 실패:", error);
        // 설정이 없는 경우 기본값 설정
        const defaultConfig: AutoExtensionConfigDto = {
          isEnabled: false,
          triggerMinutesBefore: 30,
          maxAutoExtensions: 2,
          timeRestriction: "ALL_TIMES",
        };
        setConfig(defaultConfig);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // 자동 연장 토글 처리
  const handleAutoExtensionToggle = async () => {
    if (!config) return;

    // 비활성화 -> 활성화: 설정 모달 열기
    if (!config.isEnabled) {
      setShowSettingsModal(true);
      return;
    }

    // 활성화 -> 비활성화: 바로 토글
    try {
      setIsToggling(true);
      const newConfig = await dashboardApi.toggleAutoExtension(false);
      setConfig(newConfig);
      toast.success("자동 연장이 비활성화되었습니다");
    } catch (error: any) {
      toast.error("설정 변경에 실패했습니다: " + error.message);
    } finally {
      setIsToggling(false);
    }
  };

  // 설정 모달에서 활성화
  const handleConfigSave = async (
    newConfig: Partial<AutoExtensionConfigDto>
  ) => {
    try {
      const updatedConfig = await dashboardApi.updateAutoExtensionConfig({
        ...newConfig,
        isEnabled: true,
      });
      setConfig(updatedConfig);
      setShowSettingsModal(false);
      toast.success("자동 연장이 활성화되었습니다");
    } catch (error: any) {
      toast.error("설정 저장에 실패했습니다: " + error.message);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 pt-4">
        <button
          onClick={isExtendDisabled ? onExtendDisabledClick : onExtend}
          disabled={isExtending}
          className={`group inline-flex items-center space-x-3 text-lg font-light transition-colors duration-300 disabled:cursor-not-allowed min-h-[44px] px-2 py-2 rounded-md ${
            isExtendDisabled
              ? "text-muted-foreground/50 cursor-not-allowed"
              : "text-foreground hover:text-muted-foreground hover:bg-muted/20 disabled:text-muted-foreground/50 active:scale-95"
          }`}
        >
          <span>{isExtending ? "연장 중..." : "시간 연장"}</span>
          {!isExtending && (
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          )}
          {isExtending && (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={isCancelling}
          className="group inline-flex items-center space-x-3 text-base text-muted-foreground/50 font-light hover:text-muted-foreground hover:bg-muted/10 transition-colors duration-300 disabled:text-muted-foreground/30 disabled:cursor-not-allowed min-h-[44px] px-2 py-2 rounded-md active:scale-95"
        >
          <span>{isCancelling ? "반납 중..." : "반납"}</span>
          {!isCancelling && (
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          )}
          {isCancelling && (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          )}
        </button>

        {/* 자동 연장 버튼 - 일시 비활성화 */}
        {/* <button
          onClick={handleAutoExtensionToggle}
          disabled={isToggling || isLoading}
          className="group inline-flex items-center space-x-3 text-base font-light transition-colors duration-300"
        >
          <span>자동 연장</span>
          <RotateCcw className="w-4 h-4" />
        </button> */}
      </div>

      {/* 자동 연장 설정 모달 - 일시 비활성화 */}
      {/* <AutoExtensionSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={handleConfigSave}
        initialConfig={config}
      /> */}
    </>
  );
};
