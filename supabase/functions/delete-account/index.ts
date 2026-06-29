import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function getDefaultKey(envName: string) {
  const rawValue = Deno.env.get(envName);

  if (!rawValue) {
    return '';
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return parsedValue.default ?? '';
  } catch {
    return rawValue;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Método no permitido.',
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';

    const supabaseAnonKey =
      Deno.env.get('SUPABASE_ANON_KEY') ||
      getDefaultKey('SUPABASE_PUBLISHABLE_KEYS');

    const supabaseServiceRoleKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
      getDefaultKey('SUPABASE_SECRET_KEYS');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({
          error: 'Faltan variables de entorno en la función.',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const authorizationHeader = req.headers.get('Authorization');

    if (!authorizationHeader) {
      return new Response(
        JSON.stringify({
          error: 'Usuario no autenticado.',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authorizationHeader,
        },
      },
    });

    const adminSupabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    );

    const {
      data: { user },
      error: userError,
    } = await userSupabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: 'No se pudo validar el usuario.',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { data: imageFiles } = await adminSupabase.storage
      .from('trip-images')
      .list(user.id, {
        limit: 1000,
      });

    if (imageFiles && imageFiles.length > 0) {
      const imagePaths = imageFiles.map((file) => `${user.id}/${file.name}`);

      await adminSupabase.storage.from('trip-images').remove(imagePaths);
    }

    const { error: deleteUserError } =
      await adminSupabase.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      return new Response(
        JSON.stringify({
          error: deleteUserError.message,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Error inesperado.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});