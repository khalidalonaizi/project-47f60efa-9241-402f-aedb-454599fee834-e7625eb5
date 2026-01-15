import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
  user_id: string;
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
      user_id 
    }: NewOfferRequest = await req.json();

    console.log("Received new financing offer notification request:", { offer_id, company_name, company_type });

    // Get all users to notify (except the one who created the offer)
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id')
      .neq('user_id', user_id);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!allProfiles || allProfiles.length === 0) {
      console.log('No users to notify');
      return new Response(JSON.stringify({ message: 'No users to notify' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const companyTypeLabel = company_type === 'bank' ? 'بنك' : 'شركة تمويل';
    const formattedAmount = new Intl.NumberFormat('ar-SA').format(max_amount);

    // Create notifications for all users
    const notifications = allProfiles.map(profile => ({
      user_id: profile.user_id,
      type: 'new_financing_offer',
      title: '🏦 عرض تمويلي جديد',
      message: `تم إضافة عرض تمويلي جديد من "${company_name}" (${companyTypeLabel}) بفائدة ${interest_rate}% وحد أقصى ${formattedAmount} ر.س`,
      property_id: offer_id,
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      console.error('Error inserting notifications:', insertError);
      throw insertError;
    }

    console.log(`Successfully sent notifications to ${allProfiles.length} users`);

    return new Response(JSON.stringify({ success: true, notified_count: allProfiles.length }), {
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
