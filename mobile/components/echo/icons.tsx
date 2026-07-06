import React from 'react';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';

type IconProps = { color?: string; size?: number };

export const IconMic = ({ color = 'currentColor', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="2" width="6" height="13" rx="3" stroke={color} strokeWidth="1.8" />
    <Path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const IconChart = ({ color = 'currentColor', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 20h18M7 20V12M12 20V6M17 20V10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const IconHome = ({ color = 'currentColor', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <Path d="M9 21V12h6v9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const IconCheck = ({ color = 'currentColor', size = 16 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path d="M2 8l4.5 4.5L14 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconChevronRight = ({ color = 'currentColor', size = 14 }: IconProps) => (
  <Svg width={size * 0.5} height={size} viewBox="0 0 7 14" fill="none">
    <Path d="M1 1l5 6-5 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconChevronLeft = ({ color = 'currentColor', size = 14 }: IconProps) => (
  <Svg width={size * 0.7} height={size} viewBox="0 0 10 16" fill="none">
    <Path d="M8 2L2 8l6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconClose = ({ color = 'currentColor', size = 14 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <Path d="M1 1l12 12M13 1L1 13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const IconArrow = ({ color = 'currentColor', size = 16 }: IconProps) => (
  <Svg width={size} height={size * 0.625} viewBox="0 0 16 10" fill="none">
    <Path d="M1 5h12M9 1l4 4-4 4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconBriefcase = ({ color = 'currentColor', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="7" width="18" height="13" rx="3" stroke={color} strokeWidth="1.8" />
    <Path d="M8 7V5a2 2 0 014 0v2M16 7V5a2 2 0 00-4 0" stroke={color} strokeWidth="1.8" />
    <Path d="M3 13h18" stroke={color} strokeWidth="1.8" />
  </Svg>
);

export const IconChat = ({ color = 'currentColor', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
  </Svg>
);

export const IconBuilding = ({ color = 'currentColor', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="1.8" />
    <Path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v4M10 14h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const IconWaveform = ({ color = 'currentColor', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 12h3M7 8v8M11 5v14M15 8v8M19 10v4M22 12h-3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconClipboard = ({ color = 'currentColor', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <Path d="M9 12h6M9 16h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const IconEdit = ({ color = 'currentColor', size = 16 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path d="M11 2l3 3L5 14H2v-3L11 2z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
  </Svg>
);

// Flag SVGs for accent chips
export const FlagUS = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={Math.round(size * 0.69)} viewBox="0 0 16 11">
    <Rect width="16" height="11" fill="#B22234" />
    <Rect y="0" width="16" height="0.85" fill="#B22234" />
    <Rect y="1.1" width="16" height="0.85" fill="#fff" />
    <Rect y="2.2" width="16" height="0.85" fill="#B22234" />
    <Rect y="3.3" width="16" height="0.85" fill="#fff" />
    <Rect y="4.4" width="16" height="0.85" fill="#B22234" />
    <Rect y="5.5" width="16" height="0.85" fill="#fff" />
    <Rect y="6.6" width="16" height="0.85" fill="#B22234" />
    <Rect y="7.7" width="16" height="0.85" fill="#fff" />
    <Rect y="8.8" width="16" height="0.85" fill="#B22234" />
    <Rect y="9.9" width="16" height="0.85" fill="#fff" />
    <Rect width="6.5" height="5.5" fill="#3C3B6E" />
  </Svg>
);

export const FlagUK = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={Math.round(size * 0.69)} viewBox="0 0 16 11">
    <Rect width="16" height="11" fill="#012169" />
    <Path d="M0 0l16 11M16 0L0 11" stroke="#fff" strokeWidth="2.2" />
    <Path d="M0 0l16 11M16 0L0 11" stroke="#C8102E" strokeWidth="1.2" />
    <Path d="M8 0v11M0 5.5h16" stroke="#fff" strokeWidth="3" />
    <Path d="M8 0v11M0 5.5h16" stroke="#C8102E" strokeWidth="1.8" />
  </Svg>
);

// Flame SVG for streak
export const FlameIcon = ({ size = 14 }: { size?: number }) => (
  <Svg width={size} height={Math.round(size * 1.14)} viewBox="0 0 12 16" fill="none">
    <Path d="M6 1c0 0 4.5 3.5 4.5 7.5a4.5 4.5 0 01-9 0C1.5 6.5 3.5 4.5 3.5 4.5s0 2.5 2.5 3.8C7.5 7 6 1 6 1z" fill="#F59E0B" stroke="#D97706" strokeWidth="0.5" strokeLinejoin="round" />
  </Svg>
);

// EchoLogo mark — waveform bars
export const EchoLogoMark = ({ size = 32 }: { size?: number }) => (
  <Svg width={Math.round(size * 0.56)} height={Math.round(size * 0.44)} viewBox="0 0 18 14" fill="none">
    <Rect x="0" y="5.5" width="2.2" height="3" rx="1.1" fill="white" fillOpacity="0.45" />
    <Rect x="3.8" y="3" width="2.2" height="8" rx="1.1" fill="white" fillOpacity="0.72" />
    <Rect x="7.6" y="0" width="2.8" height="14" rx="1.4" fill="white" />
    <Rect x="11.4" y="3" width="2.2" height="8" rx="1.1" fill="white" fillOpacity="0.72" />
    <Rect x="15.2" y="5.5" width="2.2" height="3" rx="1.1" fill="white" fillOpacity="0.45" />
  </Svg>
);

export const PhoneIcon = ({
  size = 23,
  color = '#FFFFFF',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 640 640"
    fill="none"
  >
    <Path
      fill={color}
      d="M224.2 89C216.3 70.1 195.7 60.1 176.1 65.4L170.6 66.9C106 84.5 50.8 147.1 66.9 223.3C104 398.3 241.7 536 416.7 573.1C493 589.3 555.5 534 573.1 469.4L574.6 463.9C580 444.2 569.9 423.6 551.1 415.8L453.8 375.3C437.3 368.4 418.2 373.2 406.8 387.1L368.2 434.3C297.9 399.4 241.3 341 208.8 269.3L253 233.3C266.9 222 271.6 202.9 264.8 186.3L224.2 89z"
    />
  </Svg>
);

export const MuteIcon = ({
  size = 23,
  color = '#64748B',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <Rect
      x={9}
      y={3}
      width={6}
      height={11}
      rx={3}
      stroke={color}
      strokeWidth={2}
    />

    <Path
      d="M6 11C6 14.314 8.686 17 12 17C15.314 17 18 14.314 18 11"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />

    <Path
      d="M12 17V21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />

    <Path
      d="M9 21H15"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const PauseIcon = ({
  size = 23,
  color = '#64748B',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <Rect
      x={7}
      y={5}
      width={3}
      height={14}
      rx={1.5}
      fill={color}
    />

    <Rect
      x={14}
      y={5}
      width={3}
      height={14}
      rx={1.5}
      fill={color}
    />
  </Svg>
);