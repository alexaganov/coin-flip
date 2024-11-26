import clsx from "clsx";
import { useAppStore } from "./store";
import Button from "./components/Button";
import { VolumeFull } from "./components/icons/VolumeFull";
import { VolumeX } from "./components/icons/VolumeX";

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
        className,
        {
          "btn-muted btn-active": isAudioMuted,
        }
        // isAudioMuted ? "btn-muted" : "btn-active"
      )}
    >
      <Icon className="size-6" />
    </Button>
  );
};
