import { useTheme } from '../styles/pageStyles'; 

export default function LDToggle() {
  
  const { theme, toggleTheme, color } = useTheme();
 
  const isDark = theme === 'dark';

  //トグルの枠のスタイル
  const labelStyle = {
    position: 'absolute',
    top: '30px',
    right: '50px',
    width: '50px',
    height: '22.5px',
    display: 'block',
    background: isDark ? color.cpInbg : color.borderDefault,
    borderRadius: '12.5px',
    cursor: 'pointer',
    boxShadow: 'inset 0px 0.625px 1.85px rgba(0,0,0,0.3), inset 0px -0.625px 1.85px rgba(255,255,255,0.3)',
    transition: '0.5s',
  };

  // トグルの丸いボタンのスタイル
  const handleStyle = {
    position: 'absolute',
    height: '20px',
    width: '20px',
    borderRadius: '12.5px',
    top: '1.25px',
    // isDarkがtrueなら右へ、falseなら左へ
    left: isDark ? '48.75px' : '1.25px',
    transform: isDark ? 'translateX(-100%)' : 'translateX(0)',
    background: isDark 
      ? `linear-gradient(180deg, ${color.bgPanel}, ${color.bgPage})` 
      : '#f2f2f2',
    transition: '0.5s',
    boxShadow: '0 1.25px 2.5px rgba(0,0,0,0.2)',
  };

  return (
    <label style={labelStyle}>
      {/* onChangeイベントに toggleTheme を直接渡すことで、
        クリック時にアプリ全体のテーマが切り替わります 
      */}
      <input
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
        style={{ display: 'none' }}
      />
      <span style={handleStyle}></span>
    </label>
  );
}