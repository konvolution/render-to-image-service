import express, { application, Response } from 'express';
import { svg2png, initialize } from 'svg2png-wasm';
import { readFileSync, existsSync } from 'fs';
import { svgClock } from './svgClock';
import { pie } from './svgPie';

let fontRelativePath = './Roboto.ttf';
let wasmModuleRelativePath = './node_modules/svg2png-wasm/svg2png_wasm_bg.wasm';

// Fix up paths
if (!existsSync(fontRelativePath)) {
  fontRelativePath = '.' + fontRelativePath;
  wasmModuleRelativePath = '.' + wasmModuleRelativePath;
}

function stringToNumberDef(input: unknown, defaultValue: number): number {
  if (typeof(input) !== 'string') {
    return defaultValue;
  }

  const asNumber = parseInt(input, 10);

  return isNaN(asNumber) ? defaultValue : asNumber;
}

function extractValues(data: unknown): number[] {
  if (typeof(data) !== 'string') {
    return [];
  }

  return data.split(',').map(v => v.trim()).map(v => stringToNumberDef(v, 0));
}

function writeCacheableImageResponseHeaders(response: Response<any, Record<string, any>>) {
  response.writeHead(200, {
    'Content-Type': 'image/png',
    'Cache-Control': 'max-age=31557600'
  });
}

function svgToImage(svg: string): Promise<Uint8Array> {
  return svg2png(
    svg,
    {
        scale: 8,
        fonts: [
        // optional
        readFileSync(fontRelativePath), // require, If you use text in svg
        ],
        defaultFontFamily: {
        // optional
        sansSerifFamily: 'Roboto',
        },
    });
}

async function start() {
  await initialize(
    readFileSync(wasmModuleRelativePath),
  );

  const app = express();
  const port = process.env.PORT ?? 3000;

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.get('/api/tweet/render', async (req, res) => {
      const png = await svgToImage(`
        <svg version="1.1" width="300" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="red" />
            <circle cx="150" cy="100" r="80" fill="green" />
            <text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG</text>
        </svg>
      `);

      writeCacheableImageResponseHeaders(res);
      res.end(png, 'binary');
  });

  app.get('/api/time', async (req, res) => {
    let { hour, minute } = req.query;

    const hr = stringToNumberDef(hour, 3);
    const min = stringToNumberDef(minute, 0);
    
    const png = await svgToImage(svgClock(hr, min));

    writeCacheableImageResponseHeaders(res);
    res.end(png, 'binary');
  });

  app.get('/api/svg', async (req, res) => {
    let { value } = req.query;

    if (typeof value !== 'string') {
      res
        .status(500)
        .json({ message: "Error in invocation of API: /api/svg. Missing 'value'." });
    } else {
      try {
        const png = await svgToImage(value);

        writeCacheableImageResponseHeaders(res);
        res.end(png, 'binary');
      }
      catch (error) {
        let message = `Error parsing SVG:\n\n${value}`;

        if (error instanceof Error) {
          message = `Error: ${error.message}.\n\n ${message}.`;
        }

        res
        .status(500)
        .json({ message });
      }
    }
  });

  app.get('/api/pie', async (req, res) => {
    const { data } = req.query;

    const values = extractValues(data);

    if (typeof data !== 'string') {
      res
        .status(500)
        .json({ message: "Error in invocation of API: /api/pie. Data missing." });
    } else {
      try {
        const png = await svgToImage(pie(100, values));

        writeCacheableImageResponseHeaders(res);
        res.end(png, 'binary');
      }
      catch (error) {
        res
        .status(500)
        .json({ message: 'Error generating pie chart' });
      }
    }
  });


  app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
  });
}

start();
