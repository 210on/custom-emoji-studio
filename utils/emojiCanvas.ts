import { EmojiConfig } from '../types';

const getScaleX = (text: string, config: EmojiConfig) => {
  let scaleX = config.condense / 100;

  if (config.autoSquare) {
    scaleX *= 2 / Math.max(text.length, 1);
  }

  return scaleX;
};

const getTextX = (size: number, align: EmojiConfig['textAlign']) => {
  if (align === 'left') return size * 0.12;
  if (align === 'right') return size * 0.88;
  return size / 2;
};

export const waitForFonts = async () => {
  if ('fonts' in document) {
    await document.fonts.ready;
  }
};

export const renderEmojiToCanvas = (
  ctx: CanvasRenderingContext2D,
  size: number,
  config: EmojiConfig,
) => {
  ctx.clearRect(0, 0, size, size);
  ctx.textBaseline = 'middle';
  ctx.textAlign = config.textAlign;

  const topY = size * 0.35 - config.spacing * (size / 900);
  const bottomY = size * 0.7 + config.spacing * (size / 900);
  const fontSize = size * 0.21;
  const xPos = getTextX(size, config.textAlign);
  const glyphGap = config.letterSpacing * (size / 900);

  const drawPart = (
    text: string,
    yOffset: number,
    type: 'fill' | 'stroke1' | 'stroke2',
  ) => {
    ctx.save();
    ctx.font = `${config.fontWeight} ${fontSize}px ${config.fontFamily}`;
    ctx.translate(xPos, yOffset);
    ctx.scale(getScaleX(text, config), 1);

    const drawGlyph = (glyph: string, x: number) => {
      if (type === 'stroke2' && config.stroke2Enabled) {
        ctx.strokeStyle = config.stroke2Color;
        ctx.lineWidth = config.stroke2Width * (size / 166);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeText(glyph, x, 0);
      }

      if (type === 'stroke1' && config.stroke1Enabled) {
        ctx.strokeStyle = config.stroke1Color;
        ctx.lineWidth = config.stroke1Width * (size / 166);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeText(glyph, x, 0);
      }

      if (type === 'fill') {
        ctx.fillStyle = config.mainColor;
        ctx.fillText(glyph, x, 0);
      }
    };

    if (Math.abs(glyphGap) < 0.001 || text.length <= 1) {
      drawGlyph(text, 0);
      ctx.restore();
      return;
    }

    const glyphs = Array.from(text);
    const widths = glyphs.map((glyph) => ctx.measureText(glyph).width);
    const totalWidth = widths.reduce((sum, width) => sum + width, 0) + glyphGap * (glyphs.length - 1);

    let currentX = 0;
    if (config.textAlign === 'center') currentX = -totalWidth / 2;
    if (config.textAlign === 'right') currentX = -totalWidth;

    glyphs.forEach((glyph, index) => {
      drawGlyph(glyph, currentX);
      currentX += widths[index] + glyphGap;
    });

    ctx.restore();
  };

  (['stroke2', 'stroke1', 'fill'] as const).forEach((layer) => {
    drawPart(config.textTop, topY, layer);
    drawPart(config.textBottom, bottomY, layer);
  });
};

export const trimTransparentBounds = (sourceCanvas: HTMLCanvasElement) => {
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  const { width, height } = sourceCanvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha === 0) continue;

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) {
    return sourceCanvas;
  }

  const croppedWidth = maxX - minX + 1;
  const croppedHeight = maxY - minY + 1;
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = croppedWidth;
  croppedCanvas.height = croppedHeight;

  const croppedCtx = croppedCanvas.getContext('2d');
  if (!croppedCtx) return sourceCanvas;

  croppedCtx.drawImage(
    sourceCanvas,
    minX,
    minY,
    croppedWidth,
    croppedHeight,
    0,
    0,
    croppedWidth,
    croppedHeight,
  );

  return croppedCanvas;
};
