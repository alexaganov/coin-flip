class StyleTransformBuilder {
  private transforms: string[] = [];

  formatWithUnits(value: number | string, units: string) {
    return typeof value === "number" ? `${value}${units}` : value;
  }

  translate3d({
    x = 0,
    y = 0,
    z = 0,
  }: { x?: number | string; y?: number | string; z?: number | string } = {}) {
    const formattedX = this.formatWithUnits(x, "px");
    const formattedY = this.formatWithUnits(y, "px");
    const formattedZ = this.formatWithUnits(z, "px");

    this.transforms.push(
      `translate3d(${formattedX}, ${formattedY}, ${formattedZ})`
    );

    return this;
  }

  rotateY(angle: string | number) {
    const formattedAngle = this.formatWithUnits(angle, "deg");

    this.transforms.push(`rotateY(${formattedAngle})`);

    return this;
  }

  get() {
    return this.transforms.join(" ");
  }
}

export const styleTransform = () => new StyleTransformBuilder();
