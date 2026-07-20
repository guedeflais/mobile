import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Stop } from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface ButterflyProps {
  flying: boolean;
  size?: number;
}

/**
 * Port du papillon SVG du web (src/components/Butterfly.tsx dans
 * gatinelle-app) : battement d'ailes, balancement des antennes et léger
 * mouvement du corps en continu ; envol au succès d'un paiement.
 * react-native-svg n'a pas d'équivalent CSS @keyframes/transform-origin :
 * chaque mouvement est un Animated.Value interpolé en chaîne de transform
 * SVG (translate/scale/skew/rotate autour d'un pivot explicite).
 */
export function Butterfly({ flying, size = 72 }: ButterflyProps) {
  const wingFlap = useRef(new Animated.Value(0)).current;
  const antennaSway = useRef(new Animated.Value(0)).current;
  const bodyBob = useRef(new Animated.Value(0)).current;
  const takeoff = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loops: Animated.CompositeAnimation[] = [];
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced || cancelled) return;
      const loop = (value: Animated.Value, duration: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
            Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          ]),
        );
      loops = [loop(wingFlap, 800), loop(antennaSway, 1600), loop(bodyBob, 800)];
      loops.forEach((l) => l.start());
    });

    return () => {
      cancelled = true;
      loops.forEach((l) => l.stop());
    };
  }, [wingFlap, antennaSway, bodyBob]);

  useEffect(() => {
    if (flying) {
      takeoff.setValue(0);
      Animated.timing(takeoff, {
        toValue: 1,
        duration: 1600,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      takeoff.setValue(0);
    }
  }, [flying, takeoff]);

  const takeoffTransform = takeoff.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: ["translate(0,0) rotate(0)", "translate(30,-40) rotate(-8)", "translate(70,-140) rotate(12)"],
  });
  const takeoffOpacity = takeoff.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 1, 0] });

  const leftUpperWingTransform = wingFlap.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "translate(300,0) skewY(0) scale(1,1) translate(-300,0)",
      "translate(300,0) skewY(4) scale(0.78,1) translate(-300,0)",
    ],
  });
  const rightUpperWingTransform = wingFlap.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "translate(300,0) skewY(0) scale(1,1) translate(-300,0)",
      "translate(300,0) skewY(-4) scale(0.78,1) translate(-300,0)",
    ],
  });

  const bodyTransform = bodyBob.interpolate({
    inputRange: [0, 1],
    outputRange: ["translate(0,0)", "translate(0,3)"],
  });
  const leftAntennaTransform = antennaSway.interpolate({
    inputRange: [0, 1],
    outputRange: ["rotate(0 296 138)", "rotate(3 296 138)"],
  });
  const rightAntennaTransform = antennaSway.interpolate({
    inputRange: [0, 1],
    outputRange: ["rotate(0 304 138)", "rotate(3 304 138)"],
  });

  return (
    <Svg width={size} height={(size * 500) / 600} viewBox="0 0 600 500">
      <Defs>
        <LinearGradient id="wingGradLeft" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
          <Stop offset="55%" stopColor="#dbe9f4" stopOpacity={0.9} />
          <Stop offset="100%" stopColor="#a9c9dd" stopOpacity={0.85} />
        </LinearGradient>
        <LinearGradient id="wingGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
          <Stop offset="55%" stopColor="#dbe9f4" stopOpacity={0.9} />
          <Stop offset="100%" stopColor="#a9c9dd" stopOpacity={0.85} />
        </LinearGradient>
        <LinearGradient id="lowerWingGradLeft" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#eef6fb" stopOpacity={0.95} />
          <Stop offset="100%" stopColor="#bcd7e6" stopOpacity={0.85} />
        </LinearGradient>
        <LinearGradient id="lowerWingGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#eef6fb" stopOpacity={0.95} />
          <Stop offset="100%" stopColor="#bcd7e6" stopOpacity={0.85} />
        </LinearGradient>
        <LinearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#5c7a90" />
          <Stop offset="100%" stopColor="#2b3d4a" />
        </LinearGradient>
      </Defs>

      <AnimatedG transform={takeoffTransform} opacity={takeoffOpacity}>
        <AnimatedG transform={leftUpperWingTransform}>
          <Path
            d="M300,180 C230,90 130,55 60,80 C15,96 5,150 35,190 C65,230 130,250 190,235 C240,222 280,205 300,180 Z"
            fill="url(#wingGradLeft)"
            stroke="#ffffff"
            strokeWidth={1.5}
          />
          <Path d="M295,175 C240,130 170,100 100,100" stroke="#ffffff" strokeWidth={1} opacity={0.55} fill="none" />
          <Path d="M295,185 C250,160 190,150 130,160" stroke="#ffffff" strokeWidth={1} opacity={0.55} fill="none" />
          <Circle cx={120} cy={105} r={4} fill="#ffffff" opacity={0.5} />
          <Circle cx={145} cy={95} r={3} fill="#ffffff" opacity={0.5} />
          <Circle cx={170} cy={88} r={3.5} fill="#ffffff" opacity={0.5} />
          <Ellipse cx={150} cy={130} rx={22} ry={16} fill="#8fb8d4" opacity={0.45} />
          <Ellipse cx={150} cy={130} rx={10} ry={7} fill="#ffffff" opacity={0.6} />
          <Path
            d="M60,80 C15,96 5,150 35,190 C65,230 130,250 190,235"
            stroke="#7fa6bf"
            strokeWidth={1.5}
            strokeDasharray="2 5"
            fill="none"
            opacity={0.6}
            strokeLinecap="round"
          />
        </AnimatedG>

        <AnimatedG transform={rightUpperWingTransform}>
          <Path
            d="M300,180 C370,90 470,55 540,80 C585,96 595,150 565,190 C535,230 470,250 410,235 C360,222 320,205 300,180 Z"
            fill="url(#wingGradRight)"
            stroke="#ffffff"
            strokeWidth={1.5}
          />
          <Path d="M305,175 C360,130 430,100 500,100" stroke="#ffffff" strokeWidth={1} opacity={0.55} fill="none" />
          <Path d="M305,185 C350,160 410,150 470,160" stroke="#ffffff" strokeWidth={1} opacity={0.55} fill="none" />
          <Circle cx={480} cy={105} r={4} fill="#ffffff" opacity={0.5} />
          <Circle cx={455} cy={95} r={3} fill="#ffffff" opacity={0.5} />
          <Circle cx={430} cy={88} r={3.5} fill="#ffffff" opacity={0.5} />
          <Ellipse cx={450} cy={130} rx={22} ry={16} fill="#8fb8d4" opacity={0.45} />
          <Ellipse cx={450} cy={130} rx={10} ry={7} fill="#ffffff" opacity={0.6} />
          <Path
            d="M540,80 C585,96 595,150 565,190 C535,230 470,250 410,235"
            stroke="#7fa6bf"
            strokeWidth={1.5}
            strokeDasharray="2 5"
            fill="none"
            opacity={0.6}
            strokeLinecap="round"
          />
        </AnimatedG>

        <AnimatedG transform={leftUpperWingTransform}>
          <Path
            d="M300,205 C255,250 200,300 150,305 C110,309 85,280 95,245 C105,212 150,195 200,197 C240,199 275,200 300,205 Z"
            fill="url(#lowerWingGradLeft)"
            stroke="#ffffff"
            strokeWidth={1.5}
          />
          <Path d="M295,215 C260,245 210,275 165,280" stroke="#ffffff" strokeWidth={1} opacity={0.55} fill="none" />
          <Circle cx={170} cy={260} r={3} fill="#ffffff" opacity={0.5} />
          <Circle cx={195} cy={270} r={2.5} fill="#ffffff" opacity={0.5} />
          <Ellipse cx={180} cy={240} rx={14} ry={10} fill="#8fb8d4" opacity={0.5} />
        </AnimatedG>

        <AnimatedG transform={rightUpperWingTransform}>
          <Path
            d="M300,205 C345,250 400,300 450,305 C490,309 515,280 505,245 C495,212 450,195 400,197 C360,199 325,200 300,205 Z"
            fill="url(#lowerWingGradRight)"
            stroke="#ffffff"
            strokeWidth={1.5}
          />
          <Path d="M305,215 C340,245 390,275 435,280" stroke="#ffffff" strokeWidth={1} opacity={0.55} fill="none" />
          <Circle cx={430} cy={260} r={3} fill="#ffffff" opacity={0.5} />
          <Circle cx={405} cy={270} r={2.5} fill="#ffffff" opacity={0.5} />
          <Ellipse cx={420} cy={240} rx={14} ry={10} fill="#8fb8d4" opacity={0.5} />
        </AnimatedG>

        <AnimatedG transform={bodyTransform}>
          <Path
            d="M300,150 C308,150 314,158 314,172 L314,255 C314,275 308,290 300,295 C292,290 286,275 286,255 L286,172 C286,158 292,150 300,150 Z"
            fill="url(#bodyGrad)"
            stroke="#1c2933"
            strokeWidth={1}
          />
          <Line x1={288} y1={185} x2={312} y2={185} stroke="#1c2933" strokeWidth={0.8} opacity={0.5} />
          <Line x1={288} y1={205} x2={312} y2={205} stroke="#1c2933" strokeWidth={0.8} opacity={0.5} />
          <Line x1={289} y1={225} x2={311} y2={225} stroke="#1c2933" strokeWidth={0.8} opacity={0.5} />
          <Line x1={290} y1={245} x2={310} y2={245} stroke="#1c2933" strokeWidth={0.8} opacity={0.5} />
          <Circle cx={300} cy={145} r={12} fill="url(#bodyGrad)" stroke="#1c2933" strokeWidth={1} />
          <AnimatedPath
            transform={leftAntennaTransform}
            d="M296,138 C280,118 260,100 245,90"
            stroke="#2b3d4a"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
          <AnimatedPath
            transform={rightAntennaTransform}
            d="M304,138 C320,118 340,100 355,90"
            stroke="#2b3d4a"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx={245} cy={90} r={6} fill="#2b3d4a" />
          <Circle cx={355} cy={90} r={6} fill="#2b3d4a" />
        </AnimatedG>
      </AnimatedG>
    </Svg>
  );
}
