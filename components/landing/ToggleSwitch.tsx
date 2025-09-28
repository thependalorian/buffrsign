
interface ToggleSwitchProps {
  isToggled: boolean;
  onToggle: () => void;
}

const ToggleSwitch = ({ isToggled, onToggle }: ToggleSwitchProps) => (
  <div className="flex items-center justify-center space-x-4">
    <span className={`font-medium ${!isToggled ? 'text-chart-1' : 'text-muted-foreground'}`}>Monthly</span>
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center h-8 w-16 rounded-full transition-colors duration-300 focus:outline-none ${isToggled ? 'bg-chart-1' : 'bg-muted'}`}>
      <span
        className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ${isToggled ? 'translate-x-9' : 'translate-x-1'}`}/>
    </button>
    <span className={`font-medium ${isToggled ? 'text-chart-1' : 'text-muted-foreground'}`}>Annual</span>
  </div>
);

export default ToggleSwitch;
