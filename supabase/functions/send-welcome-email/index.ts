import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, full_name } = await req.json();

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "عقار السعودية <onboarding@resend.dev>",
        to: [email],
        subject: "مرحباً بك في عقار السعودية! 🎉",
        html: `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🏠 عقار السعودية</h1>
              <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">منصة العقارات الأولى في المملكة</p>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-top: 0;">مرحباً ${full_name || "بك"}! 👋</h2>
              <p style="color: #4b5563; line-height: 1.8;">
                تم تفعيل حسابك بنجاح في منصة عقار السعودية. يسعدنا انضمامك إلى مجتمعنا العقاري.
              </p>
              <p style="color: #4b5563; line-height: 1.8;">
                يمكنك الآن الاستفادة من جميع خدمات المنصة:
              </p>
              <ul style="color: #4b5563; line-height: 2;">
                <li>البحث عن العقارات في جميع مدن المملكة</li>
                <li>نشر إعلانات العقارات</li>
                <li>مقارنة عروض التمويل العقاري</li>
                <li>طلب تقييم عقاري احترافي</li>
                <li>التواصل المباشر مع الملاك والمكاتب العقارية</li>
              </ul>
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://aqar-saudi.lovable.app" style="background: #14B8A6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                  ابدأ التصفح الآن
                </a>
              </div>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
                هذه الرسالة مرسلة تلقائياً من منصة عقار السعودية
              </p>
            </div>
          </div>
        `,
      }),
    });

    const data = await res.json();
    console.log("Welcome email sent:", data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
