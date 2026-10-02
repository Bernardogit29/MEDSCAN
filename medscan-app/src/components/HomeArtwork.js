import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Rect, G, Circle } from 'react-native-svg';

// Decorative examples only: these paths do not represent patient measurements.
export function VitalSparkline({ color, bars = false, pulse = false }) {
  const id = `spark${useId().replace(/:/g, '')}`;
  const path = pulse ? 'M2 35 L20 35 L26 23 L33 44 L42 8 L50 54 L57 30 L65 35 L78 35 L85 23 L92 41 L99 30 L118 30' : 'M2 44 C14 44 17 33 28 35 S44 47 56 29 S73 42 88 19 S105 12 118 8';
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Svg width="100%" height={50} viewBox="0 0 120 62">
      <Defs><LinearGradient id={id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={color} stopOpacity=".28"/><Stop offset="1" stopColor={color} stopOpacity="0"/></LinearGradient></Defs>
      {bars ? [18,29,36,51,40,56,46].map((h,i)=><Rect key={i} x={9+i*15} y={60-h} width="9" height={h} rx="3" fill={color} opacity={.25+i*.09}/>) : <><Path d={`${path} L118 62 L2 62 Z`} fill={`url(#${id})`}/><Path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></>}
    </Svg>
  </View>;
}
export function RecordArtwork() {
  const id=`paper${useId().replace(/:/g,'')}`;
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{width:125,height:155}}>
    <Svg width="100%" height="100%" viewBox="0 0 160 190">
      <Defs><LinearGradient id={id} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FFFFFF"/><Stop offset="1" stopColor="#C4EEE3"/></LinearGradient></Defs>
      <G transform="translate(18 32) rotate(-12 55 70)"><Rect width="104" height="139" rx="12" fill="#66B5A3"/></G>
      <G transform="translate(36 14) rotate(9 55 70)"><Rect width="108" height="146" rx="12" fill={`url(#${id})`}/><Rect x="14" y="16" width="32" height="32" rx="9" fill="#D0F7E8"/><Path d="M30 41 C7 25 24 16 30 27 C38 13 54 28 30 41" fill="#15967C"/><Rect x="56" y="24" width="34" height="4" rx="2" fill="#B5D3CA"/><Rect x="56" y="34" width="26" height="4" rx="2" fill="#C4DDD4"/><Path d="M14 89 C24 60 38 110 50 84 S66 62 75 80 S89 82 95 65" stroke="#43B599" strokeWidth="3" fill="none" strokeLinecap="round"/><Rect x="14" y="114" width="78" height="4" rx="2" fill="#C1DED3"/><Rect x="14" y="125" width="49" height="4" rx="2" fill="#CDE5DE"/></G>
    </Svg>
  </View>;
}
export function HeaderArtwork({ dark }) {
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{position:'absolute',right:-32,bottom:-45,width:210,height:230,opacity: dark ? 0.5 : 0.8}}>
    <Svg width="100%" height="100%" viewBox="0 0 210 230"><Circle cx="130" cy="102" r="91" fill={dark?'#0B6F5E':'#B6E9DB'}/><Circle cx="70" cy="203" r="89" fill={dark?'#105549':'#82CDB8'} opacity=".6"/><G transform="rotate(14 135 133)"><Rect x="89" y="54" width="105" height="123" rx="22" fill={dark?'#186354':'#E2F8F0'} stroke={dark?'#387F71':'#FFFFFF'} strokeWidth="2"/><Path d="M129 81 H150 V102 H171 V123 H150 V144 H129 V123 H108 V102 H129 Z" fill={dark?'#78CCB3':'#8ACEBA'} opacity=".7"/></G></Svg>
  </View>;
}
