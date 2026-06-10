import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
    }

    // Initialize administrative client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const password = "Grainline@seed2025!";
    const email = phone.replace("+", "").trim() + "@grainline.seed";

    // 1. Check if the user already has a profile (which links to auth.users)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, role, full_name")
      .eq("phone_number", phone)
      .maybeSingle();

    let userId: string;

    if (profile?.id) {
      userId = profile.id;
      // User exists, update auth.users details to ensure they have correct email/password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email,
        password,
        email_confirm: true,
      });
      if (updateError) {
        return NextResponse.json({ error: `Update user failed: ${updateError.message}` }, { status: 500 });
      }
    } else {
      // User doesn't exist, create them in auth.users
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "customer" },
      });
      if (createError || !createData.user) {
        return NextResponse.json({ error: `Create user failed: ${createError?.message || "unknown"}` }, { status: 500 });
      }

      userId = createData.user.id;

      // Create profile row (this will be handled by handles_new_user trigger, but since we are inserting email, 
      // the trigger handles new user insertion using COALESCE(raw_user_meta_data->>'role', 'customer'). 
      // But wait! Let's check if handles_new_user uses phone or email.
      // The handles_new_user trigger:
      // INSERT INTO public.profiles (id, phone_number, role) VALUES (new.id, new.phone, role)
      // Since we are signing up with email, new.phone will be NULL! So the trigger will NOT insert the phone number.
      // Thus, we must update the profile row to ensure it has the correct phone_number!
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({
          phone_number: phone,
          full_name: `User ${phone.slice(-4)}`
        })
        .eq("id", userId);
        
      if (profileError) {
        return NextResponse.json({ error: `Create profile failed: ${profileError.message}` }, { status: 500 });
      }
    }

    // 2. Sign in the user on the server to get a session
    const { data: sessionData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !sessionData.session) {
      return NextResponse.json({ error: signInError?.message || "Could not sign in" }, { status: 500 });
    }

    return NextResponse.json({ session: sessionData.session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
