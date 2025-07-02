import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xagpxjihriozpjpoffeo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZ3B4amlocmlvenBqcG9mZmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNzcyNDIsImV4cCI6MjA2Njk1MzI0Mn0.53tVUf1PibQ7_l1I5LwGpwmHsD82OO2sCopyOldlmZE";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
