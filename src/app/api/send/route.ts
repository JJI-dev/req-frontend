import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// 환경 변수 확인 로직 추가
const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey || 're_dummy_key');

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    const { 
      type, service, name, date_start, date_end, budget, 
      info, contact_name, contact_phone, contact_email 
    } = formData;

    const themeKor = type === 'creative' ? '창작 의뢰' : '제품 의뢰';

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
        <p><strong>이메일:</strong> ${contact_email}</p>
        <div style="background: #f5f5f5; padding: 15px; margin-top: 20px;">
          <strong>상세 내용:</strong><br/>
          ${info ? info.replace(/\n/g, '<br/>') : '없음'}
        </div>
      </div>
    `;

    // 수신자 목록 정리
    // 1. 관리자 이메일을 실제 본인 이메일로 꼭 바꾸세요!
    const adminEmail = "contact@jji.kr"; 
    
    // 무료 티어인 경우 contact_email이 본인 이메일이 아니면 오류가 날 수 있습니다.
    const recipients = [adminEmail];
    if (contact_email && contact_email !== adminEmail) {
      recipients.push(contact_email);
    }

    const { data, error } = await resend.emails.send({
      from: 'JJI Project <contact@jji.kr>', 
      to: recipients,
      subject: `[JJI 의뢰 접수 완료] ${name || themeKor}건 안내`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: '서버 오류 발생' }, { status: 500 });
  }
} 