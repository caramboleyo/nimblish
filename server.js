import { build } from 'esbuild';
import { minify } from 'terser';
import express from 'express';

const deadCodeRemoval = false;

const clientBundle = await build({
	entryPoints: [{ in: './client.js', out: 'dist.js' }],
	bundle: true,
	write: false,
	format: 'esm',
	legalComments: 'none',
	minify: false,
	keepNames: true,
	sourcemap: 'inline',
	//plugins: [httpPlugin],
});
let dist = clientBundle.outputFiles[0].text;

if (deadCodeRemoval) {
	const result = await minify(dist, {
		sourceMap: false,
		module: true,
		mangle: true,
	});
	dist = result.code;
	//const distMap = result.map;
}

const app = express();
app.use((req, res, next) => {
	res.set('Access-Control-Allow-Origin', '*');
	next();
});
app.get('/favicon.ico', (req, res) => {
	res.set('content-type', 'image/png');
	res.send('');
});
app.get('/', (req, res) => res.sendFile('index.html', { root: '.' }));
app.get('/dist.js', (req, res) => {
	res.set('content-type', 'text/javascript');
	res.send(dist);
});
app.listen(8080, function () {
	console.log(`Listening on ${this._connectionKey}`);
});
