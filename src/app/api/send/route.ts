import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    const { 
      type, service, name, date_start, date_end, budget, 
      info, contact_name, contact_phone, contact_email 
    } = formData;

    const themeKor = type === 'creative' ? '창작 의뢰' : '제품 의뢰';

    // 작성자에게 보내는 안내 이메일 내용
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${contact_name}님, 프로젝트 의뢰가 성공적으로 접수되었습니다.</h2>
        <p>요청하신 내용을 바탕으로 검토 후 3~4일 이내에 연락드리겠습니다.</p>
        <hr style="margin: 20px 0;" />
        <h3>[접수 내역]</h3>
        <p><strong>의뢰 유형:</strong> ${themeKor} - ${service}</p>
        <p><strong>프로젝트명:</strong> ${name || '미입력'}</p>
        <p><strong>일정:</strong> ${date_start || ''} ~ ${date_end || ''}</p>
        <p><strong>예산:</strong> ${budget || '미입력'}</p>
        <p><strong>연락처:</strong> ${contact_phone || '미입력'}</p>
        <div style="background: #f5f5f5; padding: 15px; margin-top: 20px;">
          <strong>상세 내용:</strong><br/>
          ${info ? info.replace(/\n/g, '<br/>') : '없음'}
        </div>
      </div>
    `;

    // 1. 관리자(JJI)와 2. 의뢰인 모두에게 발송
    const data = await resend.emails.send({
      from: 'JJI Project <onboarding@resend.dev>', // 실 서비스 시 도메인 인증 후 noreply@jji.kr 등으로 변경
      to: ['your-email@example.com', contact_email], // 관리자 메일 + 의뢰인 메일 동시 전송
      subject: `[JJI 의뢰 접수 완료] ${name || themeKor}건 안내`,
      html: emailHtml,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}