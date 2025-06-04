const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Çevre değişkenlerini yükle
dotenv.config();

// Express uygulaması oluştur
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

// Yorum modeli
const commentSchema = new mongoose.Schema({
  bookId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Comment = mongoose.model('Comment', commentSchema);

// API rotaları
// Yorum ekle
app.post('/api/comments', async (req, res) => {
  try {
    const { bookId, username, rating, text } = req.body;
    
    // Yeni yorum oluştur
    const newComment = new Comment({
      bookId,
      username,
      rating,
      text
    });
    
    // Yorumu kaydet
    const savedComment = await newComment.save();
    
    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Yorum kaydetme hatası:', error);
    res.status(500).json({ message: 'Yorum kaydedilirken bir hata oluştu' });
  }
});

// Kitaba ait yorumları getir
app.get('/api/comments/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    
    // Kitaba ait yorumları bul
    const comments = await Comment.find({ bookId }).sort({ createdAt: -1 });
    
    res.status(200).json(comments);
  } catch (error) {
    console.error('Yorumları getirme hatası:', error);
    res.status(500).json({ message: 'Yorumlar getirilirken bir hata oluştu' });
  }
});

// Port dinle
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

module.exports = app;
