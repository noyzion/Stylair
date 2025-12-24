import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

type Bubble = {
  cx: number;
  cy: number;
  r: number;
  o: number; // opacity multiplier
};

const bubbles: Bubble[] = [
    // Top area
    { cx: 30, cy: 0, r: 9,  o: 0.85 },
    { cx: 88, cy: 2,  r: 12, o: 0.75 },
  
    // Upper-middle
    { cx: 40,  cy: 28, r: 14, o: 0.7  },
  
    // Middle
    { cx: 14, cy: 50, r: 10, o: 0.85 },
    { cx: 86, cy: 52, r: 11, o: 0.8  },
  
    // Lower-middle
    { cx: 6,  cy: 100, r: 18, o: 0.6  },
    { cx: 92, cy: 110, r: 14, o: 0.7  },
  
    // Bottom
    { cx: 12, cy: 142, r: 12, o: 0.75 },
    { cx: 38, cy: 120, r: 7,  o: 0.9  },
    { cx: 64, cy: 135, r: 10, o: 0.85 },
    { cx: 100, cy: 150, r: 13, o: 0.75 },
  ];
  
  

export default function Bubbles() {
  return (
    <Svg
      style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' }]}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
    >
      <Defs>
        {/* מילוי סופר עדין (כמעט שקוף) */}
        <RadialGradient id="soapFill" cx="35%" cy="30%" r="70%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.20" />
          <Stop offset="0.45" stopColor="#BFE0FF" stopOpacity="0.10" />
          <Stop offset="0.75" stopColor="#FFD1EA" stopOpacity="0.08" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>

        {/* טבעת (rim) בהירה - זה מה שגורם לזה להיראות בועה */}
        <RadialGradient id="soapRim" cx="50%" cy="50%" r="50%">
          <Stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
          <Stop offset="78%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <Stop offset="92%" stopColor="#BFE0FF" stopOpacity="0.35" />
          <Stop offset="100%" stopColor="#FFD1EA" stopOpacity="0.25" />
        </RadialGradient>


        {/* היילייט קטן */}
        <RadialGradient id="highlight" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.8" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>

      </Defs>

      {bubbles.map((b, i) => (
        <React.Fragment key={i}>
          {/* fill */}
          <Circle cx={b.cx} cy={b.cy} r={b.r} fill="url(#soapFill)" opacity={b.o} />
          {/* rim */}
          <Circle cx={b.cx} cy={b.cy} r={b.r} fill="url(#soapRim)" opacity={b.o} />
          {/* highlight (נקודת אור) */}
          <Circle
            cx={b.cx - b.r * 0.35}
            cy={b.cy - b.r * 0.35}
            r={b.r * 0.25}
            fill="url(#highlight)"
            opacity={b.o}
          />
        </React.Fragment>
      ))}
    </Svg>
  );
}
