const axios = require('axios');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const FormData = require('form-data');

const app = express();
const PORT = 3000;
const discord_webhook_url = 'https://discord.com/api/webhooks/1225858799391346790/XxszN0uhg9SNtboQhP2N1TCi9a_kIw8CSx46RccyljKDhCWoIQ_286joUEPgJHEHveSy';

app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const randomName = Math.random().toString(36).substring(2, 15);
    const fileName = 'image-' + randomName + ext;
    fs.access('public/uploads/' + fileName, fs.constants.F_OK, (err) => {
      if (err) {
        cb(null, fileName);
      } else {
        const newRandomName = Math.random().toString(36).substring(2, 15);
        const newFileName = 'image-' + newRandomName + ext;
        cb(null, newFileName);
      }
    });
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }

  const shouldRemoveBackground = req.body.removeBackground === 'true';

  try {
    const inputFile = req.file.path;
    const outputFile = `public/uploads/${req.file.filename}`;
    const tempFile = `${req.file.filename}-temp${path.extname(req.file.originalname)}`;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
      await sharp(inputFile)
        .jpeg({ quality: 90 })
        .toFile(`${__dirname}/public/uploads/${tempFile}`);
    } else if (fileExtension === '.png') {
      await sharp(inputFile)
        .png({ quality: 90 })
        .toFile(`${__dirname}/public/uploads/${tempFile}`);
    } else {
      res.status(400).json({ error: 'Invalid file format' });
      return;
    }

    const tempFilePath = `${__dirname}/public/uploads/${tempFile}`;

    if (shouldRemoveBackground) {
      // ลบพื้นหลังรูปภาพด้วยการเรียกใช้ฟังก์ชัน removeBackground
      await removeBackground(tempFilePath, outputFile);
    }

    await unlinkFile(tempFilePath);

    const imageUrl = req.file.filename;

    // ส่ง Webhook ไปยัง Discord
    await sendImageToDiscord(`/uploads/${imageUrl}`);

    res.json({ imageUrl: `/uploads/${imageUrl}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing image' });
  }
});

async function removeBackground(inputFile, outputFile) {
/*   หากต้องการะบบลบพื้นหลังติดต่อได้ที่  https://discord.gg/Z5bYHcZ6dn */
}

async function sendImageToDiscord(imageUrl) {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(`${__dirname}/public${imageUrl}`));
    formData.append('payload_json', JSON.stringify({ content: 'New image uploaded' }));

    const config = {
      headers: {
        ...formData.getHeaders(),
      },
    };

    await axios.post(discord_webhook_url, formData, config);

  } catch (error) {
    console.error('Error sending image to Discord:', error);
  }
}

app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, `public/uploads/${filename}`));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});