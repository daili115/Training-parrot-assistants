import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from 'lucide-react';

const ToggleTheme = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all dark:bg-slate-700/50 dark:hover:bg-slate-600/50"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <SunIcon className="h-5 w-5 text-white" /> : <MoonIcon className="h-5 w-5 text-white" />}
    </button>
  );
};

export default ToggleTheme;
