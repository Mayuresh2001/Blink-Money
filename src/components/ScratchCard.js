import { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  PanResponder,
  Animated as RNAnimated,
} from "react-native";
import { COLORS } from "../theme/colors";
const CARD_WIDTH = 260;
const CARD_HEIGHT = 160;

const ROWS = 6;
const COLS = 8;
const TOTAL_CELLS = ROWS * COLS;

export default function ScratchCard({ prizeText, onScratchComplete }) {
  const [scratchedCells, setScratchedCells] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const scratchedCellsRef = useRef({});
  const isCompletedRef = useRef(false);

  const fadeAnim = useRef(new RNAnimated.Value(1)).current;

  const containerRef = useRef(null);

  const containerLayout = useRef({
    x: 0,
    y: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  });

  const handleTouch = (pageX, pageY) => {
    if (isCompletedRef.current) {
      return;
    }

    const { x, y, width, height } = containerLayout.current;

    const relX = pageX - x;
    const relY = pageY - y;

    if (relX < 0 || relX > width || relY < 0 || relY > height) {
      return;
    }

    const cellWidth = CARD_WIDTH / COLS;
    const cellHeight = CARD_HEIGHT / ROWS;

    const colIndex = Math.min(COLS - 1, Math.floor(relX / cellWidth));

    const rowIndex = Math.min(ROWS - 1, Math.floor(relY / cellHeight));

    const cellKey = `${rowIndex}-${colIndex}`;

    if (scratchedCellsRef.current[cellKey]) {
      return;
    }

    const newScratched = {
      ...scratchedCellsRef.current,
      [cellKey]: true,
    };

    scratchedCellsRef.current = newScratched;

    setScratchedCells(newScratched);

    const count = Object.keys(newScratched).length;
    const pct = count / TOTAL_CELLS;

    console.log(`Scratch progress: ${Math.round(pct * 100)}%`);

    if (pct >= 0.55 && !isCompletedRef.current) {
      isCompletedRef.current = true;
      setIsCompleted(true);

      RNAnimated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onScratchComplete?.();
      });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (event) => {
        const { pageX, pageY } = event.nativeEvent;

        handleTouch(pageX, pageY);
      },

      onPanResponderMove: (event) => {
        const { pageX, pageY } = event.nativeEvent;

        handleTouch(pageX, pageY);
      },

      onPanResponderTerminationRequest: () => false,

      onShouldBlockNativeResponder: () => true,
    }),
  ).current;

  const onLayout = () => {
    if (!containerRef.current) {
      return;
    }

    containerRef.current.measure((x, y, width, height, pageX, pageY) => {
      containerLayout.current = {
        x: pageX,
        y: pageY,
        width,
        height,
      };
    });
  };

  const renderOverlayBlocks = () => {
    const blocks = [];

    const cellWidth = CARD_WIDTH / COLS;
    const cellHeight = CARD_HEIGHT / ROWS;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const key = `${r}-${c}`;
        const isScratched = scratchedCells[key];

        blocks.push(
          <View
            key={key}
            pointerEvents="none"
            style={[
              styles.scratchBlock,
              {
                width: cellWidth + 1,
                height: cellHeight + 1,
                left: c * cellWidth,
                top: r * cellHeight,

                opacity: isScratched ? 0 : 1,
              },
            ]}
          />,
        );
      }
    }

    return blocks;
  };

  return (
    <View ref={containerRef} onLayout={onLayout} style={styles.container}>
      <View style={styles.prizeLayer}>
        <Text style={styles.prizeSubtitle}>CONGRATULATIONS!</Text>

        <Text style={styles.prizeTitle}>{prizeText}</Text>

        <Text style={styles.prizeBadge}>Claimed in Wallet</Text>
      </View>
      {!isCompleted && (
        <RNAnimated.View
          {...panResponder.panHandlers}
          style={[
            styles.coverLayer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Scratchable grid */}
          <View pointerEvents="none" style={styles.blocksContainer}>
            {renderOverlayBlocks()}
          </View>

          {/* Instruction */}
          <View pointerEvents="none" style={styles.coverContent}>
            <Text style={styles.coverIcon}>🎁</Text>

            <Text style={styles.coverTitle}>Blink Reward Card</Text>

            <Text style={styles.coverDesc}>Drag your finger to scratch</Text>
          </View>
        </RNAnimated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",

    backgroundColor: COLORS.cardBg,

    borderColor: COLORS.cardBorder,
    borderWidth: 1.5,

    position: "relative",

    elevation: 4,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  prizeLayer: {
    position: "absolute",

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    backgroundColor: "#1C3116",

    justifyContent: "center",
    alignItems: "center",

    padding: 16,
  },

  prizeSubtitle: {
    color: COLORS.primary,

    fontSize: 10,
    fontWeight: "800",

    letterSpacing: 2,

    marginBottom: 8,
  },

  prizeTitle: {
    color: COLORS.white,

    fontSize: 20,
    fontWeight: "900",

    textAlign: "center",

    marginBottom: 8,

    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 3,
  },

  prizeBadge: {
    fontSize: 10,
    fontWeight: "700",

    backgroundColor: COLORS.saveBg,
    color: COLORS.save,

    paddingHorizontal: 8,
    paddingVertical: 3,

    borderRadius: 10,
  },

  coverLayer: {
    position: "absolute",

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    zIndex: 10,
  },

  blocksContainer: {
    position: "absolute",

    width: "100%",
    height: "100%",

    zIndex: 1,
  },

  scratchBlock: {
    position: "absolute",

    backgroundColor: "#344D2A",
  },

  /*
   * IMPORTANT:
   * This layer is now transparent.
   *
   * Your old version had:
   * backgroundColor: 'rgba(21, 34, 16, 0.9)'
   *
   * which visually covered the scratched cells.
   */
  coverContent: {
    position: "absolute",

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    justifyContent: "center",
    alignItems: "center",

    zIndex: 2,

    backgroundColor: "transparent",
  },

  coverIcon: {
    fontSize: 34,
    marginBottom: 6,
  },

  coverTitle: {
    color: COLORS.white,

    fontSize: 15,
    fontWeight: "800",

    letterSpacing: 0.5,
  },

  coverDesc: {
    color: COLORS.textSecondary,

    fontSize: 10,

    marginTop: 4,

    fontWeight: "600",
  },
});
