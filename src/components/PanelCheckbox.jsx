import { useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { useTheme } from "../styles/pageStyles";

const BOX_SIZE = 16;

/**
 * ControlPanel の extraControls スロットなどに差し込む、ラベル付きチェックボックス。
 * ネイティブ <input type="checkbox"> は視覚的に隠して、ダークテーマに合わせた
 * カスタムボックスを描画する（フォーカスやキーボード操作はネイティブのまま）。
 *
 * @param {{ label: string, checked: boolean, onChange: (next: boolean) => void }} props
 */
export default function PanelCheckbox({ label, checked, onChange }) {
  const { color } = useTheme();
  const isMobile = useIsMobile();
  const [hover, setHover] = useState(false);

  const borderColor = checked
    ? color.accent1
    : hover
      ? color.accent1Light
      : color.borderDefault;

  return (
    <label
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        color: color.textSecondary,
        fontSize: isMobile ? 11 : 12,
        userSelect: "none",
      }}
    >
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          width: BOX_SIZE,
          height: BOX_SIZE,
          flexShrink: 0,
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{
            position: "absolute",
            inset: 0,
            margin: 0,
            opacity: 0,
            cursor: "pointer",
          }}
        />
        <span
          aria-hidden
          style={{
            width: BOX_SIZE,
            height: BOX_SIZE,
            borderRadius: 4,
            border: `1px solid ${borderColor}`,
            background: checked ? color.accent1 : color.bgPanel,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.12s ease, border-color 0.12s ease",
          }}
        >
          {checked && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1.6 5.3 L4 7.6 L8.4 2.6"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
      {label}
    </label>
  );
}
