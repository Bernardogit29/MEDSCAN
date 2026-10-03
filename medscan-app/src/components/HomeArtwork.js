import React, { useEffect, useId, useState } from 'react';
import { AccessibilityInfo, AppState, Platform, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Rect, G, Circle } from 'react-native-svg';

// Local decorative animation; never changes measurements or generates health events.
function useDemoMotion(active) {
  const [phase, setPhase] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [foreground, setForeground] = useState(AppState.currentState !== 'background');
  const [visible, setVisible] = useState(Platform.OS !== 'web' || !document.hidden);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduceMotion(value); }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const state = AppState.addEventListener('change', value => setForeground(value === 'active'));
    const onVisibility = () => setVisible(!document.hidden);
    if (Platform.OS === 'web') document.addEventListener('visibilitychange', onVisibility);
    return () => { mounted = false; motion.remove(); state.remove(); if (Platform.OS === 'web') document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  useEffect(() => {
    if (!active || reduceMotion || !foreground || !visible) { setPhase(0); return; }
    let frame, start, last = 0;
    const tick = now => {
      start ??= now;
      if (now - last >= 40) { setPhase(((now - start) % 4800) / 4800); last = now; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, reduceMotion, foreground, visible]);
  return phase;
}
export function VitalSparkline({ color, bars = false, pulse = false, active = true }) {
  const phase = useDemoMotion(active);
  const id = 'spark' + useId().replace(/:/g, '');
  const points = Array.from({length:61}, (_, i) => {
    const x = i * 2;
    const angle = (x / 120 + phase) * Math.PI * 2;
    const cycle = ((x / 60 + phase * 2) % 1 + 1) % 1;
    const peak = (center, width) => Math.exp(-Math.pow((cycle-center)/width,2));
    const y = pulse ? 34 - 8*peak(.23,.045) + 10*peak(.36,.03) - 27*peak(.43,.032) + 17*peak(.50,.036) - 5*peak(.70,.09)
      : 32 + 11*Math.sin(angle) + 5*Math.sin(angle*3 + .8);
    return [x,y];
  });
  const path = points.map(([x,y],i) => (i ? 'L' : 'M') + x + ' ' + y.toFixed(2)).join(' ');
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Svg width="100%" height={50} viewBox="0 0 120 62">
      <Defs><LinearGradient id={id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={color} stopOpacity=".28"/><Stop offset="1" stopColor={color} stopOpacity="0"/></LinearGradient></Defs>
      {bars ? [18,29,36,45,40,48,38].map((base,i)=>{
        const h=base + 7*Math.sin(phase*Math.PI*2+i*.8);
        return <Rect key={i} x={9+i*15} y={60-h} width="9" height={h} rx="3" fill={color} opacity={.25+i*.09}/>;
      }) : <><Path d={path + ' L120 62 L0 62 Z'} fill={'url(#'+id+')'}/><Path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></>}
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
