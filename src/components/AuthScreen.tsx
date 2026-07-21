import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { appColors, appFonts } from '../theme';
import LegalFooter from './LegalFooter';

export default function AuthScreen() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [resetEmail, setResetEmail] = useState('');
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [resetErrorMessage, setResetErrorMessage] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  async function handleSubmit() {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    setErrorMessage('');
    setSuccessMessage('');

    if (isRegisterMode && cleanName.length < 2) {
      setErrorMessage('Introduce tu nombre.');
      return;
    }

    if (!cleanEmail) {
      setErrorMessage('Introduce tu email.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);

      if (isRegisterMode) {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanName,
            },
          },
        });

        if (error) {
          throw error;
        }

        setSuccessMessage('Cuenta creada correctamente.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          throw error;
        }

        setSuccessMessage('Sesión iniciada correctamente.');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo completar la acción. Inténtalo de nuevo.';

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleAuthMode() {
    setIsRegisterMode((currentMode) => !currentMode);
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
  }

  function openResetModal() {
    setResetEmail(email.trim().toLowerCase());
    setResetErrorMessage('');
    setResetSuccessMessage('');
    setIsResetModalVisible(true);
  }

  function closeResetModal() {
    setIsResetModalVisible(false);
    setResetErrorMessage('');
    setResetSuccessMessage('');
  }

  async function handleForgotPassword() {
    const cleanEmail = resetEmail.trim().toLowerCase();

    setResetErrorMessage('');
    setResetSuccessMessage('');

    if (!cleanEmail) {
      setResetErrorMessage('Introduce tu email.');
      return;
    }

    try {
      setIsResetLoading(true);

      const redirectTo =
        Platform.OS === 'web' && typeof window !== 'undefined'
          ? window.location.origin
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      if (error) {
        throw error;
      }

      setResetSuccessMessage(
        'Te hemos enviado un email para restablecer la contraseña.'
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo enviar el email de recuperación.';

      setResetErrorMessage(message);
    } finally {
      setIsResetLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.logo}>🧭</Text>

            <Text style={styles.title}>SpainApp</Text>

            <Text style={styles.subtitle}>
              Marca las provincias que has visitado, guarda tus viajes y
              comparte tu progreso.
            </Text>
          </View>

          <View style={styles.form}>
            {isRegisterMode ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre</Text>

                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Tu nombre"
                  placeholderTextColor={appColors.textMuted}
                  autoCapitalize="words"
                />
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                placeholderTextColor={appColors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={appColors.textMuted}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {errorMessage ? (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}

            {successMessage ? (
              <Text style={styles.successMessage}>{successMessage}</Text>
            ) : null}

            <Pressable
              style={[styles.mainButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={appColors.black} />
              ) : (
                <Text style={styles.mainButtonText}>
                  {isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión'}
                </Text>
              )}
            </Pressable>

            {!isRegisterMode ? (
              <Pressable style={styles.forgotButton} onPress={openResetModal}>
                <Text style={styles.forgotButtonText}>
                  ¿Has olvidado la contraseña?
                </Text>
              </Pressable>
            ) : null}

            <Pressable style={styles.switchButton} onPress={toggleAuthMode}>
              <Text style={styles.switchButtonText}>
                {isRegisterMode
                  ? 'Ya tengo cuenta, iniciar sesión'
                  : 'No tengo cuenta, registrarme'}
              </Text>
            </Pressable>
          </View>
        </View>

        <LegalFooter />
      </ScrollView>

      <Modal
        visible={isResetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeResetModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBlock}>
                <Text style={styles.modalTitle}>Recuperar contraseña</Text>

                <Text style={styles.modalSubtitle}>
                  Te enviaremos un email para restablecer tu contraseña.
                </Text>
              </View>

              <Pressable style={styles.modalCloseButton} onPress={closeResetModal}>
                <Text style={styles.modalCloseButtonText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>

              <TextInput
                style={styles.input}
                value={resetEmail}
                onChangeText={setResetEmail}
                placeholder="tu@email.com"
                placeholderTextColor={appColors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {resetErrorMessage ? (
              <Text style={styles.errorMessage}>{resetErrorMessage}</Text>
            ) : null}

            {resetSuccessMessage ? (
              <Text style={styles.successMessage}>{resetSuccessMessage}</Text>
            ) : null}

            <Pressable
              style={[
                styles.mainButton,
                isResetLoading && styles.disabledButton,
              ]}
              onPress={handleForgotPassword}
              disabled={isResetLoading}
            >
              {isResetLoading ? (
                <ActivityIndicator color={appColors.black} />
              ) : (
                <Text style={styles.mainButtonText}>Enviar email</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
    gap: 18,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: appColors.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 24,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 54,
    marginBottom: 4,
  },
  title: {
    color: appColors.text,
    fontSize: 38,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  subtitle: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  form: {
    gap: 15,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  input: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    color: appColors.text,
    fontSize: 15,
    fontFamily: appFonts.main,
  },
  mainButton: {
    backgroundColor: appColors.white,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.72,
  },
  mainButtonText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  forgotButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  forgotButtonText: {
    color: appColors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
    textDecorationLine: 'underline',
    fontFamily: appFonts.main,
  },
  switchButton: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  switchButtonText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  errorMessage: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  successMessage: {
    color: '#86EFAC',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: appColors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 20,
    gap: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  modalTitleBlock: {
    flex: 1,
  },
  modalTitle: {
    color: appColors.text,
    fontSize: 25,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  modalSubtitle: {
    color: appColors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
    fontFamily: appFonts.main,
  },
  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 26,
  },
});