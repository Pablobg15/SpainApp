import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appColors, appFonts } from '../theme';

type ErrorStateProps = {
  title?: string;
  message?: string;
  buttonText?: string;
  onRetry?: () => void;
};

export default function ErrorState({
  title = 'Algo salió mal',
  message = 'No se pudo cargar la información. Inténtalo de nuevo.',
  buttonText = 'Reintentar',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>⚠️</Text>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.message}>{message}</Text>

      {onRetry ? (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 42,
    marginBottom: 2,
  },
  title: {
    color: appColors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  message: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  button: {
    marginTop: 8,
    backgroundColor: appColors.white,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 22,
  },
  buttonText: {
    color: appColors.black,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
});