import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { appColors, appFonts } from '../theme';

type AuthMode = 'login' | 'register';

type AuthScreenProps = {
  onAuthSuccess: () => void;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getAuthErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Tienes que confirmar tu email antes de entrar.';
  }

  if (normalizedMessage.includes('user already registered')) {
    return 'Ya existe una cuenta con este email.';
  }

  if (normalizedMessage.includes('password')) {
    return 'La contraseña no cumple los requisitos.';
  }

  return 'Ha ocurrido un error. Inténtalo de nuevo.';
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === 'register';

  const canContinue = isRegister
    ? Boolean(
        name.trim() &&
          email.trim() &&
          password.trim() &&
          repeatPassword.trim() &&
          !isLoading
      )
    : Boolean(email.trim() && password.trim() && !isLoading);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorMessage('');
    setInfoMessage('');
    setPassword('');
    setRepeatPassword('');
  }

  async function submitAuth() {
    setErrorMessage('');
    setInfoMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Introduce un email válido.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (isRegister && password !== repeatPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    try {
      setIsLoading(true);

      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanName,
            },
          },
        });

        if (error) {
          setErrorMessage(getAuthErrorMessage(error.message));
          return;
        }

        if (!data.session) {
          setInfoMessage(
            'Cuenta creada. Revisa tu email para confirmar la cuenta antes de entrar.'
          );
          return;
        }

        onAuthSuccess();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setErrorMessage(getAuthErrorMessage(error.message));
        return;
      }

      onAuthSuccess();
    } catch {
      setErrorMessage('No se pudo conectar con Supabase.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.brandBlock}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>S</Text>
          </View>

          <Text style={styles.eyebrow}>Spain Travel Map</Text>

          <Text style={styles.title}>España</Text>

          <Text style={styles.subtitle}>
            Marca provincias, guarda viajes y completa retos por España.
          </Text>
        </View>

        <View style={styles.modeSwitch}>
          <Pressable
            style={[
              styles.modeButton,
              mode === 'login' && styles.modeButtonActive,
            ]}
            onPress={() => changeMode('login')}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === 'login' && styles.modeButtonTextActive,
              ]}
            >
              Entrar
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.modeButton,
              mode === 'register' && styles.modeButtonActive,
            ]}
            onPress={() => changeMode('register')}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === 'register' && styles.modeButtonTextActive,
              ]}
            >
              Crear cuenta
            </Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          {isRegister ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ej. Pablo"
                placeholderTextColor={appColors.textMuted}
                style={styles.input}
              />
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="tuemail@gmail.com"
              placeholderTextColor={appColors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={appColors.textMuted}
              style={styles.input}
              secureTextEntry
            />
          </View>          {isRegister ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Repetir contraseña</Text>

              <TextInput
                value={repeatPassword}
                onChangeText={setRepeatPassword}
                placeholder="Repite tu contraseña"
                placeholderTextColor={appColors.textMuted}
                style={styles.input}
                secureTextEntry
              />
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {infoMessage ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>{infoMessage}</Text>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.submitButton,
              !canContinue && styles.submitButtonDisabled,
            ]}
            onPress={submitAuth}
            disabled={!canContinue}
          >
            {isLoading ? (
              <ActivityIndicator color={appColors.black} />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  !canContinue && styles.submitButtonTextDisabled,
                ]}
              >
                {isRegister ? 'Crear cuenta' : 'Entrar'}
              </Text>
            )}
          </Pressable>

          <Text style={styles.helperText}>
            {isRegister
              ? 'Al crear cuenta, tus viajes y provincias se guardarán en Supabase.'
              : 'Accede para recuperar tu mapa y tus viajes.'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.black,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: appColors.surface,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 22,
    gap: 22,
  },
  brandBlock: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  logoMark: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  logoText: {
    color: appColors.black,
    fontSize: 31,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  eyebrow: {
    color: appColors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: appFonts.main,
  },
  title: {
    color: appColors.text,
    fontSize: 46,
    lineHeight: 52,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  subtitle: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
    fontFamily: appFonts.main,
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: appColors.surfaceSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: appColors.white,
  },
  modeButtonText: {
    color: appColors.textMuted,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  modeButtonTextActive: {
    color: appColors.black,
  },
  form: {
    gap: 15,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: appColors.textSecondary,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  input: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 17,
    color: appColors.text,
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 14,
    outlineStyle: 'none' as any,
    fontFamily: appFonts.main,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: appColors.home,
    borderRadius: 16,
    padding: 13,
  },
  errorText: {
    color: appColors.home,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  infoCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: appColors.visited,
    borderRadius: 16,
    padding: 13,
  },
  infoText: {
    color: appColors.visited,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  submitButton: {
    backgroundColor: appColors.white,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 2,
    minHeight: 51,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: appColors.surfaceSoft,
  },
  submitButtonText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  submitButtonTextDisabled: {
    color: appColors.textMuted,
  },
  helperText: {
    color: appColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
});