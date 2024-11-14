import { radToDeg, TWO_PI } from "../utils/math";

export const Coin = ({ radius, depth }: { radius: number; depth: number }) => {
  const frontZ = depth / 2;
  const backZ = -depth / 2;
  const size = radius * 2;

  const radialSegments = 50;

  return (
    <div
      style={{
        transformStyle: "preserve-3d",
        width: size,
        height: size,
        // transform: `translate3d(0, 0, ${z}px)`,
      }}
    >
      <div
        className="absolute rounded-full w-full h-full border border-black flex items-center justify-center"
        style={{
          transform: `translate3d(0, 0, ${frontZ}px)`,
        }}
      >
        front
      </div>

      <div
        className="absolute w-full h-full rounded-full border border-black flex items-center justify-center"
        style={{
          transform: `translate3d(0, 0, ${backZ}px) rotate3d(0, 1, 0, -180deg)`,
        }}
      >
        back
      </div>

      <div
        style={{
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full absolute flex items-center justify-center"
      >
        {Array.from({ length: radialSegments }, (_, i) => {
          const angleStep = TWO_PI / radialSegments;

          const angle = angleStep * i;
          const width = angleStep * radius;

          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          const deg = `${radToDeg(angle) + 90}deg`;

          const transforms = [
            `translate3d(${x}px, ${y}px, 0)`,
            "rotateX(90deg)",
            `rotateY(${deg})`,
          ];

          return (
            <div
              style={{
                width,
                height: depth,
                transformOrigin: "center",
                transformStyle: "preserve-3d",
                transform: transforms.join(" "),
                // width:
              }}
              className="absolute border border-black"
              key={i}
            />
          );
        })}
      </div>
    </div>
  );
};
