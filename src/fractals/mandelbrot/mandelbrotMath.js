export const INITIAL_MANDELBROT_VIEW = {
  centerX: -0.55,
  centerY: 0,
  width: 3.2,
};

export function mandelbrotIterations(cx, cy, maxIter, bailout) {
  let x = 0;
  let y = 0;
  const bailout2 = bailout * bailout;

  for (let i = 0; i < maxIter; i++) {
    const x2 = x * x;
    const y2 = y * y;
    if (x2 + y2 > bailout2) return i;

    y = 2 * x * y + cy;
    x = x2 - y2 + cx;
  }

  return maxIter;
}

function mandelbrotEscape(cx, cy, maxIter, bailout) {
  let x = 0;
  let y = 0;
  const bailout2 = bailout * bailout;

  for (let i = 0; i < maxIter; i++) {
    const x2 = x * x;
    const y2 = y * y;
    const radius2 = x2 + y2;
    if (radius2 > bailout2) {
      return { iter: i, radius: Math.sqrt(radius2) };
    }

    y = 2 * x * y + cy;
    x = x2 - y2 + cx;
  }

  return { iter: maxIter, radius: 0 };
}

function writeColor(sample, maxIter, bailout, data, offset) {
  if (sample.iter >= maxIter) {
    data[offset] = 5;
    data[offset + 1] = 7;
    data[offset + 2] = 20;
    data[offset + 3] = 255;
    return;
  }

  const smoothIter = sample.iter + 1 - Math.log2(Math.max(1, Math.log2(Math.max(sample.radius, 1.0001))));
  const t = Math.max(0, Math.min(1, smoothIter / maxIter));
  const glow = Math.pow(t, 0.58);
  const band = 0.5 + 0.5 * Math.sin(18 * t + bailout * 0.75);

  data[offset] = Math.round(1 + 42 * glow + 96 * glow * band);
  data[offset + 1] = Math.round(1 + 68 * glow + 120 * Math.pow(t, 1.15) * (1 - band * 0.25));
  data[offset + 2] = Math.round(30 + 72 * glow + 96 * glow * band);
  data[offset + 3] = 255;
}

export function renderMandelbrot(canvas, view, maxIter, bailout) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const image = ctx.createImageData(width, height);
  const viewHeight = view.width * height / width;

  for (let py = 0; py < height; py++) {
    const cy = view.centerY + (py / height - 0.5) * viewHeight;
    for (let px = 0; px < width; px++) {
      const cx = view.centerX + (px / width - 0.5) * view.width;
      const sample = mandelbrotEscape(cx, cy, maxIter, bailout);
      writeColor(sample, maxIter, bailout, image.data, (py * width + px) * 4);
    }
  }

  ctx.putImageData(image, 0, 0);
}
