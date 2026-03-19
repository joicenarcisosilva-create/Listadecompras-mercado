// Importa a função de criação do client Supabase via CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Cria o client com a URL e a chave fornecidas
export const supabase = createClient(
  'https://ixugmhmmnvobcnzkqygu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaHJic29xaXNxaWF1b2JqYnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MzcxMjUsImV4cCI6MjA4ODExMzEyNX0.SMzIRgNPZ4sWsHpkh1FDSWJtHZp08_dAHv-dZXw6xfk'
)
    