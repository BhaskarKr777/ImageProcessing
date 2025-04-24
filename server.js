import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './sample/'),
  filename: (req, file, cb) => cb(null, 'image.png'),
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use('/result', express.static(path.join(__dirname, 'result')));

app.post('/upload', upload.single('image'), (req, res) => {
  console.log('✅ Image uploaded');

  exec('node index.js', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Error executing index.js:', err);
      return res.status(500).send('Processing failed');
    }
    console.log(stdout);
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
