import clsx from "clsx";
import { SpeakerWave } from "./components/icons/SpeakerWave";
import { SpeakerXMark } from "./components/icons/SpeakerXMark";
import { useAppStore } from "./store";
import Button from "./components/Button";
import { VolumeX } from "./components/icons/VolumeX";
import { VolumeFull } from "./components/icons/VolumeFull";

export const ToggleAudioButton = ({ className }: { className?: string }) => {
  const isAudioMuted = useAppStore((state) => state.isAudioMuted);
  const toggleIsAudioMuted = useAppStore((state) => state.toggleIsAudioMuted);

  const Icon = isAudioMuted ? VolumeX : VolumeFull;

  return (
    <Button
      onClick={toggleIsAudioMuted}
      className={clsx(
        // "size-10 flex items-center transition-all justify-center",
        // isAudioMuted ? "invert-[40%]" : "invert-[80%]",
        className
      )}
    >
      <Icon className="size-6" />
    </Button>
  );
};
