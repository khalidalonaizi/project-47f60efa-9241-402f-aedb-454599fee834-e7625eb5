import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewOfferRequest {
  offer_id: string;
  company_name: string;
  company_type: string;
  interest_rate: number;
  max_amount: number;
  user_name?: string;
  user_email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      offer_id, 
      company_name, 
      company_type, 
      interest_rate, 
      max_amount,
      user_name,
      user_email 
    }: NewOfferRequest = await req.json();

    // Get admin users
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (rolesError) {
      console.error('Error fetching admin roles:', rolesError);
      throw rolesError;
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log('No admin users found');
      return new Response(JSON.stringify({ message: 'No admins to notify' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get admin emails from auth.users (using service role)
    const adminUserIds = adminRoles.map(r => r.user_id);
    
    // For each admin, send notification email
    const companyTypeLabel = company_type === 'bank' ? 'بنك' : 'شركة تمويل';
    const formattedAmount = new Intl.NumberFormat('ar-SA').format(max_amount);

    // Create notifications in database
    for (const adminId of adminUserIds) {
      await supabase.from('notifications').insert({
        user_id: adminId,
        type: 'new_financing_offer',
        title: 'عرض تمويلي جديد بانتظار المراجعة',
        message: `تم إضافة عرض تمويلي جديد من "${company_name}" (${companyTypeLabel}) بانتظار موافقتك.`,
      });
    }

    // Get profiles with emails for admins
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', adminUserIds);

    // Send email notification (to the first admin for now, or use a configured admin email)
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    
    if (adminEmail) {
      const emailResponse = await resend.emails.send({
        from: "عقارات <onboarding@resend.dev>",
        to: [adminEmail],
        subject: "عرض تمويلي جديد بانتظار المراجعة",
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; background: #f5f5f5; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #14B8A6, #0D9488); color: white; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 30px; }
              .info-box { background: #f0fdfa; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0f2f1; }
              .info-row:last-child { border-bottom: none; }
              .info-label { color: #6b7280; }
              .info-value { font-weight: bold; color: #1f2937; }
              .cta-button { display: inline-block; background: #14B8A6; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
              .footer { background: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏦 عرض تمويلي جديد</h1>
              </div>
              <div class="content">
                <p>مرحباً،</p>
                <p>تم إضافة عرض تمويلي جديد وهو بانتظار مراجعتك وموافقتك.</p>
                
                <div class="info-box">
                  <div class="info-row">
                    <span class="info-label">اسم الجهة:</span>
                    <span class="info-value">${company_name}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">نوع الجهة:</span>
                    <span class="info-value">${companyTypeLabel}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">معدل الفائدة:</span>
                    <span class="info-value">${interest_rate}%</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">الحد الأقصى للتمويل:</span>
                    <span class="info-value">${formattedAmount} ر.س</span>
                  </div>
                  ${user_name ? `
                  <div class="info-row">
                    <span class="info-label">مقدم الطلب:</span>
                    <span class="info-value">${user_name}</span>
                  </div>
                  ` : ''}
                </div>
                
                <p>يرجى مراجعة العرض واتخاذ الإجراء المناسب.</p>
                
                <a href="${supabaseUrl.replace('.supabase.co', '')}/admin/financing-offers" class="cta-button">
                  مراجعة العرض
                </a>
              </div>
              <div class="footer">
                <p>هذا البريد تلقائي من نظام إدارة العقارات</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log("Email sent successfully:", emailResponse);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-new-financing-offer function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
