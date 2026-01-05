import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Equipment {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  verification_valid_until: string | null;
  company_id: string;
}

interface Company {
  id: string;
  name: string;
  email: string | null;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company_id: string;
}

interface AdminUser {
  email: string;
  first_name: string | null;
  last_name: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Starting equipment expiry check...");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Calculate date 30 days from now
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0];
    
    console.log(`Checking for equipment expiring between ${todayStr} and ${thirtyDaysStr}`);
    
    // Get equipment expiring in the next 30 days
    const { data: expiringEquipment, error: equipmentError } = await supabase
      .from("equipment")
      .select("*")
      .eq("is_active", true)
      .gte("verification_valid_until", todayStr)
      .lte("verification_valid_until", thirtyDaysStr);
    
    if (equipmentError) {
      console.error("Error fetching equipment:", equipmentError);
      throw equipmentError;
    }
    
    console.log(`Found ${expiringEquipment?.length || 0} expiring equipment items`);
    
    if (!expiringEquipment || expiringEquipment.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expiring equipment found", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Group equipment by company
    const equipmentByCompany = new Map<string, Equipment[]>();
    for (const eq of expiringEquipment) {
      const companyId = eq.company_id;
      if (!equipmentByCompany.has(companyId)) {
        equipmentByCompany.set(companyId, []);
      }
      equipmentByCompany.get(companyId)!.push(eq);
    }
    
    console.log(`Equipment grouped into ${equipmentByCompany.size} companies`);
    
    let emailsSent = 0;
    const errors: string[] = [];
    
    // Send emails for each company
    for (const [companyId, equipmentList] of equipmentByCompany) {
      try {
        // Get company info
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("id, name, email")
          .eq("id", companyId)
          .single();
        
        if (companyError || !company) {
          console.error(`Error fetching company ${companyId}:`, companyError);
          continue;
        }
        
        // Get admin users for this company
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, company_id")
          .eq("company_id", companyId);
        
        if (profilesError) {
          console.error(`Error fetching profiles for company ${companyId}:`, profilesError);
          continue;
        }
        
        // Get admin emails
        const adminEmails: AdminUser[] = [];
        
        for (const profile of profiles || []) {
          // Check if user is admin
          const { data: userRole } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id)
            .eq("role", "admin")
            .single();
          
          if (userRole) {
            // Get user email from auth
            const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
            if (user?.email) {
              adminEmails.push({
                email: user.email,
                first_name: profile.first_name,
                last_name: profile.last_name,
              });
            }
          }
        }
        
        // If no admin emails, try company email
        const recipientEmails = adminEmails.length > 0 
          ? adminEmails.map(a => a.email)
          : company.email ? [company.email] : [];
        
        if (recipientEmails.length === 0) {
          console.log(`No email recipients found for company ${company.name}`);
          continue;
        }
        
        console.log(`Sending email to ${recipientEmails.join(", ")} for company ${company.name}`);
        
        // Build equipment table HTML
        const equipmentRows = equipmentList.map(eq => {
          const expiryDate = new Date(eq.verification_valid_until!);
          const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const urgencyColor = daysLeft <= 7 ? "#dc2626" : daysLeft <= 14 ? "#f59e0b" : "#16a34a";
          
          return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${eq.name}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${eq.manufacturer || "-"} ${eq.model || ""}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${eq.serial_number || "-"}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${expiryDate.toLocaleDateString("ro-RO")}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: ${urgencyColor}; font-weight: 600;">${daysLeft} zile</td>
            </tr>
          `;
        }).join("");
        
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Notificare Expirare Verificare Metrologică</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f3f4f6;">
            <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Atenție: Verificări Metrologice în Expirare</h1>
              </div>
              
              <div style="padding: 30px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Bună ziua,
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Următoarele echipamente din <strong>${company.name}</strong> au verificarea metrologică ce expiră în următoarele 30 de zile:
                </p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                  <thead>
                    <tr style="background-color: #f9fafb;">
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Echipament</th>
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Producător/Model</th>
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Serie</th>
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Data Expirării</th>
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Zile Rămase</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${equipmentRows}
                  </tbody>
                </table>
                
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>Important:</strong> Vă rugăm să programați reverificarea echipamentelor înainte de expirare pentru a asigura continuitatea activității și conformitatea cu reglementările în vigoare.
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  Cu stimă,<br>
                  Echipa ${company.name}
                </p>
              </div>
              
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Acest email a fost trimis automat. Vă rugăm să nu răspundeți la acest mesaj.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        // Send email using Resend API directly
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Verificări Echipamente <notificari@romarg.ro>",
            to: recipientEmails,
            subject: `⚠️ ${equipmentList.length} echipament${equipmentList.length > 1 ? "e" : ""} cu verificare în expirare - ${company.name}`,
            html: emailHtml,
          }),
        });
        
        const emailResult = await emailResponse.json();
        
        if (!emailResponse.ok) {
          console.error(`Error sending email for company ${company.name}:`, emailResult);
          errors.push(`${company.name}: ${JSON.stringify(emailResult)}`);
        } else {
          emailsSent++;
          console.log(`Email sent successfully for company ${company.name}`);
        }
        
      } catch (companyError) {
        console.error(`Error processing company ${companyId}:`, companyError);
        errors.push(`Company ${companyId}: ${companyError}`);
      }
    }
    
    const result = {
      message: `Equipment expiry check completed`,
      expiringEquipmentCount: expiringEquipment.length,
      companiesNotified: equipmentByCompany.size,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    };
    
    console.log("Check completed:", result);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error: any) {
    console.error("Error in check-equipment-expiry function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
