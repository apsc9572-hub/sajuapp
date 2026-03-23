import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { userEmail, sajuData, timestamp } = await request.json();

    // Nodemailer transporter 설정
    // Gmail 사용 시 '앱 비밀번호' 생성이 필요합니다.
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "apsc9572@gmail.com",
        pass: process.env.EMAIL_PASS, // .env 파일에 설정 필요
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || "apsc9572@gmail.com",
      to: "apsc9572@gmail.com",
      subject: `[청아매당] 프리미엄 사주 분석 실패 리포트 (${userEmail})`,
      text: `
[오류 보고 상세]
- 사용자 연락처: ${userEmail}
- 발생 시각: ${timestamp}

[사주 입력 정보]
${JSON.stringify(sajuData, null, 2)}

위 데이터를 바탕으로 분석 결과를 수동으로 발송해 주시기 바랍니다.
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending error report email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
