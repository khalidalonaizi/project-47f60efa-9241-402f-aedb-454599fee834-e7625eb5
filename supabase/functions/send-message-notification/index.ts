import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MessageNotificationRequest {
  receiverId: string;
  senderName: string;
  subject: string;
  propertyTitle?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { receiverId, senderName, subject, propertyTitle }: MessageNotificationRequest = await req.json();

    // Get receiver's email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(receiverId);
    
    if (userError || !userData?.user?.email) {
      console.error("Error fetching user:", userError);
      throw new Error("Could not find receiver email");
    }

    const receiverEmail = userData.user.email;

    // Send email using Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "عقارات <onboarding@resend.dev>",
        to: [receiverEmail],
        subject: "رسالة جديدة - " + subject,
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .content { padding: 30px; }
              .message-box { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-right: 4px solid #22c55e; }
              .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
              .btn { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📧 رسالة جديدة</h1>
              </div>
              <div class="content">
                <p>مرحباً،</p>
                <p>لقد تلقيت رسالة جديدة من <strong>${senderName}</strong></p>
                
                <div class="message-box">
                  <p><strong>الموضوع:</strong> ${subject}</p>
                  ${propertyTitle ? `<p><strong>العقار:</strong> ${propertyTitle}</p>` : ''}
                </div>
                
                <p>يرجى تسجيل الدخول للاطلاع على الرسالة والرد عليها.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} منصة عقارات - جميع الحقوق محفوظة</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-message-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
