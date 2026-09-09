declare module "imagetracerjs" {
  type TracerOptions = {
    numberofcolors?: number;
    colorquantcycles?: number;
    pathomit?: number;
    ltres?: number;
    qtres?: number;
    strokewidth?: number;
    blurradius?: number;
    linefilter?: boolean;
    rightangleenhance?: boolean;
    scale?: number;
    viewbox?: boolean;
    roundcoords?: number;
    colorsampling?: number;
    mincolorratio?: number;
    layering?: number;
    pal?: { r: number; g: number; b: number; a: number }[];
  };

  const ImageTracer: {
    imagedataToSVG: (data: ImageData, options?: TracerOptions) => string;
  };

  export default ImageTracer;
}
