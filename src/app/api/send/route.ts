import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { put } from '@vercel/blob';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    const { 
      type, service, name, date_start, date_end, budget, 
      info, contact_name, contact_phone, contact_email,
      fileData, fileName 
    } = formData;

    if (!contact_email || !contact_email.includes('@')) {
      return NextResponse.json({ error: '유효한 이메일 주소를 입력해주세요.' }, { status: 400 });
    }

    const category = type === 'creative' ? '창작' : '제품';
    const displayTitle = name || service || '제목 없음'; 
    const dateRange = (date_start || date_end) 
  ? `${date_start || '미정'} ~ ${date_end || '미정'}` 
  : '미정';
    const pointColor = type === 'creative' ? '#FB4C4C' : '#3A86FF';
    const destinationEmail = type === 'creative' ? 'ne@jji.kr' : 'mo@jji.kr';

    // 1. Vercel Blob 업로드 로직
    let fileUrl = '없음';
    const attachments = [];
    if (fileData && fileName) {
      const base64Content = fileData.split(',')[1];
      const buffer = Buffer.from(base64Content, 'base64');
      try {
        const blob = await put(`requests/${Date.now()}-${fileName}`, buffer, { access: 'public' });
        fileUrl = blob.url;
        attachments.push({ filename: fileName, content: buffer });
      } catch (e) { console.error("Blob 업로드 실패"); }
    }

    // 2. Postgres DB 저장 (service 추가)
    try {
      await sql`
        INSERT INTO requests (type, service, client_name, phone, email, title, content, date_range, budget, file_url)
        VALUES (${category}, ${service || ''}, ${contact_name}, ${contact_phone || ''}, ${contact_email}, ${displayTitle}, ${info || ''}, ${dateRange}, ${budget || '협의'}, ${fileUrl})
      `;
    } catch (e) { console.error("DB 저장 실패", e); }

    // 3. 이메일 템플릿
    const emailHtml = `
      <div style="background-color: #ffffff; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', Pretendard, sans-serif; color: #191F28;">
        <div style="max-width: 800px; margin: 0 auto; border-radius: 16px; border: 2px solid #f9fafb; background-color: #ffffff;">
          <div style="padding: 40px 40px 20px 40px; text-align: left;">
            <img src="https://req.jji.kr/logo.png" alt="JJI Logo" width="89" height="31" style="display: block;" />
          </div>
          <div style="padding: 0 40px 40px 40px;">
            <p style="font-size: 16px; line-height: 1.6; color: #4E5968; margin-bottom: 40px;">
              안녕하세요, <strong>${contact_name}</strong>님.<br/><br/>
              <strong>${displayTitle}</strong> 의뢰가 성공적으로 접수되었습니다 💌<br/>
              소중한 요청 남겨주셔서 감사합니다.<br/><br/>
              현재 전달해주신 내용을 바탕으로 검토가 진행될 예정이며,<br/>
              3~4일 이내에 작성해주신 이메일로 답변드리겠습니다.<br/><br/>
              아래는 접수하신 의뢰 정보입니다.
            </p>

            <hr style="border: none; border-top: 1px solid #F2F4F6; margin: 0 0 32px 0;" />

            <table style="width: 100%; border-collapse: collapse; font-size: 15px; text-align: left; line-height: 1.6;">
              <tr><td style="padding: 0 0 16px 0; color: #8B95A1; width: 120px;">유형</td><td style="padding: 0 0 16px 0; color: #333D4B; font-weight: 600;">${category}</td></tr>
              <tr><td style="padding: 0 0 16px 0; color: #8B95A1;">서비스</td><td style="padding: 0 0 16px 0; color: #333D4B;">${service || '미선택'}</td></tr>
              <tr><td style="padding: 0 0 16px 0; color: #8B95A1;">프로젝트명</td><td style="padding: 0 0 16px 0; color: #333D4B;">${displayTitle}</td></tr>
              <tr><td style="padding: 0 0 16px 0; color: #8B95A1;">의뢰인</td><td style="padding: 0 0 16px 0; color: #333D4B;">${contact_name}</td></tr>
              <tr><td style="padding: 0 0 16px 0; color: #8B95A1;">연락처</td><td style="padding: 0 0 16px 0; color: #333D4B;">${contact_phone || '미기재'}</td></tr>
              <tr><td style="padding: 0 0 16px 0; color: #8B95A1;">이메일</td><td style="padding: 0 0 16px 0; color: #333D4B;"><a href="mailto:${contact_email}" style="color: ${pointColor}; text-decoration: none;">${contact_email}</a></td></tr>
              <tr><td style="padding: 0 0 16px 0; color: #8B95A1;">일정</td><td style="padding: 0 0 16px 0; color: #333D4B;">${dateRange}</td></tr>
              <tr><td style="padding: 0 0 32px 0; color: #8B95A1;">예산</td><td style="padding: 0 0 32px 0; color: #333D4B;">${budget || '미선택'}</td></tr>
            </table>

            <div style="margin-top: 40px; padding: 30px; background-color: #F9FAFB; border-radius: 12px; border: 1px solid #eaeaea;">
              <h3 style="margin: 0 0 16px 0; font-size: 15px; color: #4E5968; font-weight: 600;">상세 내용</h3>
              <p style="margin: 0; color: #333D4B; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${info ? info : '작성된 상세 내용이 없습니다.'}</p>
            </div>

            ${fileUrl !== '없음' && fileUrl !== '업로드 실패' ? `
              <hr style="border: none; border-top: 1px solid #F2F4F6; margin: 40px 0 32px 0;" />
              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #191F28; font-weight: 600;">첨부파일 확인</h3>
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #8B95A1;">전달하신 자료입니다. 다운로드하여 확인해주세요!</p>
                
                <a href="${fileUrl}" target="_blank" style="display: inline-flex; align-items: center; background-color: #F2F4F6; padding: 16px 24px; border-radius: 8px; text-decoration: none; color: #333D4B;">
                  <span style="font-size: 20px; margin-right: 12px;">📁</span>
                  <div>
                    <div style="font-size: 15px; font-weight: 600; word-break: break-all;">${fileName}</div>
                    <div style="font-size: 13px; color: #8B95A1; margin-top: 4px;">해당 파일 확인하기</div>
                  </div>
                </a>
              </div>
            ` : ''}

            <div style="margin-top: 80px; padding-top: 24px; border-top: 1px solid #F2F4F6; color: #8B95A1; font-size: 13px; line-height: 1.5;">
              본 메일은 발신 전용이므로, 회신 내용을 확인할 수 없습니다.<br/>
              © 2026 JJI All rights reserved.
            </div>

          </div>
        </div>
      </div>
    `;

    // 4. 이메일 발송
    const { error } = await resend.emails.send({
      from: 'JJI <no-reply@jji.kr>', 
      to: [destinationEmail, contact_email],
      subject: `[JJI] ${contact_name}님, ${displayTitle} 의뢰가 접수되었습니다 💌`,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined, 
    });

    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: '서버 오류 발생' }, { status: 500 });
  }
}