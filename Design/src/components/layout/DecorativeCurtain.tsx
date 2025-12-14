interface DecorativeCurtainProps {
  position?: 'top' | 'bottom';
}

export const DecorativeCurtain = ({ position = 'top' }: DecorativeCurtainProps) => {
  const gradientClass = position === 'top' 
    ? 'bg-gradient-to-b from-[#912D3C] to-[#912D3C]/80' 
    : 'bg-gradient-to-t from-[#912D3C] to-[#912D3C]/80';

  const fadeClass = position === 'top'
    ? 'bg-gradient-to-b from-transparent to-white'
    : 'bg-gradient-to-t from-transparent to-white';

  return (
    <div className={`relative h-24 ${gradientClass} overflow-hidden`}>
      <div 
        className="absolute inset-0 opacity-30 bg-repeat-x"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.4) 0px, transparent 15px, transparent 30px, rgba(0, 0, 0, 0.4) 45px, rgba(0, 0, 0, 0.4) 60px)'
        }}
      />
      <div className={`absolute ${position === 'top' ? 'bottom-0' : 'top-0'} left-0 right-0 h-8 ${fadeClass}`} />
    </div>
  );
};