const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3009;

// Kích hoạt CORS để cho phép web giao diện gọi dữ liệu trực tiếp
app.use(cors());

// Hàm lấy thời gian chuẩn UTC+7
function getCurrentTimeUTC7() {
  const now = new Date();
  const offset = 7;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const localTime = new Date(utc + (3600000 * offset));
  const day = String(localTime.getDate()).padStart(2, '0');
  const month = String(localTime.getMonth() + 1).padStart(2, '0');
  const year = localTime.getFullYear();
  const hours = String(localTime.getHours()).padStart(2, '0');
  const minutes = String(localTime.getMinutes()).padStart(2, '0');
  const seconds = String(localTime.getSeconds()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds} UTC+7`;
}

app.get('/api/lcmd5', async (req, res) => {
  try {
    const response = await axios.get('https://wtxmd52.tele68.com/v1/txmd5/sessions', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    const data = response.data;
    let sessions = data.list || data;
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'Không có dữ liệu' });
    }
    sessions.sort((a, b) => b.id - a.id);
    const latest = sessions[0];
    const ketQua = latest.resultTruyenThong ? latest.resultTruyenThong.toLowerCase() : '';
    const phien = latest.id || latest._id;
    const tong = latest.point || 0;
    const xucXac = latest.dices || [0, 0, 0];

    res.json({
      success: true,
      data: {
        ket_qua: ketQua,
        phien: phien,
        thoi_gian: getCurrentTimeUTC7(),
        tong: tong,
        xuc_xac_1: xucXac[0] || 0,
        xuc_xac_2: xucXac[1] || 0,
        xuc_xac_3: xucXac[2] || 0
      }
    });
  } catch (error) {
    console.error('Lỗi khi fetch API gốc:', error.message);
    res.status(500).json({ success: false, message: 'Lỗi server kết nối API gốc', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('AI TX MD5 API Server đang hoạt động!');
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
});
