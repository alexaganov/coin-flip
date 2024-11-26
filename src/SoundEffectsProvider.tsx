import { ReactNode, useEffect, useMemo } from "react";
import { createSafeContext, useSafeContext } from "./utils/context";
import { Howl, Howler } from "howler";
import { useAppStore } from "./store";

interface ContextValue {
  soundEffects: {
    coinThrow: SoundEffect;
    coinFall: SoundEffect;
  };
}

interface SoundEffect {
  play: () => void;
  stop: () => void;
  duration: number;
}

const Context = createSafeContext<ContextValue>();

export const useSoundEffects = () => useSafeContext(Context);

const SoundEffectsProvider = ({ children }: { children?: ReactNode }) => {
  const isAudioMuted = useAppStore((state) => state.isAudioMuted);

  useEffect(() => {
    Howler.volume(0.3);
    Howler.mute(isAudioMuted);
  }, [isAudioMuted]);

  const value = useMemo(() => {
    const coinThrowHowl = new Howl({
      src: ["coin-throw.mp3"],
      sprite: {
        rotate: [0, 50],
        throw: [0, 680],
        inAir: [600, 80, true],
      },
    });

    const coinThrow: SoundEffect = {
      play: () => {
        const throwId = coinThrowHowl.play("throw");

        coinThrowHowl.once("end", (id) => {
          if (throwId === id) {
            coinThrowHowl.play("inAir");
          }
        });
      },
      stop: () => coinThrowHowl.stop(),
      duration: Infinity,
    };

    const fallDuration = 300;

    const coinFallHowl = new Howl({
      src: ["coin-fall.mp3"],
      sprite: {
        fall: [600, fallDuration],
      },
    });

    const coinFall: SoundEffect = {
      play: () => coinFallHowl.play("fall"),
      stop: () => coinFallHowl.stop(),
      duration: fallDuration,
    };

    return {
      soundEffects: {
        coinThrow,
        coinFall,
      },
    };
  }, []);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default SoundEffectsProvider;
