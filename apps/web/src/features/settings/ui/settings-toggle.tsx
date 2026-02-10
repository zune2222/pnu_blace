"use client";

interface SettingsToggleProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function SettingsToggle({
  label,
  description,
  checked,
  disabled,
  onToggle,
}: SettingsToggleProps) {
  return (
    <div className="p-4 flex items-center justify-between">
      <div>
        <h3 className="font-medium">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
