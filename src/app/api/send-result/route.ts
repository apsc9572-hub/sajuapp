import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { userEmail, reading, sajuData } = await request.json();

    if (!userEmail || !reading) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "apsc9572@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
    });

    const analysis = reading.analysis || {};
    
    // Format the email content for a premium feel
    const htmlContent = `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333; line-height: 1.8;">
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #D4A373; padding-bottom: 20px;">
          <h1 style="color: #2A365F; font-size: 24px; margin: 0;">청아매당 PREMIUM 사주 감명</h1>
          <p style="color: #D4A373; font-size: 14px; font-weight: bold; margin: 10px 0 0;">세상에 단 하나뿐인 당신의 인생 지도</p>
        </div>
        
        <div style="background-color: #fdfbf7; padding: 25px; border-radius: 15px; margin-bottom: 30px; border: 1px solid #e9e0d2;">
          <h2 style="color: #2A365F; font-size: 18px; border-left: 4px solid #D4A373; padding-left: 12px; margin-bottom: 15px;">■ 인생의 형상</h2>
          <div style="font-size: 15px; color: #444; word-break: keep-all;">${analysis.life_shape ? analysis.life_shape.replace(/\n/g, '<br/>') : '분석 내용이 없습니다.'}</div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #2A365F; font-size: 18px; border-left: 4px solid #D4A373; padding-left: 12px; margin-bottom: 15px;">■ 영역별 심층 분석 및 해답</h2>
          <div style="font-size: 15px; color: #444; word-break: keep-all; background: #fff; padding: 15px; border: 1px solid #eee; border-radius: 10px;">
            ${analysis.solution ? analysis.solution.replace(/\n/g, '<br/>') : '분석 내용이 없습니다.'}
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #2A365F; font-size: 18px; border-left: 4px solid #D4A373; padding-left: 12px; margin-bottom: 15px;">■ 운명의 타이밍 (성패 시기)</h2>
          <div style="font-size: 15px; color: #444; word-break: keep-all;">${analysis.timing ? analysis.timing.replace(/\n/g, '<br/>') : '분석 내용이 없습니다.'}</div>
        </div>

        <div style="background-color: #2A365F; color: #fff; padding: 25px; border-radius: 15px; margin-bottom: 40px;">
          <h2 style="color: #D4A373; font-size: 18px; margin-top: 0;">■ 개운법 (운을 여는 비책)</h2>
          <div style="font-size: 14px; opacity: 0.9; line-height: 1.7;">${reading.luck_advice ? reading.luck_advice.replace(/\n/g, '<br/>') : '내용이 없습니다.'}</div>
        </div>

        <div style="text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
          <p>본 메일은 청아매당에서 발송한 프리미엄 사주 감명 결과지입니다.</p>
          <p>© 2026 청아매당. All rights reserved.</p>
          <p><a href="https://www.cheongamaedang.com" style="color: #D4A373; text-decoration: none;">홈페이지 방문하기</a></p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"청아매당" <${process.env.EMAIL_USER || "apsc9572@gmail.com"}>`,
      to: userEmail,
      subject: `[청아매당] 프리미엄 사주 감명 결과지가 도착했습니다.`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending saju result email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
