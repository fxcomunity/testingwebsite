import nodemailer from 'nodemailer'
const tr = nodemailer.createTransport({ service:'gmail', auth:{ user:process.env.GMAIL_USER, pass:process.env.GMAIL_PASS } })
export async function sendOTP(email:string, otp:string, name='') {
  await tr.sendMail({
    from:`"FX Comunity 📚" <${process.env.GMAIL_USER}>`, to:email,
    subject:'🔑 Kode OTP Reset Password - FX Comunity',
    html:`<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0d0d1a;border-radius:16px;overflow:hidden;border:1px solid #1F4788">
<div style="background:linear-gradient(135deg,#1F4788,#C720E6);padding:30px;text-align:center">
<div style="font-size:36px">📚</div>
<h1 style="color:#fff;margin:8px 0 0;font-size:22px;letter-spacing:2px">FX COMUNITY</h1>
<p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:12px">Trading Knowledge Platform</p>
</div>
<div style="padding:28px">
<p style="color:#c0c0e0;font-size:15px">Halo <b style="color:#FF6B35">${name||email}</b>,</p>
<p style="color:#a0a0c0;font-size:14px">Kamu minta reset password. Gunakan kode OTP di bawah ini:</p>
<div style="background:#1a1a2e;border:2px dashed #C720E6;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
<p style="color:#a0a0c0;margin:0 0 8px;font-size:12px">KODE OTP KAMU</p>
<h2 style="color:#FF6B35;font-size:42px;letter-spacing:12px;margin:0;font-family:monospace">${otp}</h2>
<p style="color:#e04040;margin:10px 0 0;font-size:12px">⏱ Berlaku 5 menit saja</p>
</div>
<p style="color:#606080;font-size:12px">Jika bukan kamu yang minta, abaikan email ini.</p>
</div>
</div>`
  })
}
