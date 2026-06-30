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

type AuthScreenProps = {
  onAuthSuccess: () => void;
};

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
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
    const cleanPassword = password.trim();

    setErrorMessage('');
    setSuccessMessage('');

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Escribe tu email y tu contraseña.');
      return;
    }

    if (isRegisterMode && !cleanName) {
      setErrorMessage('Escribe tu nombre.');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    if (isRegisterMode) {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            name: cleanName,
          },
        },
      });

      setIsLoading(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage('Cuenta creada correctamente.');
      onAuthSuccess();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    onAuthSuccess();
  }

  function openResetModal() {
    setResetEmail(email.trim().toLowerCase());
    setResetErrorMessage('');
    setResetSuccessMessage('');
    setIsResetModalVisible(true);
  }

  function closeResetModal() {
    if (isResetLoading) {
      return;
    }

    setIsResetModalVisible(false);
    setResetErrorMessage('');
    setResetSuccessMessage('');
  }

  async function handleForgotPassword() {
    const cleanEmail = resetEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setResetErrorMessage('Escribe tu email para recuperar la contraseña.');
      return;
    }

    setIsResetLoading(true);
    setResetErrorMessage('');
    setResetSuccessMessage('');

    const redirectTo =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });

    setIsResetLoading(false);

    if (error) {
      setResetErrorMessage(error.message);
      return;
    }

    setResetSuccessMessage(
      'Te hemos enviado un email para recuperar tu contraseña.'
    );
  }

  function toggleMode() {
    setIsRegisterMode((currentValue) => !currentValue);
    setErrorMessage('');
    setSuccessMessage('');
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>S</Text>
          </View>

          <Text style={styles.title}>
            {isRegisterMode ? 'Crea tu cuenta' : 'Bienvenido'}
          </Text>

          <Text style={styles.subtitle}>
            {isRegisterMode
              ? 'Empieza a guardar tus viajes por España.'
              : 'Entra para ver tu mapa, viajes y retos.'}
          </Text>

          {isRegisterMode ? (
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Nombre</Text>

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre"
                placeholderTextColor={appColors.textMuted}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
          ) : null}

          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>Email</Text>

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor={appColors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>Contraseña</Text>

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={appColors.textMuted}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {errorMessage ? (
            <View style={styles.messageBoxError}>
              <Text style={styles.messageTextError}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.messageBoxSuccess}>
              <Text style={styles.messageTextSuccess}>{successMessage}</Text>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.primaryButton,
              isLoading && styles.primaryButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={appColors.black} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isRegisterMode ? 'Crear cuenta' : 'Entrar'}
              </Text>
            )}
          </Pressable>

          {!isRegisterMode ? (
            <Pressable
              style={styles.forgotPasswordButton}
              onPress={openResetModal}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>
                He olvidado mi contraseña
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            style={styles.secondaryButton}
            onPress={toggleMode}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>
              {isRegisterMode
                ? 'Ya tengo cuenta'
                : 'No tengo cuenta, registrarme'}
            </Text>
          </Pressable>
        </View>
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
                  Escribe tu email y te enviaremos un enlace para cambiarla.
                </Text>
              </View>

              <Pressable
                style={styles.modalCloseButton}
                onPress={closeResetModal}
                disabled={isResetLoading}
              >
                <Text style={styles.modalCloseButtonText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Email</Text>

              <TextInput
                style={styles.input}
                value={resetEmail}
                onChangeText={setResetEmail}
                placeholder="tu@email.com"
                placeholderTextColor={appColors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!isResetLoading}
              />
            </View>

            {resetErrorMessage ? (
              <View style={styles.messageBoxError}>
                <Text style={styles.messageTextError}>
                  {resetErrorMessage}
                </Text>
              </View>
            ) : null}

            {resetSuccessMessage ? (
              <View style={styles.messageBoxSuccess}>
                <Text style={styles.messageTextSuccess}>
                  {resetSuccessMessage}
                </Text>
              </View>
            ) : null}

            <Pressable
              style={[
                styles.primaryButton,
                isResetLoading && styles.primaryButtonDisabled,
              ]}
              onPress={handleForgotPassword}
              disabled={isResetLoading}
            >
              {isResetLoading ? (
                <ActivityIndicator color={appColors.black} />
              ) : (
                <Text style={styles.primaryButtonText}>Enviar email</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.modalSecondaryButton}
              onPress={closeResetModal}
              disabled={isResetLoading}
            >
              <Text style={styles.modalSecondaryButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  container: {
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: appColors.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 24,
  },
  logoCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logoText: {
    color: appColors.black,
    fontSize: 30,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  title: {
    color: appColors.text,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
    fontFamily: appFonts.main,
  },
  subtitle: {
    color: appColors.textSecondary,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 24,
    fontFamily: appFonts.main,
  },
  inputBlock: {
    marginBottom: 14,
  },
  inputLabel: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
    fontFamily: appFonts.main,
  },
  input: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: appColors.text,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: appFonts.main,
  },
  messageBoxError: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: appColors.home,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  messageTextError: {
    color: appColors.home,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    fontFamily: appFonts.main,
  },
  messageBoxSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: appColors.visited,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  messageTextSuccess: {
    color: appColors.visited,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    fontFamily: appFonts.main,
  },
  primaryButton: {
    backgroundColor: appColors.white,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  forgotPasswordButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: appColors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: appFonts.main,
    textDecorationLine: 'underline',
  },
  secondaryButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: appColors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 18,
  },
  modalTitleBlock: {
    flex: 1,
  },
  modalTitle: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
    fontFamily: appFonts.main,
  },
  modalSubtitle: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
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
    fontWeight: '700',
    lineHeight: 25,
    fontFamily: appFonts.main,
  },
  modalSecondaryButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    color: appColors.textSecondary,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
});