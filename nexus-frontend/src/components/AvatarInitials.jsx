import React from 'react';

const getInitials = (name) => {
  if (!name) return 'CC';
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
};

const GRADIENT_COMBOS = [
  ['#00D4FF', '#7C3AED'],
  ['#FF6B6B', '#FF8E53'],
  ['#43E97B', '#38F9D7'],
  ['#FA709A', '#FEE140'],
];

const AvatarInitials = ({ name, size = 40 }) => {
  const initials = getInitials(name);
  const combo = GRADIENT_COMBOS[name?.charCodeAt(0) % GRADIENT_COMBOS.length] || GRADIENT_COMBOS[0];

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${combo[0]}, ${combo[1]})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: 'white',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      flexShrink: 0
    }}>
      {initials}
    </div>
  );
};

export default AvatarInitials;
