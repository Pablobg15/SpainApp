import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';
import { appColors, appFonts } from '../theme';
import LegalFooter from './LegalFooter';

type SettingsModalProps = {
  visible: boolean;
  profileName: string;
  isSavingName: boolean;
  isChangingPhoto: boolean;
  onClose: () => void;
  onSaveName: (name: string) => Promise<void>;
  onChangePhoto: () => Promise<void> | void;
  onLogout: () => Promise<void> | void;
  onDeleteAccount: () => Promise<void> | void;
};

export default function SettingsModal({
  visible,
  profileName,
  isSavingName,
  isChangingPhoto,
  onClose,
  onSaveName,
  onChangePhoto,
  onLogout,
  onDeleteAccount,
}: SettingsModalProps) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 520;

  const [name, setName] = useState(profileName);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (visible) {
      setName(profileName);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [visible, profileName]);

  async function handleSaveName() {
    const cleanName = name.trim();

    setErrorMessage('');
    setSuccessMessage('');

    if (cleanName.length < 2) {
      setErrorMessage('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    try {
      await onSaveName(cleanName);
      setSuccessMessage('Nombre actualizado correctamente.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el nombre.';

      setErrorMessage(message);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isMobile ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          isMobile && styles.overlayMobile,
        ]}
      >
        <View
          style={[
            styles.card,
            isMobile && styles.cardMobile,
            {
              maxHeight: isMobile ? height * 0.84 : height * 0.88,
            },
          ]}
        >
          {isMobile ? <View style={styles.mobileHandle} /> : null}

          <View style={[styles.header, isMobile && styles.headerMobile]}>
            <View style={styles.headerTextBlock}>
              <Text style={[styles.title, isMobile && styles.titleMobile]}>
                Ajustes
              </Text>

              <Text style={styles.subtitle}>
                Gestiona tu perfil, privacidad y cuenta.
              </Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.content,
              isMobile && styles.contentMobile,
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Perfil</Text>

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

              {errorMessage ? (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              ) : null}

              {successMessage ? (
                <Text style={styles.successMessage}>{successMessage}</Text>
              ) : null}

              <Pressable
                style={[
                  styles.primaryButton,
                  isSavingName && styles.disabledButton,
                ]}
                onPress={handleSaveName}
                disabled={isSavingName}
              >
                {isSavingName ? (
                  <ActivityIndicator color={appColors.black} />
                ) : (
                  <Text style={styles.primaryButtonText}>Guardar nombre</Text>
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.secondaryButton,
                  isChangingPhoto && styles.disabledButton,
                ]}
                onPress={onChangePhoto}
                disabled={isChangingPhoto}
              >
                {isChangingPhoto ? (
                  <ActivityIndicator color={appColors.text} />
                ) : (
                  <Text style={styles.secondaryButtonText}>Cambiar foto</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Legal y privacidad</Text>

              <LegalFooter />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cuenta</Text>

              <Pressable style={styles.secondaryButton} onPress={onLogout}>
                <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
              </Pressable>

              <Pressable style={styles.dangerButton} onPress={onDeleteAccount}>
                <Text style={styles.dangerButtonText}>Eliminar cuenta</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  overlayMobile: {
    justifyContent: 'flex-end',
    padding: 0,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: appColors.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: appColors.border,
    overflow: 'hidden',
  },
  cardMobile: {
    maxWidth: '100%',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  mobileHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: appColors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: appColors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  headerMobile: {
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    color: appColors.text,
    fontSize: 28,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  titleMobile: {
    fontSize: 25,
  },
  subtitle: {
    color: appColors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
    fontFamily: appFonts.main,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: appColors.text,
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 27,
  },
  content: {
    padding: 20,
    gap: 18,
  },
  contentMobile: {
    padding: 14,
    paddingBottom: 28,
    gap: 14,
  },
  section: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 24,
    padding: 16,
    gap: 13,
  },
  sectionTitle: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: appColors.textSecondary,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  input: {
    backgroundColor: appColors.background,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: appColors.text,
    fontSize: 15,
    fontFamily: appFonts.main,
  },
  primaryButton: {
    backgroundColor: appColors.white,
    borderRadius: 17,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryButtonText: {
    color: appColors.black,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  secondaryButton: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 17,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  secondaryButtonText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.38)',
    borderRadius: 17,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  dangerButtonText: {
    color: '#FCA5A5',
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  disabledButton: {
    opacity: 0.65,
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
});