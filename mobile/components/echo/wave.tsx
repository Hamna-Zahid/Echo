  import React from "react";
  import { View, StyleSheet } from "react-native";
  import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
  } from "react-native-reanimated";

  const bars = [
    { height: 13, delay: 0 },
    { height: 20, delay: 100 },
    { height: 32, delay: 200 },
    { height: 47, delay: 300 },
    { height: 32, delay: 400 },
    { height: 20, delay: 500 },
    { height: 13, delay: 600 },
  ];

  const WaveBar = ({
    height,
    delay,
  }: {
    height: number;
    delay: number;
  }) => {
    const scale = useSharedValue(0.75);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        scale.value = withRepeat(
          withTiming(1, {
            duration: 600,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true
        );
      }, delay);
    
      return () => clearTimeout(timer);
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            scaleY: scale.value,
          },
        ],
      };
    });

    return (
      <Animated.View
        style={[
          styles.bar,
          {
            height,
          },
          animatedStyle,
        ]}
      />
    );
  };


  export default function Wave() {
    return (
      <View style={styles.container}>
        {bars.map((item, index) => (
          <WaveBar
            key={index}
            height={item.height}
            delay={item.delay}
          />
        ))}
      </View>
    );
  }


  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    bar: {
      width: 4,
      borderRadius: 20,
      backgroundColor: "#ff2d8d",
    },
  });