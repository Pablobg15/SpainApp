import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { appColors, appFonts } from '../theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.icon}>🧭</Text>

        <Text style={styles.title}>Página no encontrada</Text>

        <Text style={styles.message}>
          La ruta que estás buscando no existe o se ha movido.
        </Text>

        <Link href="/" style={styles.button}>
          Volver al inicio
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
  },
  icon: {
    fontSize: 50,
    marginBottom: 14,
  },
  title: {
    color: appColors.text,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: appFonts.main,
  },
  message: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: appFonts.main,
  },
  button: {
    backgroundColor: appColors.white,
    color: appColors.black,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 22,
    fontSize: 15,
    fontWeight: '900',
    overflow: 'hidden',
    fontFamily: appFonts.main,
  },
});