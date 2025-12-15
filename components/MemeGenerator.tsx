'use client';

import { useState, useRef, useEffect } from 'react';

interface TextItem {
  id: string;
  text: string;
  position: 'top' | 'center' | 'bottom';
  fontSize: number;
  color: string;
}

interface MemeGeneratorProps {
  onMemeCreated: (imageDataUrl: string) => void;
}

export default function MemeGenerator({ onMemeCreated }: MemeGeneratorProps) {
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [textInput, setTextInput] = useState('');
  const [position, setPosition] = useState<'top' | 'center' | 'bottom'>('top');
  const [fontSize, setFontSize] = useState(50);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setCurrentImage(img);
        setImageLoaded(true);
        if (canvasRef.current) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
        }
        drawMeme();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

    const allTexts = [...texts];
    if (textInput.trim()) {
      allTexts.push({
        id: 'preview',
        text: textInput,
        position,
        fontSize,
        color: textColor,
      });
    }

    if (!allTexts.length) return;

    const padding = 30;
    const grouped: { top: TextItem[]; center: TextItem[]; bottom: TextItem[] } = {
      top: [],
      center: [],
      bottom: [],
    };

    allTexts.forEach((item) => {
      const key = grouped[item.position] ? item.position : 'center';
      grouped[key].push(item);
    });

    const drawGroupTopDown = (items: TextItem[], startY: number) => {
      let cursor = startY;
      items.forEach((item) => {
        drawTextItem(ctx, item, cursor + item.fontSize / 2, canvas.width);
        cursor += item.fontSize + 10;
      });
    };

    const drawGroupBottomUp = (items: TextItem[], startY: number) => {
      let cursor = startY;
      items.forEach((item) => {
        drawTextItem(ctx, item, cursor - item.fontSize / 2, canvas.width);
        cursor -= item.fontSize + 10;
      });
    };

    if (grouped.top.length) {
      drawGroupTopDown(grouped.top, padding);
    }

    if (grouped.center.length) {
      const totalHeight = grouped.center.reduce((sum, item, index) => {
        return sum + item.fontSize + (index === grouped.center.length - 1 ? 0 : 10);
      }, 0);
      const start = (canvas.height - totalHeight) / 2;
      drawGroupTopDown(grouped.center, start);
    }

    if (grouped.bottom.length) {
      drawGroupBottomUp(grouped.bottom, canvas.height - padding);
    }
  };

  const drawTextItem = (
    ctx: CanvasRenderingContext2D,
    item: TextItem,
    y: number,
    canvasWidth: number
  ) => {
    ctx.font = `${item.fontSize}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = item.fontSize / 8;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = item.color;

    const x = canvasWidth / 2;
    ctx.strokeText(item.text, x, y);
    ctx.fillText(item.text, x, y);
  };

  useEffect(() => {
    drawMeme();
  }, [currentImage, texts, textInput, position, fontSize, textColor, imageLoaded]);

  const addText = () => {
    if (!imageLoaded || !textInput.trim()) return;

    setTexts([
      ...texts,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        text: textInput.trim(),
        position,
        fontSize,
        color: textColor,
      },
    ]);
    setTextInput('');
  };

  const removeText = (id: string) => {
    setTexts(texts.filter((item) => item.id !== id));
  };

  const clearTexts = () => {
    setTexts([]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const dataURL = canvas.toDataURL('image/png');
    onMemeCreated(dataURL);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Meme Generator</h2>

      <div className="mb-6 text-center">
        <label className="cursor-pointer inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:shadow-lg transition-shadow">
          Choose Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) loadImage(file);
            }}
          />
        </label>
      </div>

      <div className="mb-6 flex justify-center bg-gray-50 p-4 rounded-lg">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto border-2 border-gray-200 rounded-lg shadow-sm"
          style={{ maxHeight: '500px' }}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Meme Text:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter your meme text here..."
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') addText();
              }}
            />
            <button
              onClick={addText}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Add Text
            </button>
            <button
              onClick={clearTexts}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">Text Position:</label>
          <div className="flex gap-2">
            {(['top', 'center', 'bottom'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  position === pos
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Font Size: {fontSize}px
          </label>
          <input
            type="range"
            min="20"
            max="100"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">Text Color:</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-20 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
          />
        </div>

        {texts.length > 0 && (
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Added Texts:</label>
            <ul className="space-y-2">
              {texts.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-700">{item.text}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      {item.position}
                    </span>
                    <button
                      onClick={() => removeText(item.id)}
                      className="text-red-600 font-bold hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={!imageLoaded}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Use This Meme
        </button>
      </div>
    </div>
  );
}
